import { useEffect, useState } from "react";
import * as api from "./api/client";
import type { Workspace as WorkspaceType } from "./types";
import WorkspaceView from "./components/Workspace";
import { useWorkspace } from "./hooks/useWorkspace";

export default function App() {
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { workspace, loading, error, reload, addZone, removeZone, addCard, editCard, removeCard, setWorkspace } =
    useWorkspace(activeId);

  useEffect(() => {
    api.listWorkspaces().then((list) => {
      setWorkspaces(list);
      if (list.length > 0) {
        setActiveId(list[0].id);
      }
    });
  }, []);

  const handleCreateWorkspace = async () => {
    const name = prompt("Workspace name:");
    if (!name?.trim()) return;
    const ws = await api.createWorkspace(name.trim());
    setWorkspaces((prev) => [...prev, ws]);
    setActiveId(ws.id);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Storycards</h1>
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
