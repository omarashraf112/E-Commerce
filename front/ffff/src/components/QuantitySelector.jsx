import { PlusIcon, MinusIcon } from "@/components/icons/Icons";
import "./quantitySelector.css";

export function QuantitySelector({ value, onChange, min = 1, max = 99, disabled, size = "md" }) {
  const dec = (e) => {
    e?.preventDefault?.();
    onChange(Math.max(min, value - 1));
  };
  const inc = (e) => {
    e?.preventDefault?.();
    onChange(Math.min(max, value + 1));
  };

  return (
    <div className={`qty-selector qty-${size} ${disabled ? "qty-disabled" : ""}`}>
      <button
        type="button"
        className="qty-btn"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <MinusIcon size={size === "sm" ? 12 : 14} />
      </button>
      <span className="qty-value mono" aria-live="polite">{value}</span>
      <button
        type="button"
        className="qty-btn"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <PlusIcon size={size === "sm" ? 12 : 14} />
      </button>
    </div>
  );
}
