from typing import Optional, List, Any, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AlertItemBase(BaseModel):
    code: str
    severity: Literal["critical", "warning", "budget_exceeded", "info"]
    category_label: str
    title: str
    description: str
    timestamp_str: str
    time_ago: str = "Recently"
    impact_volume: float = 0.0
    impact_unit: str = "L/day"
    breach_window: Optional[str] = None
    confidence: float = 90.0
    status: Literal["active", "acknowledged", "resolved"] = "active"
    regulatory_notice: Optional[str] = None
    shap_drivers: List[Any] = []
    prescribed_mitigations: List[Any] = []


class AlertItemResponse(AlertItemBase):
    id: str
    community_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AlertStatusUpdate(BaseModel):
    status: Literal["active", "acknowledged", "resolved"]


class ApplyMitigationRequest(BaseModel):
    alert_id: str
    mitigation_ids: List[str]


class ApplyMitigationResponse(BaseModel):
    alert_id: str
    conserved_liters: float
    message: str
    budget_updated: bool
