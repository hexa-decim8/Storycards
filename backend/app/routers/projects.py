import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[schemas.ProjectOut])
async def list_projects(db: AsyncSession = Depends(get_db)):
    return await crud.get_projects(db)


@router.post("", response_model=schemas.ProjectOut, status_code=201)
async def create_project(body: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    existing = await crud.get_project_by_name(db, body.name.strip())
    if existing:
        raise HTTPException(409, "A project with that name already exists")
    return await crud.create_project(db, body.name.strip())


@router.get("/by-name/{name}", response_model=schemas.ProjectDetail)
async def get_project_by_name(name: str, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project_by_name(db, name)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.get("/{project_id}", response_model=schemas.ProjectDetail)
async def get_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project(db, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.patch("/{project_id}", response_model=schemas.ProjectOut)
async def update_project(
    project_id: uuid.UUID, body: schemas.ProjectUpdate, db: AsyncSession = Depends(get_db)
):
    project = await crud.get_project(db, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    if body.name is not None:
        existing = await crud.get_project_by_name(db, body.name.strip())
        if existing and existing.id != project_id:
            raise HTTPException(409, "A project with that name already exists")
    return await crud.update_project(db, project, body.name)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project(db, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    await crud.delete_project(db, project)


# ── Workspaces scoped to project ───────────────────────────


@router.get("/{project_id}/workspaces", response_model=list[schemas.WorkspaceOut])
async def list_project_workspaces(
    project_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    project = await crud.get_project(db, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return await crud.get_workspaces(db, project_id)


@router.post("/{project_id}/workspaces", response_model=schemas.WorkspaceOut, status_code=201)
async def create_project_workspace(
    project_id: uuid.UUID, body: schemas.WorkspaceCreate, db: AsyncSession = Depends(get_db)
):
    project = await crud.get_project(db, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return await crud.create_workspace(db, project_id, body.name)
