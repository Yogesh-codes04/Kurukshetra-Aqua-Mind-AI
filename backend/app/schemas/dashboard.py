from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.community import CommunityResponse
from app.schemas.water_source import WaterSourceResponse
from app.schemas.water_budget import WaterBudgetResponse
from app.schemas.allocation import FacilityResponse, SimulationResultResponse
from app.schemas.consumption import ConsumptionRecordResponse
from app.schemas.forecast import ForecastPointResponse
from app.schemas.alert import AlertItemResponse


class DashboardOverviewResponse(BaseModel):
    community: CommunityResponse
    water_source: WaterSourceResponse
    water_budget: WaterBudgetResponse
    facilities: List[FacilityResponse]
    simulation: SimulationResultResponse
    recent_readings: List[ConsumptionRecordResponse]
    forecast_trajectory: List[ForecastPointResponse]
    active_alerts: List[AlertItemResponse]
    timestamp: datetime
