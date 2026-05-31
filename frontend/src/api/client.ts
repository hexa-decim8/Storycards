import axios from "axios";
import type { Card, Project, ProjectDetail, WorkspaceDetail, Workspace, Zone } from "../types";

const api = axios.create({ baseURL: "/api" });

// ── Projects ──────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects");
  return data;
}

export async function createProject(name: string): Promise<Project> {
  const { data } = await api.post("/projects", { name });
  return data;
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const { data } = await api.get(`/projects/${id}`);
  return data;
}

export async function getProjectByName(name: string): Promise<ProjectDetail> {
  const { data } = await api.get(`/projects/by-name/${encodeURIComponent(name)}`);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

// ── Workspaces ────────────────────────────────────────────

export async function listWorkspaces(projectId: string): Promise<Workspace[]> {
  const { data } = await api.get(`/projects/${projectId}/workspaces`);
  return data;
}

export async function createWorkspace(projectId: string, name: string): Promise<Workspace> {
  const { data } = await api.post(`/projects/${projectId}/workspaces`, { name });
  return data;
}

export async function getWorkspace(id: string): Promise<WorkspaceDetail> {
  const { data } = await api.get(`/workspaces/${id}`);
  return data;
}

export async function updateWorkspace(id: string, name: string): Promise<Workspace> {
  const { data } = await api.patch(`/workspaces/${id}`, { name });
  return data;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await api.delete(`/workspaces/${id}`);
}

// ── Zones ─────────────────────────────────────────────────

export async function createZone(
  workspaceId: string,
  name: string,
  color?: string
): Promise<Zone> {
  const { data } = await api.post(`/workspaces/${workspaceId}/zones`, { name, color });
  return data;
}

export async function updateZone(
  id: string,
  updates: { name?: string; color?: string; display_order?: number }
): Promise<Zone> {
  const { data } = await api.patch(`/zones/${id}`, updates);
  return data;
}

export async function deleteZone(id: string): Promise<void> {
  await api.delete(`/zones/${id}`);
}

// ── Cards ─────────────────────────────────────────────────

export async function createCard(
  zoneId: string,
  title: string,
  content?: string
): Promise<Card> {
  const { data } = await api.post(`/zones/${zoneId}/cards`, { title, content });
  return data;
}

export async function updateCard(
  id: string,
  updates: { title?: string; content?: string }
): Promise<Card> {
  const { data } = await api.patch(`/cards/${id}`, updates);
  return data;
}

export async function deleteCard(id: string): Promise<void> {
  await api.delete(`/cards/${id}`);
}

export async function reorderCards(
  cards: { id: string; zone_id: string; sort_order: number }[]
): Promise<void> {
  await api.post("/cards/reorder", { cards });
}
