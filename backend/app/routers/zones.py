import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api", tags=["zones"])


@router.post("/workspaces/{workspace_id}/zones", response_model=schemas.ZoneOut, status_code=201)
async def create_zone(
    workspace_id: uuid.UUID, body: schemas.ZoneCreate, db: AsyncSession = Depends(get_db)
):
    ws = await crud.get_workspace(db, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")
    zone = await crud.create_zone(db, workspace_id, body.name, body.color)
    # reload with cards relationship
    zone = await crud.get_zone(db, zone.id)
    return zone


@router.patch("/zones/{zone_id}", response_model=schemas.ZoneOut)
async def update_zone(
    zone_id: uuid.UUID, body: schemas.ZoneUpdate, db: AsyncSession = Depends(get_db)
):
    zone = await crud.get_zone(db, zone_id)
    if not zone:
        raise HTTPException(404, "Zone not found")
    return await crud.update_zone(db, zone, body.name, body.color, body.display_order)


@router.delete("/zones/{zone_id}", status_code=204)
async def delete_zone(zone_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    zone = await crud.get_zone(db, zone_id)
    if not zone:
        raise HTTPException(404, "Zone not found")
    await crud.delete_zone(db, zone)
