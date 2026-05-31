import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import * as api from "../api/client";
import type { WorkspaceDetail } from "../types";

export function useDragAndDrop(
  workspace: WorkspaceDetail | null,
  setWorkspace: (ws: WorkspaceDetail) => void
) {
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!workspace) return;

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;

      // Find source zone and card
      let sourceZoneIdx = -1;
      let sourceCardIdx = -1;
      for (let zi = 0; zi < workspace.zones.length; zi++) {
        const ci = workspace.zones[zi].cards.findIndex((c) => c.id === activeId);
        if (ci !== -1) {
          sourceZoneIdx = zi;
          sourceCardIdx = ci;
          break;
        }
      }
      if (sourceZoneIdx === -1) return;

      const overId = over.id as string;

      // Determine target zone: is `over` a card or a zone?
      let targetZoneIdx = workspace.zones.findIndex((z) => z.id === overId);
      let targetCardIdx = -1;

      if (targetZoneIdx === -1) {
        // over is a card — find its zone
        for (let zi = 0; zi < workspace.zones.length; zi++) {
          const ci = workspace.zones[zi].cards.findIndex((c) => c.id === overId);
          if (ci !== -1) {
            targetZoneIdx = zi;
            targetCardIdx = ci;
            break;
          }
        }
      }
      if (targetZoneIdx === -1) return;

      // Clone workspace for optimistic update
      const newZones = workspace.zones.map((z) => ({
        ...z,
        cards: [...z.cards],
      }));

      const [movedCard] = newZones[sourceZoneIdx].cards.splice(sourceCardIdx, 1);

      if (sourceZoneIdx === targetZoneIdx) {
        // Same zone reorder
        if (targetCardIdx === -1) {
          // Dropped on zone itself — append to end
          newZones[targetZoneIdx].cards.push(movedCard);
        } else {
          // Use arrayMove for same-zone
          // Card was already removed, so insert at target position
          newZones[targetZoneIdx].cards.splice(targetCardIdx, 0, movedCard);
        }
      } else {
        // Cross-zone move
        movedCard.zone_id = newZones[targetZoneIdx].id;
        if (targetCardIdx === -1) {
          newZones[targetZoneIdx].cards.push(movedCard);
        } else {
          newZones[targetZoneIdx].cards.splice(targetCardIdx, 0, movedCard);
        }
      }

      // Recalculate sort_order for affected zones
      const affectedZoneIndices = new Set([sourceZoneIdx, targetZoneIdx]);
      const reorderPayload: { id: string; zone_id: string; sort_order: number }[] = [];

      for (const zi of affectedZoneIndices) {
        newZones[zi].cards.forEach((card, idx) => {
          card.sort_order = idx;
          reorderPayload.push({
            id: card.id,
            zone_id: newZones[zi].id,
            sort_order: idx,
          });
        });
      }

      // Optimistic update
      setWorkspace({ ...workspace, zones: newZones });

      // Persist
      try {
        await api.reorderCards(reorderPayload);
      } catch {
        // Rollback on failure — just reload would be handled by caller
        console.error("Failed to reorder cards");
      }
    },
    [workspace, setWorkspace]
  );

  return { handleDragEnd };
}
