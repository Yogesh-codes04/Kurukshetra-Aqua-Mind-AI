from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ConsumptionRecord(Base):
    """Corresponds to MeterReadingRecord logged manually or by sensors."""
    __tablename__ = "consumption_records"

    id = Column(String(64), primary_key=True, index=True)
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    meter_id = Column(String(64), nullable=False, index=True)
    zone = Column(String(255), nullable=False)
    volume = Column(Float, nullable=False)
    reading_date = Column(String(64), nullable=False)
    source = Column(String(32), default="manual")  # manual, sensor
    reading_type = Column(String(64), default="24h_cycle")
    technician_notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    community = relationship("Community", back_populates="consumption_records")


class MeterLedger(Base):
    """Sub-zone smart flow meter ledger."""
    __tablename__ = "meter_ledgers"

    id = Column(String(64), primary_key=True, index=True)  # e.g., MTR-104
    community_id = Column(String(64), ForeignKey("communities.id"), nullable=False, index=True)
    substation = Column(String(128), nullable=False)
    zone_name = Column(String(255), nullable=False)
    meter_architecture = Column(String(128), default="Ultrasonic Smart Meter")
    allocated_quota = Column(Float, nullable=False)
    recorded_usage = Column(Float, nullable=False)
    adherence_delta = Column(Float, nullable=False)
    percentage_delta = Column(Float, nullable=False)
    compliance_status = Column(String(32), default="compliant")  # compliant, over_quota, protected
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
