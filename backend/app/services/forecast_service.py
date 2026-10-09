from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.forecast import ForecastPoint, HistoricalReportPoint
from app.schemas.forecast import ForecastSummaryResponse, ForecastPointResponse


class ForecastService:
    @staticmethod
    def get_forecast_points(
        db: Session,
        community_id: str = "green-valley-01",
        horizon_days: int = 7,
    ) -> List[ForecastPoint]:
        query = (
            db.query(ForecastPoint)
            .filter(ForecastPoint.community_id == community_id)
            .order_by(ForecastPoint.forecast_date.asc())
        )
        return query.limit(horizon_days).all()

    @staticmethod
    def get_historical_report_points(
        db: Session,
        community_id: str = "green-valley-01",
    ) -> List[HistoricalReportPoint]:
        return (
            db.query(HistoricalReportPoint)
            .filter(HistoricalReportPoint.community_id == community_id)
            .order_by(HistoricalReportPoint.day_number.asc())
            .all()
        )

    @staticmethod
    def simulate_forecast_mitigation(
        db: Session,
        community_id: str = "green-valley-01",
        horizon_days: int = 7,
        mitigate_irrigation: bool = True,
        mitigate_hvac: bool = True,
        mitigate_rainwater: bool = True,
    ) -> ForecastSummaryResponse:
        points = ForecastService.get_forecast_points(db, community_id, horizon_days)
        
        base_peak = 112000.0
        irrigation_relief = 4500.0 if mitigate_irrigation else 0.0
        hvac_relief = 2200.0 if mitigate_hvac else 0.0
        rainwater_relief = 5000.0 if mitigate_rainwater else 0.0
        total_relief = irrigation_relief + hvac_relief + rainwater_relief
        simulated_peak = base_peak - total_relief
        is_deficit_eliminated = simulated_peak <= 100000.0

        point_responses = [ForecastPointResponse.model_validate(p) for p in points]

        return ForecastSummaryResponse(
            horizon=f"{horizon_days}d",
            base_peak_liters=base_peak,
            total_relief_liters=total_relief,
            simulated_peak_liters=simulated_peak,
            is_deficit_eliminated=is_deficit_eliminated,
            points=point_responses,
        )
