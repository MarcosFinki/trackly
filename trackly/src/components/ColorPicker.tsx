import "./ColorPicker.css";

export const PROJECT_COLORS = [
  "#2e86ab", // azul default
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({
  value,
  onChange,
}: Props) {
  return (
    <div className="color-picker">
      {PROJECT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`color-swatch ${
            value === color ? "selected" : ""
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}