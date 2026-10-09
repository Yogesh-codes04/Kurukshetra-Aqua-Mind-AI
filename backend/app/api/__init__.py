from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.communities import router as communities_router
from app.api.dashboard import router as dashboard_router
from app.api.water_budgets import router as water_budgets_router
from app.api.consumption import router as consumption_router
from app.api.forecasts import router as forecasts_router
from app.api.alerts import router as alerts_router
from app.api.facilities import router as facilities_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(communities_router)
api_router.include_router(dashboard_router)
api_router.include_router(water_budgets_router)
api_router.include_router(consumption_router)
api_router.include_router(forecasts_router)
api_router.include_router(alerts_router)
api_router.include_router(facilities_router)
