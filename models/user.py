from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base  # Use shared Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    user_type = Column(String, nullable=False)  # 'individual', 'university_club', 'company', 'ministry'
    organization_name = Column(String, nullable=True)  # For university_club and company

    events_registered = relationship("EventRegistration", back_populates="user")
    sponsorships = relationship("Sponsorship", back_populates="company")
