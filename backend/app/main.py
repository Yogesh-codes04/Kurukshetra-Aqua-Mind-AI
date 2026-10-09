import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import engine, Base, SessionLocal, check_db_connection
from app.services.seed_service import seed_database_if_empty
from app.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("aquamind_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize tables and seed data on startup."""
    logger.info("Initializing Aqua Mind AI database schema...")
    try:
        # Create tables if not existing
        Base.metadata.create_all(bind=engine)
        
        # Verify connectivity
        conn_check = check_db_connection()
        logger.info(f"Database connection: {conn_check['status']} (Dialect: {conn_check['dialect']})")

        # Seed initial data
        if conn_check["status"] == "connected":
            db = SessionLocal()
            try:
                seed_database_if_empty(db)
            finally:
                db.close()
    except Exception as e:
        logger.error(f"Startup database initialization error: {e}")

    yield

    logger.info("Shutting down Aqua Mind AI backend...")
    engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Intelligent water budgeting, predictive demand forecasting, and explainable conservation analytics API.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Structured Error Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error_type": "HTTPException",
            "message": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url.path),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({"field": field, "message": err.get("msg")})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error_type": "ValidationError",
            "message": "Input validation failed.",
            "details": errors,
            "path": str(request.url.path),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_type": "InternalServerError",
            "message": "An unexpected server error occurred.",
            "path": str(request.url.path),
        },
    )


# Root entrypoint
@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "endpoints": {
            "communities": "/api/communities",
            "dashboard": "/api/dashboard",
            "water_budgets": "/api/water-budgets",
            "consumption": "/api/consumption",
            "forecasts": "/api/forecasts",
            "alerts": "/api/alerts",
            "facilities": "/api/facilities",
            "simulation": "/api/simulation/run",
        },
    }


# Mount API routers
app.include_router(api_router)
