import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


@router.get("/{workspace_id}", response_model=schemas.WorkspaceDetail)
async def get_workspace(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    ws = await crud.get_workspace(db, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")
    return ws


@router.patch("/{workspace_id}", response_model=schemas.WorkspaceOut)
async def update_workspace(
    workspace_id: uuid.UUID, body: schemas.WorkspaceUpdate, db: AsyncSession = Depends(get_db)
):
    ws = await crud.get_workspace(db, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")
    return await crud.update_workspace(db, ws, body.name)


@router.delete("/{workspace_id}", status_code=204)
async def delete_workspace(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    ws = await crud.get_workspace(db, workspace_id)
    if not ws:
        raise HTTPException(404, "Workspace not found")
    await crud.delete_workspace(db, ws)
