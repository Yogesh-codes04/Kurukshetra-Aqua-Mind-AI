from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.community import Community
from app.models.water_source import WaterSource
from app.models.allocation import Facility
from app.models.consumption import ConsumptionRecord
from app.models.forecast import ForecastPoint
from app.models.alert import AlertItem
from app.schemas.dashboard import DashboardOverviewResponse
from app.services.budget_service import BudgetService
from app.services.allocation_service import run_water_allocation_simulation

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOverviewResponse, summary="Get Aggregated Dashboard Overview")
def get_dashboard_overview(
    community_id: str = Query("green-valley-01", description="Community Identifier"),
    db: Session = Depends(get_db),
):
    """Retrieve full aggregated dashboard data:
    - Community profile
    - Water source & storage
    - Active water budget
    - Facilities registry
    - Live deterministic allocation simulation
    - Recent meter readings
    - 7-day forecast trajectory
    - Active alerts
    """
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{community_id}' not found.",
        )

    water_source = db.query(WaterSource).filter(WaterSource.community_id == community_id).first()
    if not water_source:
        water_source = WaterSource(
            id=f"src-{community_id}",
            community_id=community_id,
            name="Municipal Reservoir",
            daily_supply_liters=90000.0,
            reservoir_capacity_liters=500000.0,
            current_stored_liters=320000.0,
            incoming_supply_liters=85000.0,
        )
        db.add(water_source)
        db.commit()
        db.refresh(water_source)

    budget = BudgetService.get_or_create_default_budget(db, community_id)
    facilities = db.query(Facility).filter(Facility.community_id == community_id).all()

    # Run allocation simulation
    simulation = run_water_allocation_simulation(
        facilities=facilities,
        daily_supply_liters=water_source.daily_supply_liters,
    )

    recent_readings = (
        db.query(ConsumptionRecord)
        .filter(ConsumptionRecord.community_id == community_id)
        .order_by(ConsumptionRecord.recorded_at.desc())
        .limit(5)
        .all()
    )

    forecast_trajectory = (
        db.query(ForecastPoint)
        .filter(ForecastPoint.community_id == community_id)
        .order_by(ForecastPoint.forecast_date.asc())
        .limit(7)
        .all()
    )

    active_alerts = (
        db.query(AlertItem)
        .filter(AlertItem.community_id == community_id, AlertItem.status == "active")
        .order_by(AlertItem.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardOverviewResponse(
        community=community,
        water_source=water_source,
        water_budget=budget,
        facilities=facilities,
        simulation=simulation,
        recent_readings=recent_readings,
        forecast_trajectory=forecast_trajectory,
        active_alerts=active_alerts,
        timestamp=datetime.now(timezone.utc),
    )
