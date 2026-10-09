from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.community import Community
from app.schemas.community import CommunityResponse, CommunityUpdate, CommunityCreate

router = APIRouter(prefix="/communities", tags=["Communities"])


@router.get("", response_model=List[CommunityResponse], summary="List Communities")
def list_communities(db: Session = Depends(get_db)):
    """Retrieve all monitored communities."""
    return db.query(Community).all()


@router.get("/{community_id}", response_model=CommunityResponse, summary="Get Community Details")
def get_community(community_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed metadata and hydrological constraints for a specific community."""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{community_id}' not found.",
        )
    return community


@router.put("/{community_id}", response_model=CommunityResponse, summary="Update Community Settings")
def update_community(
    community_id: str,
    payload: CommunityUpdate,
    db: Session = Depends(get_db),
):
    """Update community parameters such as population, daily yield cap, and reserve floor."""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{community_id}' not found.",
        )

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(community, field, val)

    db.commit()
    db.refresh(community)
    return community
