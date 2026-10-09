from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class WaterBudget(Base):
    __tablename__ = "water_budgets"

    id = Column(String(64), primary_key=True, index=True)
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    name = Column(String(128), default="Current Water Budget")
    total_available = Column(Float, nullable=False, default=100000.0)
    residential_liters = Column(Float, nullable=False, default=52000.0)
    commercial_liters = Column(Float, nullable=False, default=20000.0)
    facilities_liters = Column(Float, nullable=False, default=12000.0)
    landscaping_liters = Column(Float, nullable=False, default=7500.0)
    reserve_locked_liters = Column(Float, nullable=False, default=10000.0)
    active_preset = Column(String(32), default="standard")  # standard, conservation, custom
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    community = relationship("Community", back_populates="water_budgets")
