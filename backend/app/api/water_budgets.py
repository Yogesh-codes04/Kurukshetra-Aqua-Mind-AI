from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.community import Community
from app.models.water_budget import WaterBudget
from app.schemas.water_budget import (
    WaterBudgetResponse,
    WaterBudgetCreate,
    WaterBudgetUpdate,
)
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/water-budgets", tags=["Water Budgets"])


@router.get("", response_model=WaterBudgetResponse, summary="Get Active Water Budget")
def get_water_budget(
    community_id: str = Query("green-valley-01", description="Community Identifier"),
    db: Session = Depends(get_db),
):
    """Retrieve the current active water budget and sector allocations."""
    budget = BudgetService.get_or_create_default_budget(db, community_id)
    return budget


@router.post("", response_model=WaterBudgetResponse, summary="Create or Update Water Budget")
def create_or_update_budget(
    payload: WaterBudgetCreate,
    db: Session = Depends(get_db),
):
    """Save or update water budget allocations across residential, commercial, facilities, landscaping, and locked reserve."""
    try:
        budget = BudgetService.create_or_update_budget(db, payload)
        return budget
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist water budget: {str(e)}",
        )


@router.put("/{budget_id}", response_model=WaterBudgetResponse, summary="Update Specific Water Budget")
def update_budget(
    budget_id: str,
    payload: WaterBudgetUpdate,
    community_id: str = Query("green-valley-01"),
    db: Session = Depends(get_db),
):
    """Update sector allocations for a specific water budget."""
    updated = BudgetService.update_budget(db, community_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Water budget '{budget_id}' not found.",
        )
    return updated


@router.get("/metrics", summary="Get Water Budget Analytics & WHO Compliance")
def get_budget_metrics(
    community_id: str = Query("green-valley-01"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Computes total allocated volume, remaining headroom, and WHO compliance indicators."""
    budget = BudgetService.get_or_create_default_budget(db, community_id)
    community = db.query(Community).filter(Community.id == community_id).first()
    return BudgetService.compute_budget_metrics(budget, community)
