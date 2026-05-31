import { useCallback, useEffect, useState } from "react";
import * as api from "../api/client";
import type { WorkspaceDetail } from "../types";

export function useWorkspace(workspaceId: string | null) {
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const ws = await api.getWorkspace(workspaceId);
      setWorkspace(ws);
    } catch {
      setError("Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addZone = useCallback(
    async (name: string, color?: string) => {
      if (!workspaceId) return;
      await api.createZone(workspaceId, name, color);
      await reload();
    },
    [workspaceId, reload]
  );

  const removeZone = useCallback(
    async (zoneId: string) => {
      await api.deleteZone(zoneId);
      await reload();
    },
    [reload]
  );

  const addCard = useCallback(
    async (zoneId: string, title: string, content?: string) => {
      await api.createCard(zoneId, title, content);
      await reload();
    },
    [reload]
  );

  const editCard = useCallback(
    async (cardId: string, updates: { title?: string; content?: string }) => {
      await api.updateCard(cardId, updates);
      await reload();
    },
    [reload]
  );

  const removeCard = useCallback(
    async (cardId: string) => {
      await api.deleteCard(cardId);
      await reload();
    },
    [reload]
  );

  return {
    workspace,
    loading,
    error,
    reload,
    addZone,
    removeZone,
    addCard,
    editCard,
    removeCard,
    setWorkspace,
  };
}
