from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(64), primary_key=True, index=True)
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(64), nullable=False)  # Healthcare, Education, Residential, Commercial, Recreation
    demand_liters = Column(Float, nullable=False, default=0.0)
    min_liters = Column(Float, nullable=False, default=0.0)
    priority = Column(String(32), nullable=False, default="Medium")  # Critical, High, Medium, Low
    people_served = Column(Integer, nullable=False, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    community = relationship("Community", back_populates="facilities")


class AllocationRun(Base):
    __tablename__ = "allocation_runs"

    id = Column(String(64), primary_key=True, index=True)
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    available_supply = Column(Float, nullable=False)
    total_demand = Column(Float, nullable=False)
    total_allocated = Column(Float, nullable=False)
    remaining_reserve = Column(Float, nullable=False)
    total_unmet_demand = Column(Float, nullable=False)
    critical_deficit_count = Column(Integer, default=0)
    critical_unmet_liters = Column(Float, default=0.0)
    all_minimums_met = Column(Boolean, default=True)
    explanation = Column(Text, nullable=True)
    step_explanations = Column(JSON, nullable=True)
    trade_off_notes = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
