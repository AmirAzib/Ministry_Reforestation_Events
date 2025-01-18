# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Literal, Optional, List
from datetime import date

class Config:
    orm_mode = True

# User Registration Schema
class UserCreate(BaseModel):
    user_type: Literal['individual', 'university_club', 'company', 'ministry']
    name: str
    email: EmailStr
    password: str
    organization_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    user_type: str
    organization_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserLoginResponse(BaseModel):
    access_token: str
    user_type: str

# Event Schema
class EventCreate(BaseModel):
    title: str
    location: str
    date: date
    max_volunteers: int
    description: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    max_volunteers: Optional[int] = None

class EventResponse(BaseModel):
    id: int
    title: str
    location: str
    date: date
    current_volunteers: int
    max_volunteers: int
    description: Optional[str] = None

class EventListResponse(BaseModel):
    event_id: int
    title: str
    location: str
    date: str
    current_volunteers: int
    max_volunteers: int

# Event Registration Schema
class EventRegistrationSchema(BaseModel):
    volunteer_count: int

class EventRegistrationResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    volunteer_count: int

# Sponsorship Schema
class SponsorshipCreate(BaseModel):
    sponsorship_amount: float
    description: Optional[str] = None

class SponsorshipResponse(BaseModel):
    id: int
    event_id: int
    company_id: int
    sponsorship_amount: float
    description: Optional[str] = None