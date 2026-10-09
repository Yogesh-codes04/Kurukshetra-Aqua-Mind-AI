from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.alert import AlertItem
from app.schemas.alert import (
    AlertItemResponse,
    AlertStatusUpdate,
    ApplyMitigationRequest,
    ApplyMitigationResponse,
)
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["AI Insights & Alerts"])


@router.get("", response_model=List[AlertItemResponse], summary="List AI Alerts & Anomalies")
def get_alerts(
    community_id: str = Query("green-valley-01"),
    severity: Optional[str] = Query(None, description="all, critical, warning, budget_exceeded, info"),
    status_filter: Optional[str] = Query(None, alias="status", description="all, active, acknowledged, resolved"),
    db: Session = Depends(get_db),
):
    """Retrieve explainable AI alerts, SHAP attribution drivers, and prescribed mitigations."""
    return AlertService.get_alerts(db, community_id, severity, status_filter)


@router.patch("/{alert_id}/status", response_model=AlertItemResponse, summary="Update Alert Lifecycle Status")
def update_alert_status(
    alert_id: str,
    payload: AlertStatusUpdate,
    db: Session = Depends(get_db),
):
    """Transition alert between 'active', 'acknowledged', and 'resolved' states."""
    updated = AlertService.update_alert_status(db, alert_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert '{alert_id}' not found.",
        )
    return updated


@router.post("/acknowledge-all", summary="Acknowledge All Active Alerts")
def acknowledge_all(
    community_id: str = Query("green-valley-01"),
    db: Session = Depends(get_db),
):
    """Marks all currently active operational alerts as acknowledged."""
    count = AlertService.acknowledge_all_alerts(db, community_id)
    return {"message": f"Successfully acknowledged {count} active alerts.", "count": count}


@router.post("/apply-mitigation", response_model=ApplyMitigationResponse, summary="Apply Prescribed Mitigations")
def apply_mitigation(
    payload: ApplyMitigationRequest,
    db: Session = Depends(get_db),
):
    """Enacts prescribed mitigation actions to conserve water volume."""
    return AlertService.apply_mitigations(db, payload.alert_id, payload.mitigation_ids)
