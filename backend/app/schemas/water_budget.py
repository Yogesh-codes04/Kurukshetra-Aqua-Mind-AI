from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class WaterBudgetBase(BaseModel):
    name: str = Field(default="Municipal Water Allocation Plan")
    total_available: float = Field(default=100000.0, ge=0.0)
    residential_liters: float = Field(default=52000.0, ge=0.0)
    commercial_liters: float = Field(default=20000.0, ge=0.0)
    facilities_liters: float = Field(default=12000.0, ge=0.0)
    landscaping_liters: float = Field(default=7500.0, ge=0.0)
    reserve_locked_liters: float = Field(default=10000.0, ge=0.0)
    active_preset: Literal["standard", "conservation", "custom"] = "standard"


class WaterBudgetCreate(WaterBudgetBase):
    id: Optional[str] = None
    community_id: str = "green-valley-01"


class WaterBudgetUpdate(BaseModel):
    name: Optional[str] = None
    total_available: Optional[float] = Field(None, ge=0.0)
    residential_liters: Optional[float] = Field(None, ge=0.0)
    commercial_liters: Optional[float] = Field(None, ge=0.0)
    facilities_liters: Optional[float] = Field(None, ge=0.0)
    landscaping_liters: Optional[float] = Field(None, ge=0.0)
    reserve_locked_liters: Optional[float] = Field(None, ge=0.0)
    active_preset: Optional[Literal["standard", "conservation", "custom"]] = None


class WaterBudgetResponse(WaterBudgetBase):
    id: str
    community_id: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
