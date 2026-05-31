export interface Card {
  id: string;
  zone_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  workspace_id: string;
  name: string;
  display_order: number;
  color: string;
  created_at: string;
  updated_at: string;
  cards: Card[];
}

export interface Workspace {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDetail extends Workspace {
  zones: Zone[];
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  workspaces: Workspace[];
}
