import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "../types";

interface Props {
  card: CardType;
  onEdit: (card: CardType) => void;
}

export default function Card({ card, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card"
      {...attributes}
      {...listeners}
      onClick={() => onEdit(card)}
    >
      <h4 className="card-title">{card.title}</h4>
      {card.content && (
        <p className="card-content">
          {card.content.length > 120 ? card.content.slice(0, 120) + "…" : card.content}
        </p>
      )}
    </div>
  );
}
