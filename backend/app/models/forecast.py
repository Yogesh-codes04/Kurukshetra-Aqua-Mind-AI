from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ForecastPoint(Base):
    __tablename__ = "forecast_points"

    id = Column(String(64), primary_key=True, index=True)
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    forecast_date = Column(String(32), nullable=False, index=True)
    day_label = Column(String(64), nullable=False)
    actual_liters = Column(Float, nullable=True)
    forecast_liters = Column(Float, nullable=True)
    baseline_liters = Column(Float, nullable=False, default=100000.0)
    ci_lower = Column(Float, nullable=True)
    ci_upper = Column(Float, nullable=True)
    weather_temp = Column(Float, nullable=True)
    is_peak = Column(Boolean, default=False)
    is_breach = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    community = relationship("Community", back_populates="forecast_points")


class HistoricalReportPoint(Base):
    __tablename__ = "historical_report_points"

    id = Column(String(64), primary_key=True, index=True)
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    date_str = Column(String(32), nullable=False)
    actual_liters = Column(Float, nullable=False)
    budget_ceiling_liters = Column(Float, nullable=False, default=100000.0)
    baseline_30d_liters = Column(Float, nullable=False, default=76500.0)
    is_spike = Column(Boolean, default=False)
    spike_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
