from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CommunityBase(BaseModel):
    name: str = Field(..., max_length=255)
    phase: str = Field(default="Phase 1-4", max_length=128)
    units: int = Field(default=542, ge=1)
    population: int = Field(default=1840, ge=1)
    commercial_nodes: int = Field(default=28, ge=0)
    parkland_hectares: float = Field(default=14.2, ge=0.0)
    authority: str = Field(default="Maricopa County Hydrological District 09")
    officer_name: str = Field(default="Yogesh Mulaje")
    emergency_phone: str = Field(default="+1 (480) 555-0193")
    daily_yield_cap: float = Field(default=100000.0, ge=0.0)
    emergency_reserve_floor: float = Field(default=10000.0, ge=0.0)
    per_capita_baseline: float = Field(default=108.0, ge=0.0)
    heat_advisory_multiplier: float = Field(default=1.15, ge=1.0)


class CommunityCreate(CommunityBase):
    id: str = Field(..., max_length=64)


class CommunityUpdate(BaseModel):
    name: Optional[str] = None
    phase: Optional[str] = None
    units: Optional[int] = None
    population: Optional[int] = None
    commercial_nodes: Optional[int] = None
    parkland_hectares: Optional[float] = None
    authority: Optional[str] = None
    officer_name: Optional[str] = None
    emergency_phone: Optional[str] = None
    daily_yield_cap: Optional[float] = None
    emergency_reserve_floor: Optional[float] = None
    per_capita_baseline: Optional[float] = None
    heat_advisory_multiplier: Optional[float] = None


class CommunityResponse(CommunityBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
