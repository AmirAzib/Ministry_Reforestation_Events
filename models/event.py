from sqlalchemy import Column, Integer, String, Date, Text
from sqlalchemy.orm import relationship
from database import Base  # Use shared Base

class Event(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    max_volunteers = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)

    registrations = relationship("EventRegistration", back_populates="event")
    sponsorships = relationship("Sponsorship", back_populates="event")
