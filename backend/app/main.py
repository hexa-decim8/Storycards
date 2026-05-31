from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, select, text

from app.database import engine, async_session
from app.models import Base, Project, Workspace
from app.routers import cards, projects, workspaces, zones


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # Add project_id column to workspaces if it doesn't exist (migration)
        def _check_col(sync_conn):
            try:
                cols = [c["name"] for c in inspect(sync_conn).get_columns("workspaces")]
                return "project_id" in cols
            except Exception:
                # Table doesn't exist or error checking columns
                return True

        has_col = await conn.run_sync(_check_col)
        if not has_col:
            try:
                await conn.execute(text(
                    "ALTER TABLE workspaces ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE"
                ))
            except Exception:
                # Column might already exist or other error, continue
                pass

    # Migrate orphan workspaces: assign to a default project
    async with async_session() as db:
        try:
            result = await db.execute(
                select(Workspace).where(Workspace.project_id.is_(None))
            )
            orphans = list(result.scalars().all())
            if orphans:
                default = await db.execute(
                    select(Project).where(Project.name == "Untitled Project")
                )
                project = default.scalar_one_or_none()
                if not project:
                    project = Project(name="Untitled Project")
                    db.add(project)
                    await db.flush()
                for ws in orphans:
                    ws.project_id = project.id
                await db.commit()
        except Exception:
            # Migration might not be needed if DB is fresh
            pass
    yield


app = FastAPI(title="Storycards API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(workspaces.router)
app.include_router(zones.router)
app.include_router(cards.router)


STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
ASSETS_DIR = STATIC_DIR / "assets"
INDEX_FILE = STATIC_DIR / "index.html"

if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not Found")

    requested = STATIC_DIR / full_path if full_path else INDEX_FILE
    if requested.exists() and requested.is_file():
        return FileResponse(requested)

    if INDEX_FILE.exists():
        return FileResponse(INDEX_FILE)

    raise HTTPException(status_code=404, detail="Frontend build artifacts not found")
