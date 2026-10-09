from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class WaterSourceBase(BaseModel):
    name: str = Field(default="Primary Municipal Reservoir")
    source_type: str = Field(default="reservoir")
    daily_supply_liters: float = Field(default=90000.0, ge=0.0)
    reservoir_capacity_liters: float = Field(default=500000.0, ge=0.0)
    current_stored_liters: float = Field(default=320000.0, ge=0.0)
    incoming_supply_liters: float = Field(default=85000.0, ge=0.0)
    planning_period_days: int = Field(default=7, ge=1)
    expected_shortage_duration_days: int = Field(default=5, ge=0)
    status: str = Field(default="active")


class WaterSourceCreate(WaterSourceBase):
    id: str
    community_id: str


class WaterSourceUpdate(BaseModel):
    name: Optional[str] = None
    daily_supply_liters: Optional[float] = Field(None, ge=0.0)
    reservoir_capacity_liters: Optional[float] = Field(None, ge=0.0)
    current_stored_liters: Optional[float] = Field(None, ge=0.0)
    incoming_supply_liters: Optional[float] = Field(None, ge=0.0)
    planning_period_days: Optional[int] = Field(None, ge=1)
    expected_shortage_duration_days: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None


class WaterSourceResponse(WaterSourceBase):
    id: str
    community_id: str
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
