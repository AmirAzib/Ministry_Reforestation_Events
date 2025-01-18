from sqlalchemy import Column, Integer, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from database import Base  # Use shared Base

class Sponsorship(Base):
    __tablename__ = 'sponsorships'

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey('events.id'), nullable=False)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    sponsorship_amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)

    # Establish relationships
    event = relationship("Event", back_populates="sponsorships")
    company = relationship("User", back_populates="sponsorships")