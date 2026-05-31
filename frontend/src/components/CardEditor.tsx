import { useState, useEffect } from "react";
import type { Card } from "../types";

interface Props {
  card: Card | null;
  onSave: (id: string, updates: { title?: string; content?: string }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function CardEditor({ card, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setContent(card.content);
    }
  }, [card]);

  if (!card) return null;

  const handleSave = () => {
    onSave(card.id, { title, content });
    onClose();
  };

  const handleDelete = () => {
    onDelete(card.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Card</h3>
        <input
          className="modal-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card title"
          autoFocus
        />
        <textarea
          className="modal-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here..."
          rows={6}
        />
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
          <div>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
