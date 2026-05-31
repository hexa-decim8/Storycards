import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Card, Workspace, Zone


# ── Workspaces ─────────────────────────────────────────────


async def get_workspaces(db: AsyncSession) -> list[Workspace]:
    result = await db.execute(select(Workspace).order_by(Workspace.created_at))
    return list(result.scalars().all())


async def get_workspace(db: AsyncSession, workspace_id: uuid.UUID) -> Workspace | None:
    result = await db.execute(
        select(Workspace)
        .where(Workspace.id == workspace_id)
        .options(selectinload(Workspace.zones).selectinload(Zone.cards))
    )
    return result.scalar_one_or_none()


async def create_workspace(db: AsyncSession, name: str) -> Workspace:
    ws = Workspace(name=name)
    db.add(ws)
    await db.commit()
    await db.refresh(ws)
    return ws


async def update_workspace(db: AsyncSession, workspace: Workspace, name: str | None) -> Workspace:
    if name is not None:
        workspace.name = name
    await db.commit()
    await db.refresh(workspace)
    return workspace


async def delete_workspace(db: AsyncSession, workspace: Workspace) -> None:
    await db.delete(workspace)
    await db.commit()


# ── Zones ──────────────────────────────────────────────────


async def create_zone(db: AsyncSession, workspace_id: uuid.UUID, name: str, color: str) -> Zone:
    result = await db.execute(
        select(func.coalesce(func.max(Zone.display_order), -1)).where(
            Zone.workspace_id == workspace_id
        )
    )
    max_order = result.scalar_one()
    zone = Zone(workspace_id=workspace_id, name=name, color=color, display_order=max_order + 1)
    db.add(zone)
    await db.commit()
    await db.refresh(zone)
    return zone


async def get_zone(db: AsyncSession, zone_id: uuid.UUID) -> Zone | None:
    result = await db.execute(select(Zone).where(Zone.id == zone_id))
    return result.scalar_one_or_none()


async def update_zone(
    db: AsyncSession, zone: Zone, name: str | None, color: str | None, display_order: int | None
) -> Zone:
    if name is not None:
        zone.name = name
    if color is not None:
        zone.color = color
    if display_order is not None:
        zone.display_order = display_order
    await db.commit()
    await db.refresh(zone)
    return zone


async def delete_zone(db: AsyncSession, zone: Zone) -> None:
    await db.delete(zone)
    await db.commit()


# ── Cards ──────────────────────────────────────────────────


async def create_card(db: AsyncSession, zone_id: uuid.UUID, title: str, content: str) -> Card:
    result = await db.execute(
        select(func.coalesce(func.max(Card.sort_order), -1)).where(Card.zone_id == zone_id)
    )
    max_order = result.scalar_one()
    card = Card(zone_id=zone_id, title=title, content=content, sort_order=max_order + 1)
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card


async def get_card(db: AsyncSession, card_id: uuid.UUID) -> Card | None:
    result = await db.execute(select(Card).where(Card.id == card_id))
    return result.scalar_one_or_none()


async def update_card(db: AsyncSession, card: Card, title: str | None, content: str | None) -> Card:
    if title is not None:
        card.title = title
    if content is not None:
        card.content = content
    await db.commit()
    await db.refresh(card)
    return card


async def delete_card(db: AsyncSession, card: Card) -> None:
    await db.delete(card)
    await db.commit()


async def reorder_cards(db: AsyncSession, items: list[dict]) -> None:
    for item in items:
        result = await db.execute(select(Card).where(Card.id == item["id"]))
        card = result.scalar_one_or_none()
        if card:
            card.zone_id = item["zone_id"]
            card.sort_order = item["sort_order"]
    await db.commit()
