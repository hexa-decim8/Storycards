import uuid
from datetime import datetime

from pydantic import BaseModel


# ── Workspace ──────────────────────────────────────────────


class WorkspaceCreate(BaseModel):
    name: str


class WorkspaceUpdate(BaseModel):
    name: str | None = None


class WorkspaceOut(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkspaceDetail(WorkspaceOut):
    zones: list["ZoneOut"] = []


# ── Zone ───────────────────────────────────────────────────


class ZoneCreate(BaseModel):
    name: str
    color: str = "#6366f1"


class ZoneUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    display_order: int | None = None


class ZoneOut(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    display_order: int
    color: str
    created_at: datetime
    updated_at: datetime
    cards: list["CardOut"] = []

    model_config = {"from_attributes": True}


# ── Card ───────────────────────────────────────────────────


class CardCreate(BaseModel):
    title: str
    content: str = ""


class CardUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class CardOut(BaseModel):
    id: uuid.UUID
    zone_id: uuid.UUID
    title: str
    content: str
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CardReorderItem(BaseModel):
    id: uuid.UUID
    zone_id: uuid.UUID
    sort_order: int


class CardReorderRequest(BaseModel):
    cards: list[CardReorderItem]
