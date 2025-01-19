from typing import List
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from database import engine, get_db, Base
from models import User, Event, EventRegistration, Sponsorship
from schemas import (
    EventRegistrationSchema,
    UserCreate,
    UserResponse,
    UserLoginResponse,
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
    EventRegistrationResponse,
    SponsorshipCreate,
    SponsorshipResponse,
)

# FastAPI app
app = FastAPI()


# Initialize database
Base.metadata.create_all(bind=engine)

# Security configuration
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "sub": str(data["sub"])})  
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))  # Convert "sub" to an integer
        user_type: str = payload.get("user_type")

        if user_id is None or user_type is None:
            raise HTTPException(status_code=401, detail="Invalid token structure")

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except JWTError as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")


# Dependency to check user type
def authorize_user(allowed_user_types: List[str]):
    def dependency(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.user_type not in allowed_user_types:
            raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        return current_user
    return dependency

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# User registration
@app.post("/users/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    new_user = User(
        user_type=user.user_type,
        name=user.name,
        email=user.email,
        password=hashed_password,
        organization_name=user.organization_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        user_type=new_user.user_type,
        organization_name=new_user.organization_name,
    )

# User login
@app.post("/users/login", response_model=UserLoginResponse)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": user.id, "user_type": user.user_type})
    logger.info(f"User  {user.email} logged in successfully. Access token created.")
    
    return UserLoginResponse(
        access_token=access_token,
        user_type=user.user_type,
    )

# Create an event
@app.post("/events", response_model=EventResponse, dependencies=[Depends(authorize_user(["ministry"]))])
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    new_event = Event(
        title=event.title,
        location=event.location,
        date=event.date,
        max_volunteers=event.max_volunteers,
        description=event.description,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return EventResponse(
        id=new_event.id,
        title=new_event.title,
        location=new_event.location,
        date=new_event.date,
        current_volunteers=0,
        max_volunteers=new_event.max_volunteers,
        description=new_event.description,
    )

# Update an event
@app.put("/events/{event_id}", response_model=EventResponse, dependencies=[Depends(authorize_user(["ministry"]))])
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in event.model_dump(exclude_unset=True).items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return EventResponse(
        id=db_event.id,
        title=db_event.title,
        location=db_event.location,
        date=db_event.date,
        current_volunteers=0,
        max_volunteers=db_event.max_volunteers,
        description=db_event.description,
    )

# List all events
@app.get("/events", response_model=List[EventListResponse])
def list_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    return [
        EventListResponse(
            event_id=event.id,
            title=event.title,
            location=event.location,
            date=str(event.date),
            current_volunteers=sum(reg.volunteer_count for reg in event.registrations),
            max_volunteers=event.max_volunteers,
        )
        for event in events
    ]

# Register for an event
@app.post("/events/{event_id}/register", 
          response_model=EventRegistrationResponse, 
          dependencies=[Depends(authorize_user(["individual", "university_club"]))])
def register_event(
    event_id: int, 
    registration: EventRegistrationSchema, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.max_volunteers < registration.volunteer_count:
        raise HTTPException(status_code=400, detail="Exceeds maximum volunteers")
    
    new_registration = EventRegistration(
        event_id=event_id, 
        user_id=current_user.id,
        volunteer_count=registration.volunteer_count
    )

    # Update the event's max_volunteers
    event.max_volunteers -= registration.volunteer_count

    # Add the new registration to the session
    db.add(new_registration)
    
    # Commit the changes to the database
    db.commit()
    
    # Refresh the event to get the updated state
    db.refresh(event)

    return EventRegistrationResponse(
        id=new_registration.id,
        event_id= new_registration.event_id,
        user_id=new_registration.user_id,
        volunteer_count= new_registration.volunteer_count
    )

# Create sponsorship
@app.post("/sponsorships", response_model=SponsorshipResponse, dependencies=[Depends(authorize_user(["company"]))])
def create_sponsorship(
    event_id: int, 
    sponsorship: SponsorshipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.organization_name:
        raise HTTPException(status_code=400, detail="Organization name is missing for the company user")

    new_sponsorship = Sponsorship(
        event_id=event_id,
        company_id=current_user.id,  # Use the authenticated user's ID as the company ID
        sponsorship_amount=sponsorship.sponsorship_amount,
        description=sponsorship.description,
    )
    db.add(new_sponsorship)
    db.commit()
    db.refresh(new_sponsorship)

    return SponsorshipResponse(
        id=new_sponsorship.id,
        event_id=new_sponsorship.event_id,
        company_id=new_sponsorship.company_id,
        sponsorship_amount=new_sponsorship.sponsorship_amount,
        description=new_sponsorship.description,
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
