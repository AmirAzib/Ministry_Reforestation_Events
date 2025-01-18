from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base  # Use shared Base

class EventRegistration(Base):
    __tablename__ = 'event_registrations'

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey('events.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    volunteer_count = Column(Integer, nullable=False, default=1)  # For clubs and companies

    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="events_registered")
