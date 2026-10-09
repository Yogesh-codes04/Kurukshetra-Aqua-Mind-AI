from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.water_budget import WaterBudget
from app.models.community import Community
from app.schemas.water_budget import WaterBudgetCreate, WaterBudgetUpdate


class BudgetService:
    @staticmethod
    def get_active_budget(db: Session, community_id: str = "green-valley-01") -> Optional[WaterBudget]:
        return (
            db.query(WaterBudget)
            .filter(WaterBudget.community_id == community_id, WaterBudget.is_active == True)
            .first()
        )

    @staticmethod
    def get_or_create_default_budget(db: Session, community_id: str = "green-valley-01") -> WaterBudget:
        budget = BudgetService.get_active_budget(db, community_id)
        if not budget:
            budget = WaterBudget(
                id=f"wb-{community_id}-default",
                community_id=community_id,
                name="Baseline Municipal Water Budget",
                total_available=100000.0,
                residential_liters=52000.0,
                commercial_liters=20000.0,
                facilities_liters=12000.0,
                landscaping_liters=7500.0,
                reserve_locked_liters=10000.0,
                active_preset="standard",
                is_active=True,
            )
            db.add(budget)
            db.commit()
            db.refresh(budget)
        return budget

    @staticmethod
    def create_or_update_budget(
        db: Session,
        budget_data: WaterBudgetCreate,
    ) -> WaterBudget:
        budget = BudgetService.get_active_budget(db, budget_data.community_id)
        if not budget:
            budget = WaterBudget(
                id=budget_data.id or f"wb-{budget_data.community_id}",
                community_id=budget_data.community_id,
                name=budget_data.name,
                total_available=budget_data.total_available,
                residential_liters=budget_data.residential_liters,
                commercial_liters=budget_data.commercial_liters,
                facilities_liters=budget_data.facilities_liters,
                landscaping_liters=budget_data.landscaping_liters,
                reserve_locked_liters=budget_data.reserve_locked_liters,
                active_preset=budget_data.active_preset,
                is_active=True,
            )
            db.add(budget)
        else:
            budget.name = budget_data.name
            budget.total_available = budget_data.total_available
            budget.residential_liters = budget_data.residential_liters
            budget.commercial_liters = budget_data.commercial_liters
            budget.facilities_liters = budget_data.facilities_liters
            budget.landscaping_liters = budget_data.landscaping_liters
            budget.reserve_locked_liters = budget_data.reserve_locked_liters
            budget.active_preset = budget_data.active_preset

        db.commit()
        db.refresh(budget)
        return budget

    @staticmethod
    def update_budget(
        db: Session,
        community_id: str,
        update_data: WaterBudgetUpdate,
    ) -> Optional[WaterBudget]:
        budget = BudgetService.get_active_budget(db, community_id)
        if not budget:
            budget = BudgetService.get_or_create_default_budget(db, community_id)

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(budget, key, value)

        db.commit()
        db.refresh(budget)
        return budget

    @staticmethod
    def compute_budget_metrics(budget: WaterBudget, community: Optional[Community] = None) -> Dict[str, Any]:
        allocated_total = (
            budget.residential_liters
            + budget.commercial_liters
            + budget.facilities_liters
            + budget.landscaping_liters
            + budget.reserve_locked_liters
        )
        remaining_buffer = budget.total_available - allocated_total
        is_over_budget = allocated_total > budget.total_available

        population = community.population if community else 1840
        per_capita_baseline = community.per_capita_baseline if community else 108.0
        who_minimum_residential = population * per_capita_baseline

        is_residential_below_who = budget.residential_liters < (who_minimum_residential * 0.5)

        return {
            "total_available": budget.total_available,
            "allocated_total": allocated_total,
            "remaining_buffer": remaining_buffer,
            "is_over_budget": is_over_budget,
            "allocated_percentage": round((allocated_total / budget.total_available) * 100, 1) if budget.total_available > 0 else 0.0,
            "who_minimum_residential": who_minimum_residential,
            "is_residential_below_who": is_residential_below_who,
        }
