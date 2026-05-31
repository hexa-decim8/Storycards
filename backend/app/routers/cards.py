import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api", tags=["cards"])


@router.post("/zones/{zone_id}/cards", response_model=schemas.CardOut, status_code=201)
async def create_card(
    zone_id: uuid.UUID, body: schemas.CardCreate, db: AsyncSession = Depends(get_db)
):
    zone = await crud.get_zone(db, zone_id)
    if not zone:
        raise HTTPException(404, "Zone not found")
    return await crud.create_card(db, zone_id, body.title, body.content)


@router.patch("/cards/{card_id}", response_model=schemas.CardOut)
async def update_card(
    card_id: uuid.UUID, body: schemas.CardUpdate, db: AsyncSession = Depends(get_db)
):
    card = await crud.get_card(db, card_id)
    if not card:
        raise HTTPException(404, "Card not found")
    return await crud.update_card(db, card, body.title, body.content)


@router.delete("/cards/{card_id}", status_code=204)
async def delete_card(card_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    card = await crud.get_card(db, card_id)
    if not card:
        raise HTTPException(404, "Card not found")
    await crud.delete_card(db, card)


@router.post("/cards/reorder", status_code=204)
async def reorder_cards(body: schemas.CardReorderRequest, db: AsyncSession = Depends(get_db)):
    items = [{"id": c.id, "zone_id": c.zone_id, "sort_order": c.sort_order} for c in body.cards]
    await crud.reorder_cards(db, items)
