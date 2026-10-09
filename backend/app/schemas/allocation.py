from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

PriorityType = Literal["Critical", "High", "Medium", "Low"]
AllocationStatusType = Literal[
    "fully_met", "partially_met", "minimum_only", "critical_deficit", "zero_allocation"
]


class FacilityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., min_length=1, max_length=64)
    demand_liters: float = Field(..., ge=0.0)
    min_liters: float = Field(..., ge=0.0)
    priority: PriorityType = "Medium"
    people_served: int = Field(default=0, ge=0)
    notes: Optional[str] = None


class FacilityCreate(FacilityBase):
    id: Optional[str] = None
    community_id: str = "green-valley-01"


class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    demand_liters: Optional[float] = Field(None, ge=0.0)
    min_liters: Optional[float] = Field(None, ge=0.0)
    priority: Optional[PriorityType] = None
    people_served: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None


class FacilityResponse(FacilityBase):
    id: str
    community_id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WaterAvailabilityInput(BaseModel):
    dailySupplyLiters: float = Field(..., ge=0.0)
    reservoirCapacityLiters: float = Field(default=500000.0, ge=0.0)
    currentStoredLiters: float = Field(default=320000.0, ge=0.0)
    incomingSupplyLiters: float = Field(default=85000.0, ge=0.0)
    planningPeriodDays: int = Field(default=7, ge=1)
    expectedShortageDurationDays: int = Field(default=5, ge=0)


class RunSimulationRequest(BaseModel):
    community_id: str = "green-valley-01"
    water_availability: WaterAvailabilityInput
    facilities: Optional[List[FacilityBase]] = None  # If None, loads from DB


class FacilityAllocationItemSchema(BaseModel):
    facilityId: str
    facilityName: str
    type: str
    priority: PriorityType
    demandLiters: float
    minLiters: float
    allocatedLiters: float
    unmetLiters: float
    shortagePercentage: float
    fulfilledPercentage: float
    minMet: bool
    minDeficitLiters: float
    peopleProtected: int
    status: AllocationStatusType
    reason: str


class SimulationResultResponse(BaseModel):
    availableSupply: float
    totalDemand: float
    totalAllocated: float
    remainingReserve: float
    totalUnmetDemand: float
    criticalDeficitCount: int
    criticalUnmetLiters: float
    allMinimumsMet: bool
    facilityAllocations: List[FacilityAllocationItemSchema]
    explanation: str
    stepExplanations: List[str]
    tradeOffNotes: List[str]
    timestamp: str
    isSimulatedEstimate: bool = True
