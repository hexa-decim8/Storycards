import { useEffect, useState } from "react";
import type { Project } from "../types";
import * as api from "../api/client";

interface Props {
  onSelect: (projectId: string) => void;
}

export default function ProjectPicker({ onSelect }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listProjects();
      setProjects(list);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      const project = await api.createProject(name);
      setNewName("");
      onSelect(project.id);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("A project with that name already exists");
      } else {
        setError("Failed to create project");
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}" and all its workspaces, zones, and cards?`)) return;
    try {
      await api.deleteProject(id);
      await load();
    } catch {
      setError("Failed to delete project");
    }
  };

  return (
    <div className="project-picker">
      <div className="project-picker-header">
        <h1>Storycards</h1>
        <p>Select a project or create a new one.</p>
      </div>

      {error && <div className="error">{error}</div>}

      <form className="project-create-form" onSubmit={handleCreate}>
        <input
          className="project-create-input"
          type="text"
          placeholder="New project name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
        />
        <button className="btn btn-primary" type="submit" disabled={!newName.trim()}>
          Create
        </button>
      </form>

      {loading && <div className="loading">Loading…</div>}

      {!loading && projects.length === 0 && (
        <div className="project-empty">No projects yet. Create one above to get started.</div>
      )}

      <div className="project-grid">
        {projects.map((p) => (
          <div key={p.id} className="project-card" onClick={() => onSelect(p.id)}>
            <div className="project-card-name">{p.name}</div>
            <div className="project-card-date">
              {new Date(p.created_at).toLocaleDateString()}
            </div>
            <button
              className="project-card-delete btn-icon"
              title="Delete project"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(p.id, p.name);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
