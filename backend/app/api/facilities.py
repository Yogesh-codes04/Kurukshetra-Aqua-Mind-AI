from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.allocation import Facility
from app.models.water_source import WaterSource
from app.schemas.allocation import (
    FacilityResponse,
    FacilityCreate,
    FacilityUpdate,
    RunSimulationRequest,
    SimulationResultResponse,
)
from app.schemas.water_source import WaterSourceResponse, WaterSourceUpdate
from app.services.allocation_service import run_water_allocation_simulation

router = APIRouter(tags=["Facilities & Allocation Simulation"])


@router.get("/facilities", response_model=List[FacilityResponse], summary="List Facilities")
def list_facilities(
    community_id: str = Query("green-valley-01"),
    db: Session = Depends(get_db),
):
    """Retrieve all community facilities in the registry."""
    return db.query(Facility).filter(Facility.community_id == community_id).all()


@router.post("/facilities", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED, summary="Add Facility")
def create_facility(
    payload: FacilityCreate,
    db: Session = Depends(get_db),
):
    """Add a new facility to the community registry with demand and priority metrics."""
    # Check duplicate name
    existing = (
        db.query(Facility)
        .filter(Facility.community_id == payload.community_id, Facility.name.ilike(payload.name.strip()))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A facility named '{payload.name.strip()}' already exists.",
        )

    fac_id = payload.id or f"fac-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    facility = Facility(
        id=fac_id,
        community_id=payload.community_id,
        name=payload.name.strip(),
        type=payload.type,
        demand_liters=payload.demand_liters,
        min_liters=payload.min_liters,
        priority=payload.priority,
        people_served=payload.people_served,
        notes=payload.notes,
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


@router.put("/facilities/{facility_id}", response_model=FacilityResponse, summary="Update Facility")
def update_facility(
    facility_id: str,
    payload: FacilityUpdate,
    db: Session = Depends(get_db),
):
    """Update details for an existing community facility."""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility '{facility_id}' not found.",
        )

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(facility, field, val)

    db.commit()
    db.refresh(facility)
    return facility


@router.delete("/facilities/{facility_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Facility")
def delete_facility(
    facility_id: str,
    db: Session = Depends(get_db),
):
    """Remove a facility from the community registry."""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility '{facility_id}' not found.",
        )
    db.delete(facility)
    db.commit()
    return None


@router.post("/simulation/run", response_model=SimulationResultResponse, summary="Execute Water Allocation Simulation")
def run_simulation(
    payload: RunSimulationRequest,
    db: Session = Depends(get_db),
):
    """Execute the deterministic water allocation simulation algorithm given available supply and facilities."""
    facilities = payload.facilities
    if not facilities:
        facilities = db.query(Facility).filter(Facility.community_id == payload.community_id).all()

    return run_water_allocation_simulation(
        facilities=facilities,
        daily_supply_liters=payload.water_availability.dailySupplyLiters,
    )


@router.get("/water-sources", response_model=WaterSourceResponse, summary="Get Water Availability & Reservoir Status")
def get_water_source(
    community_id: str = Query("green-valley-01"),
    db: Session = Depends(get_db),
):
    """Retrieve primary reservoir and storage status."""
    source = db.query(WaterSource).filter(WaterSource.community_id == community_id).first()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water source not found.")
    return source


@router.put("/water-sources", response_model=WaterSourceResponse, summary="Update Water Availability Parameters")
def update_water_source(
    payload: WaterSourceUpdate,
    community_id: str = Query("green-valley-01"),
    db: Session = Depends(get_db),
):
    """Update current daily available supply or storage levels."""
    source = db.query(WaterSource).filter(WaterSource.community_id == community_id).first()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water source not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(source, field, val)

    db.commit()
    db.refresh(source)
    return source
