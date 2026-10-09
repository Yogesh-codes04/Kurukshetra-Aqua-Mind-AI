from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ConsumptionRecordBase(BaseModel):
    zone: str = Field(..., max_length=255)
    meter_id: str = Field(..., max_length=64)
    volume: float = Field(..., ge=0.0)
    reading_date: str = Field(..., max_length=64)
    source: Literal["manual", "sensor"] = "manual"
    reading_type: str = Field(default="24h_cycle")
    technician_notes: Optional[str] = None


class ConsumptionRecordCreate(ConsumptionRecordBase):
    id: Optional[str] = None
    community_id: str = "green-valley-01"


class ConsumptionRecordResponse(ConsumptionRecordBase):
    id: str
    community_id: str
    recorded_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MeterLedgerBase(BaseModel):
    substation: str
    zone_name: str
    meter_architecture: str = "Ultrasonic Smart Meter"
    allocated_quota: float
    recorded_usage: float
    adherence_delta: float
    percentage_delta: float
    compliance_status: Literal["compliant", "over_quota", "protected"] = "compliant"


class MeterLedgerResponse(MeterLedgerBase):
    id: str
    community_id: str
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
