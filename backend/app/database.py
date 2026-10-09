import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger(__name__)

# Engine configuration
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """Verifies actual connectivity to the configured database.
    Returns details on connection status, dialect, and any error message.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "url_masked": _mask_database_url(settings.DATABASE_URL),
            "is_postgresql": engine.dialect.name == "postgresql",
        }
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return {
            "status": "disconnected",
            "dialect": engine.dialect.name,
            "error": str(e),
            "is_postgresql": engine.dialect.name == "postgresql",
        }


def _mask_database_url(url: str) -> str:
    """Masks database credentials for secure display/logging."""
    try:
        if "@" in url:
            prefix, rest = url.split("@", 1)
            scheme, _ = prefix.split("://", 1)
            return f"{scheme}://***:***@{rest}"
        return url
    except Exception:
        return "masked"
