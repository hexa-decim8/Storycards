interface Props {
  name: string;
  color: string;
  onDelete: () => void;
}

export default function ZoneHeader({ name, color, onDelete }: Props) {
  return (
    <div className="zone-header">
      <div className="zone-color" style={{ backgroundColor: color }} />
      <h3 className="zone-name">{name}</h3>
      <button className="btn-icon" onClick={onDelete} title="Delete zone">
        ✕
      </button>
    </div>
  );
}
