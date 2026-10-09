from app.schemas.community import CommunityBase, CommunityCreate, CommunityUpdate, CommunityResponse
from app.schemas.water_source import WaterSourceBase, WaterSourceCreate, WaterSourceUpdate, WaterSourceResponse
from app.schemas.water_budget import WaterBudgetBase, WaterBudgetCreate, WaterBudgetUpdate, WaterBudgetResponse
from app.schemas.allocation import (
    FacilityBase,
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    WaterAvailabilityInput,
    RunSimulationRequest,
    FacilityAllocationItemSchema,
    SimulationResultResponse,
)
from app.schemas.consumption import (
    ConsumptionRecordBase,
    ConsumptionRecordCreate,
    ConsumptionRecordResponse,
    MeterLedgerBase,
    MeterLedgerResponse,
)
from app.schemas.forecast import (
    ForecastPointBase,
    ForecastPointResponse,
    GenerateForecastRequest,
    ForecastSummaryResponse,
    HistoricalReportPointResponse,
)
from app.schemas.alert import (
    AlertItemBase,
    AlertItemResponse,
    AlertStatusUpdate,
    ApplyMitigationRequest,
    ApplyMitigationResponse,
)
from app.schemas.dashboard import DashboardOverviewResponse

__all__ = [
    "CommunityBase",
    "CommunityCreate",
    "CommunityUpdate",
    "CommunityResponse",
    "WaterSourceBase",
    "WaterSourceCreate",
    "WaterSourceUpdate",
    "WaterSourceResponse",
    "WaterBudgetBase",
    "WaterBudgetCreate",
    "WaterBudgetUpdate",
    "WaterBudgetResponse",
    "FacilityBase",
    "FacilityCreate",
    "FacilityUpdate",
    "FacilityResponse",
    "WaterAvailabilityInput",
    "RunSimulationRequest",
    "FacilityAllocationItemSchema",
    "SimulationResultResponse",
    "ConsumptionRecordBase",
    "ConsumptionRecordCreate",
    "ConsumptionRecordResponse",
    "MeterLedgerBase",
    "MeterLedgerResponse",
    "ForecastPointBase",
    "ForecastPointResponse",
    "GenerateForecastRequest",
    "ForecastSummaryResponse",
    "HistoricalReportPointResponse",
    "AlertItemBase",
    "AlertItemResponse",
    "AlertStatusUpdate",
    "ApplyMitigationRequest",
    "ApplyMitigationResponse",
    "DashboardOverviewResponse",
]
