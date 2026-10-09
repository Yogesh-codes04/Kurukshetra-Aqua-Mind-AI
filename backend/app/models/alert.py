from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class AlertItem(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True, index=True)  # e.g., ALT-8402
    code = Column(String(32), nullable=False)               # e.g., #ALT-8402
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    severity = Column(String(32), nullable=False)          # critical, warning, budget_exceeded, info
    category_label = Column(String(128), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    timestamp_str = Column(String(64), nullable=False)
    time_ago = Column(String(64), default="Recently")
    impact_volume = Column(Float, default=0.0)
    impact_unit = Column(String(64), default="L/day")
    breach_window = Column(String(128), nullable=True)
    confidence = Column(Float, default=90.0)
    status = Column(String(32), default="active")          # active, acknowledged, resolved
    regulatory_notice = Column(String(255), nullable=True)
    shap_drivers = Column(JSON, default=list)              # List of driver attribution dicts
    prescribed_mitigations = Column(JSON, default=list)    # List of mitigation actions
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    community = relationship("Community", back_populates="alerts")
