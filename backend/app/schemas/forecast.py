from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ForecastPointBase(BaseModel):
    forecast_date: str
    day_label: str
    actual_liters: Optional[float] = None
    forecast_liters: Optional[float] = None
    baseline_liters: float = 100000.0
    ci_lower: Optional[float] = None
    ci_upper: Optional[float] = None
    weather_temp: Optional[float] = None
    is_peak: bool = False
    is_breach: bool = False


class ForecastPointResponse(ForecastPointBase):
    id: str
    community_id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class GenerateForecastRequest(BaseModel):
    community_id: str = "green-valley-01"
    horizon_days: Literal[7, 14, 30] = 7
    mitigate_irrigation: bool = True
    mitigate_hvac: bool = True
    mitigate_rainwater: bool = True


class ForecastSummaryResponse(BaseModel):
    horizon: str
    base_peak_liters: float
    total_relief_liters: float
    simulated_peak_liters: float
    is_deficit_eliminated: bool
    points: List[ForecastPointResponse]


class HistoricalReportPointResponse(BaseModel):
    id: str
    community_id: str
    day_number: int
    date_str: str
    actual_liters: float
    budget_ceiling_liters: float
    baseline_30d_liters: float
    is_spike: bool
    spike_reason: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
