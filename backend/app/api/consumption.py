from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.consumption import ConsumptionRecord, MeterLedger
from app.schemas.consumption import (
    ConsumptionRecordResponse,
    ConsumptionRecordCreate,
    MeterLedgerResponse,
)

router = APIRouter(prefix="/consumption", tags=["Consumption & Metering"])


@router.get("", response_model=List[ConsumptionRecordResponse], summary="List Meter Readings")
def list_readings(
    community_id: str = Query("green-valley-01"),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve logged water meter readings with timestamp and source attribution."""
    return (
        db.query(ConsumptionRecord)
        .filter(ConsumptionRecord.community_id == community_id)
        .order_by(ConsumptionRecord.recorded_at.desc())
        .limit(limit)
        .all()
    )


@router.post("", response_model=ConsumptionRecordResponse, status_code=status.HTTP_201_CREATED, summary="Record Meter Reading")
def record_reading(
    payload: ConsumptionRecordCreate,
    db: Session = Depends(get_db),
):
    """Log a verified meter reading with source ('manual' or 'sensor') and technician notes."""
    try:
        record_id = payload.id or f"rec-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        record = ConsumptionRecord(
            id=record_id,
            community_id=payload.community_id,
            meter_id=payload.meter_id,
            zone=payload.zone,
            volume=payload.volume,
            reading_date=payload.reading_date,
            source=payload.source,
            reading_type=payload.reading_type,
            technician_notes=payload.technician_notes,
            recorded_at=datetime.now(timezone.utc),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record meter reading: {str(e)}",
        )


@router.get("/meters", response_model=List[MeterLedgerResponse], summary="Get Sub-Zone Meter Ledger")
def get_meter_ledger(
    community_id: str = Query("green-valley-01"),
    status_filter: Optional[str] = Query(None, description="Filter by compliance: compliant, over_quota, protected"),
    db: Session = Depends(get_db),
):
    """Retrieve sub-zone smart flow meters ledger with adherence delta and compliance status."""
    query = db.query(MeterLedger).filter(MeterLedger.community_id == community_id)
    if status_filter and status_filter != "all":
        query = query.filter(MeterLedger.compliance_status == status_filter)
    return query.all()
