import { useState } from "react";
import { Link } from "react-router-dom";
import { QuantitySelector } from "./QuantitySelector";
import { money } from "@/utils/format";
import { resolveImageUrl } from "@/utils/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { TrashIcon } from "@/components/icons/Icons";
import "./cartLineItem.css";

export function CartLineItem({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const quantity = item.quantity ?? item.amount ?? 1;

  async function handleQty(next) {
    setBusy(true);
    try {
      await updateQuantity(item.id, next);
    } catch (err) {
      toast.error(err.message || "Failed to update quantity.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await removeItem(item.id);
      toast("Item removed from bag.");
    } catch (err) {
      toast.error(err.message || "Failed to remove item.");
      setBusy(false);
    }
  }

  const itemId = item.productId ?? item.id;

  return (
    <div className={`cart-item-card ${busy ? "cart-item-busy" : ""}`}>
      {/* Thumbnail */}
      <Link to={`/product/${itemId}`} className="cart-item-media">
        {item.imageUrl ? (
          <img src={resolveImageUrl(item.imageUrl)} alt={item.productName || item.name} />
        ) : (
          <div className="cart-item-fallback mono">No image</div>
        )}
      </Link>

      {/* Info */}
      <div className="cart-item-info">
        <Link to={`/product/${itemId}`} className="cart-item-name">
          {item.productName || item.name}
        </Link>
        <span className="cart-item-unit mono">{money(item.price)} each</span>
      </div>

      {/* Quantity Stepper */}
      <div className="cart-item-qty">
        <QuantitySelector
          value={quantity}
          onChange={handleQty}
          disabled={busy}
          size="sm"
        />
      </div>

      {/* Line Subtotal */}
      <div className="cart-item-subtotal">
        <span className="cart-item-total-price mono">
          {money(item.subtotal ?? item.price * quantity)}
        </span>
      </div>

      {/* Remove Button */}
      <button
        className="cart-item-remove-btn"
        onClick={handleRemove}
        disabled={busy}
        aria-label={`Remove ${item.productName || item.name}`}
      >
        <TrashIcon size={16} />
      </button>
    </div>
  );
}
