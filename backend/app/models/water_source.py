from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class WaterSource(Base):
    __tablename__ = "water_sources"

    id = Column(String(64), primary_key=True, index=True)
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(64), default="reservoir")  # reservoir, gravity_main, aquifer, auxiliary
    daily_supply_liters = Column(Float, nullable=False, default=90000.0)
    reservoir_capacity_liters = Column(Float, nullable=False, default=500000.0)
    current_stored_liters = Column(Float, nullable=False, default=320000.0)
    incoming_supply_liters = Column(Float, nullable=False, default=85000.0)
    planning_period_days = Column(Integer, default=7)
    expected_shortage_duration_days = Column(Integer, default=5)
    status = Column(String(32), default="active")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    community = relationship("Community", back_populates="water_sources")
