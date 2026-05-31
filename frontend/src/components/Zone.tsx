import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Zone as ZoneType, Card as CardType } from "../types";
import Card from "./Card";
import ZoneHeader from "./ZoneHeader";
import AddButton from "./AddButton";

interface Props {
  zone: ZoneType;
  onAddCard: (zoneId: string) => void;
  onEditCard: (card: CardType) => void;
  onDeleteZone: (zoneId: string) => void;
}

export default function Zone({ zone, onAddCard, onEditCard, onDeleteZone }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.id });

  const cardIds = zone.cards.map((c) => c.id);

  return (
    <div
      ref={setNodeRef}
      className={`zone ${isOver ? "zone-over" : ""}`}
    >
      <ZoneHeader
        name={zone.name}
        color={zone.color}
        onDelete={() => onDeleteZone(zone.id)}
      />
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="zone-cards">
          {zone.cards.map((card) => (
            <Card key={card.id} card={card} onEdit={onEditCard} />
          ))}
        </div>
      </SortableContext>
      <AddButton label="Add Card" onClick={() => onAddCard(zone.id)} />
    </div>
  );
}
