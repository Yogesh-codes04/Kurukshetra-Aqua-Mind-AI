from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Community(Base):
    __tablename__ = "communities"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phase = Column(String(128), default="Phase 1-4")
    units = Column(Integer, default=542)
    population = Column(Integer, default=1840)
    commercial_nodes = Column(Integer, default=28)
    parkland_hectares = Column(Float, default=14.2)
    authority = Column(String(255), default="Maricopa County Hydrological District 09")
    officer_name = Column(String(128), default="Yogesh Mulaje")
    emergency_phone = Column(String(64), default="+1 (480) 555-0193")
    daily_yield_cap = Column(Float, default=100000.0)
    emergency_reserve_floor = Column(Float, default=10000.0)
    per_capita_baseline = Column(Float, default=108.0)
    heat_advisory_multiplier = Column(Float, default=1.15)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    water_sources = relationship("WaterSource", back_populates="community", cascade="all, delete-orphan")
    water_budgets = relationship("WaterBudget", back_populates="community", cascade="all, delete-orphan")
    facilities = relationship("Facility", back_populates="community", cascade="all, delete-orphan")
    consumption_records = relationship("ConsumptionRecord", back_populates="community", cascade="all, delete-orphan")
    forecast_points = relationship("ForecastPoint", back_populates="community", cascade="all, delete-orphan")
    alerts = relationship("AlertItem", back_populates="community", cascade="all, delete-orphan")
