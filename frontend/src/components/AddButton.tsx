interface Props {
  label: string;
  onClick: () => void;
}

export default function AddButton({ label, onClick }: Props) {
  return (
    <button className="add-btn" onClick={onClick}>
      + {label}
    </button>
  );
}
