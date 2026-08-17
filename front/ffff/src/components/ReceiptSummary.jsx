import { useState } from "react";
import { money } from "@/utils/format";
import { LockIcon, ShieldCheckIcon, TruckIcon, BadgePercentIcon } from "@/components/icons/Icons";
import "./receiptSummary.css";

const FREE_SHIPPING_THRESHOLD = 50.0;

export function ReceiptSummary({ items = [], total = 0, action, note }) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const subtotal = total;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = freeShipping || subtotal === 0 ? 0 : 9.99;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const finalTotal = Math.max(0, subtotal + shippingFee - appliedDiscount);

  function handleApplyCoupon(e) {
    e.preventDefault();
    setCouponError("");
    const trimmed = couponCode.trim().toUpperCase();
    if (trimmed === "SOUQLY10" || trimmed === "SUMMER10") {
      const discount = subtotal * 0.1;
      setAppliedDiscount(discount);
    } else if (trimmed === "FREESHIP") {
      setAppliedDiscount(shippingFee);
    } else {
      setCouponError("Invalid or expired coupon code.");
    }
  }

  return (
    <div className="receipt-summary-card card">
      {/* Free Shipping Progress Bar */}
      <div className="free-shipping-progress">
        <div className="shipping-progress-text">
          <TruckIcon size={16} />
          {freeShipping ? (
            <span className="free-shipping-unlocked">🎉 You qualified for <strong>FREE Shipping!</strong></span>
          ) : (
            <span>Add <strong>{money(remainingForFreeShipping)}</strong> more for FREE shipping</span>
          )}
        </div>
        <div className="shipping-progress-track">
          <div
            className="shipping-progress-fill"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      <h3 className="receipt-heading">Order Summary</h3>

      {/* Item Lines */}
      <div className="receipt-items-list">
        {items.map((item) => (
          <div className="receipt-item-row" key={item.id ?? item.productId}>
            <span className="receipt-item-name">
              {(item.quantity ?? item.amount ?? 1)}× {item.productName || item.name}
            </span>
            <span className="receipt-item-price mono">
              {money(item.subtotal ?? item.price * (item.quantity ?? item.amount ?? 1))}
            </span>
          </div>
        ))}
      </div>

      <hr className="receipt-divider" />

      {/* Breakdown */}
      <div className="receipt-breakdown">
        <div className="breakdown-row">
          <span>Subtotal</span>
          <span className="mono">{money(subtotal)}</span>
        </div>
        <div className="breakdown-row">
          <span>Estimated Shipping</span>
          <span className="mono">
            {freeShipping || subtotal === 0 ? (
              <strong style={{ color: "var(--emerald)" }}>FREE</strong>
            ) : (
              money(shippingFee)
            )}
          </span>
        </div>
        {appliedDiscount > 0 && (
          <div className="breakdown-row discount-row">
            <span>Promo Discount</span>
            <span className="mono">- {money(appliedDiscount)}</span>
          </div>
        )}
      </div>

      {/* Promo Code Input */}
      <form className="coupon-form" onSubmit={handleApplyCoupon}>
        <div className="coupon-input-wrap">
          <BadgePercentIcon size={16} className="coupon-icon" />
          <input
            type="text"
            placeholder="Promo code (e.g. SOUQLY10)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button type="submit" className="coupon-apply-btn">
            Apply
          </button>
        </div>
        {couponError && <p className="coupon-error">{couponError}</p>}
        {appliedDiscount > 0 && (
          <p className="coupon-success">✓ Promo applied successfully!</p>
        )}
      </form>

      <hr className="receipt-divider" />

      {/* Total */}
      <div className="receipt-total-row">
        <span>Total</span>
        <span className="receipt-grand-total mono">{money(finalTotal)}</span>
      </div>

      {note && <p className="receipt-note">{note}</p>}
      {action && <div className="receipt-action-wrap">{action}</div>}

      {/* Trust Badges */}
      <div className="receipt-trust-badges">
        <div className="trust-badge">
          <LockIcon size={14} />
          <span>SSL 256-Bit Encrypted Checkout</span>
        </div>
        <div className="trust-badge">
          <ShieldCheckIcon size={14} />
          <span>30-Day Hassle-Free Returns</span>
        </div>
      </div>
    </div>
  );
}
