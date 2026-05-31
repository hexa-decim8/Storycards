import { useEffect, useState } from "react";
import * as api from "./api/client";
import type { Workspace as WorkspaceType } from "./types";
import WorkspaceView from "./components/Workspace";
import ProjectPicker from "./components/ProjectPicker";
import { useWorkspace } from "./hooks/useWorkspace";

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { workspace, loading, error, addZone, removeZone, addCard, editCard, removeCard, setWorkspace } =
    useWorkspace(activeId);

  useEffect(() => {
    if (!activeProjectId) {
      setWorkspaces([]);
      setActiveId(null);
      return;
    }
    api.listWorkspaces(activeProjectId).then((list) => {
      setWorkspaces(list);
      if (list.length > 0) {
        setActiveId(list[0].id);
      } else {
        setActiveId(null);
      }
    });
  }, [activeProjectId]);

  const handleCreateWorkspace = async () => {
    if (!activeProjectId) return;
    const name = prompt("Workspace name:");
    if (!name?.trim()) return;
    const ws = await api.createWorkspace(activeProjectId, name.trim());
    setWorkspaces((prev) => [...prev, ws]);
    setActiveId(ws.id);
  };

  if (!activeProjectId) {
    return <ProjectPicker onSelect={setActiveProjectId} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-header-left">
          <button
            className="btn btn-secondary back-btn"
            onClick={() => setActiveProjectId(null)}
          >
            ← Projects
          </button>
          <h1>Storycards</h1>
        </div>
        <div className="workspace-list">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              className={`workspace-tab ${ws.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(ws.id)}
            >
              {ws.name}
            </button>
          ))}
          <button className="workspace-tab" onClick={handleCreateWorkspace}>
            + New
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error">{error}</div>}

      {workspace && (
        <WorkspaceView
          workspace={workspace}
          setWorkspace={setWorkspace}
          onAddZone={addZone}
          onDeleteZone={removeZone}
          onAddCard={addCard}
          onEditCard={editCard}
          onDeleteCard={removeCard}
        />
      )}

      {!loading && !workspace && !error && (
        <div className="loading">
          Create a workspace to get started.
        </div>
      )}
    </div>
  );
}
