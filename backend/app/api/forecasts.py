from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.forecast import (
    ForecastPointResponse,
    GenerateForecastRequest,
    ForecastSummaryResponse,
    HistoricalReportPointResponse,
)
from app.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecasts", tags=["Demand Forecasts"])


@router.get("", response_model=List[ForecastPointResponse], summary="Get Demand Forecast Trajectory")
def get_forecasts(
    community_id: str = Query("green-valley-01"),
    horizon: int = Query(7, ge=1, le=30, description="Horizon days (7, 14, or 30)"),
    db: Session = Depends(get_db),
):
    """Retrieve forward-looking demand forecast points with confidence bands and temperature data."""
    points = ForecastService.get_forecast_points(db, community_id, horizon)
    return points


@router.post("/generate", response_model=ForecastSummaryResponse, summary="Generate / Simulate Load-Shedding Projections")
def generate_forecast(
    payload: GenerateForecastRequest,
    db: Session = Depends(get_db),
):
    """Simulate hydraulic demand under interactive mitigation protocols (irrigation, HVAC, rainwater)."""
    return ForecastService.simulate_forecast_mitigation(
        db=db,
        community_id=payload.community_id,
        horizon_days=payload.horizon_days,
        mitigate_irrigation=payload.mitigate_irrigation,
        mitigate_hvac=payload.mitigate_hvac,
        mitigate_rainwater=payload.mitigate_rainwater,
    )


@router.get("/historical", response_model=List[HistoricalReportPointResponse], summary="Get Historical Compliance Records")
def get_historical_reports(
    community_id: str = Query("green-valley-01"),
    db: Session = Depends(get_db),
):
    """Retrieve daily historical audited consumption vs budget ceiling records."""
    return ForecastService.get_historical_report_points(db, community_id)
