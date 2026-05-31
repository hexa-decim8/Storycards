import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { WorkspaceDetail, Card as CardType } from "../types";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import Zone from "./Zone";
import CardEditor from "./CardEditor";
import AddButton from "./AddButton";

interface Props {
  workspace: WorkspaceDetail;
  setWorkspace: (ws: WorkspaceDetail) => void;
  onAddZone: (name: string, color?: string) => void;
  onDeleteZone: (zoneId: string) => void;
  onAddCard: (zoneId: string, title: string, content?: string) => void;
  onEditCard: (cardId: string, updates: { title?: string; content?: string }) => void;
  onDeleteCard: (cardId: string) => void;
}

export default function Workspace({
  workspace,
  setWorkspace,
  onAddZone,
  onDeleteZone,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: Props) {
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const { handleDragEnd } = useDragAndDrop(workspace, setWorkspace);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddZone = () => {
    const name = prompt("Zone name:");
    if (name?.trim()) {
      onAddZone(name.trim());
    }
  };

  const handleAddCard = (zoneId: string) => {
    const title = prompt("Card title:");
    if (title?.trim()) {
      onAddCard(zoneId, title.trim());
    }
  };

  return (
    <div className="workspace">
      <div className="workspace-header">
        <h2>{workspace.name}</h2>
        <AddButton label="Add Zone" onClick={handleAddZone} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="zones-container">
          {workspace.zones.map((zone) => (
            <Zone
              key={zone.id}
              zone={zone}
              onAddCard={handleAddCard}
              onEditCard={setEditingCard}
              onDeleteZone={onDeleteZone}
            />
          ))}
        </div>
      </DndContext>
      <CardEditor
        card={editingCard}
        onSave={onEditCard}
        onDelete={onDeleteCard}
        onClose={() => setEditingCard(null)}
      />
    </div>
  );
}
