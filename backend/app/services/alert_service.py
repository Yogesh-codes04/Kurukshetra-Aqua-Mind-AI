from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.alert import AlertItem
from app.models.water_budget import WaterBudget
from app.schemas.alert import ApplyMitigationResponse


class AlertService:
    @staticmethod
    def get_alerts(
        db: Session,
        community_id: str = "green-valley-01",
        severity: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[AlertItem]:
        query = db.query(AlertItem).filter(AlertItem.community_id == community_id)
        if severity and severity != "all":
            query = query.filter(AlertItem.severity == severity)
        if status and status != "all":
            query = query.filter(AlertItem.status == status)
        return query.order_by(AlertItem.created_at.desc()).all()

    @staticmethod
    def update_alert_status(
        db: Session,
        alert_id: str,
        new_status: str,
    ) -> Optional[AlertItem]:
        alert = db.query(AlertItem).filter(AlertItem.id == alert_id).first()
        if not alert:
            return None
        alert.status = new_status
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def acknowledge_all_alerts(db: Session, community_id: str = "green-valley-01") -> int:
        updated = (
            db.query(AlertItem)
            .filter(AlertItem.community_id == community_id, AlertItem.status == "active")
            .update({"status": "acknowledged"}, synchronize_session=False)
        )
        db.commit()
        return updated

    @staticmethod
    def apply_mitigations(
        db: Session,
        alert_id: str,
        mitigation_ids: List[str],
    ) -> ApplyMitigationResponse:
        alert = db.query(AlertItem).filter(AlertItem.id == alert_id).first()
        if not alert:
            return ApplyMitigationResponse(
                alert_id=alert_id,
                conserved_liters=0.0,
                message=f"Alert {alert_id} not found.",
                budget_updated=False,
            )

        conserved = 0.0
        for mit in (alert.prescribed_mitigations or []):
            if isinstance(mit, dict) and mit.get("id") in mitigation_ids:
                conserved += float(mit.get("impactLiters", 0.0))

        # Optionally update active budget to conservation preset if >= 4500 L
        budget = (
            db.query(WaterBudget)
            .filter(WaterBudget.community_id == alert.community_id, WaterBudget.is_active == True)
            .first()
        )
        budget_updated = False
        if budget and conserved > 0:
            budget.active_preset = "conservation"
            budget.residential_liters = 52000.0
            budget.commercial_liters = 18000.0
            budget.facilities_liters = 12000.0
            budget.landscaping_liters = 4500.0
            budget_updated = True
            db.commit()

        return ApplyMitigationResponse(
            alert_id=alert_id,
            conserved_liters=conserved,
            message=f"Applied {len(mitigation_ids)} mitigations for alert {alert_id}. Conserved +{conserved:,.0f} L/day.",
            budget_updated=budget_updated,
        )
