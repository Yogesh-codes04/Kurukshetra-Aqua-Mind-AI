from fastapi import APIRouter, Response, status
from app.database import check_db_connection
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="System and Database Health Check")
def health_check(response: Response):
    """Checks application and database connectivity.
    Accurately tests the configured database connection.
    If the database fails to respond, returns HTTP 503.
    """
    db_check = check_db_connection()
    is_healthy = db_check["status"] == "connected"

    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "healthy" if is_healthy else "degraded",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": db_check["status"],
            "dialect": db_check["dialect"],
            "is_postgresql": db_check.get("is_postgresql", False),
            "target": db_check.get("url_masked", "masked"),
            **({"error": db_check["error"]} if "error" in db_check else {}),
        },
    }
