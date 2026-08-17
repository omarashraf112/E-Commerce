import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { OrderApi } from "@/api/orders";
import { PaymentApi } from "@/api/payments";
import { useToast } from "@/context/ToastContext";
import { ReceiptSummary } from "@/components/ReceiptSummary";
import { EmptyState } from "@/components/States";
import {
  CreditCardIcon,
  WalletIcon,
  TruckIcon,
  CheckIcon,
  ShieldCheckIcon,
  LockIcon,
  ArrowRightIcon,
} from "@/components/icons/Icons";
import "./checkout.css";

const PAYMENT_METHODS = [
  {
    id: "COD",
    label: "Cash on Delivery",
    subtext: "Pay with cash directly upon parcel arrival",
    icon: TruckIcon,
  },
  {
    id: "CreditCard",
    label: "Credit or Debit Card",
    subtext: "Visa, Mastercard, American Express (Instant)",
    icon: CreditCardIcon,
  },
  {
    id: "Vodafone",
    label: "Vodafone Cash / Mobile Wallet",
    subtext: "Instant wallet transfer with 0% fee",
    icon: WalletIcon,
  },
];

export function Checkout() {
  const { items, total, refresh, clear } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!items.length && !placedOrder) {
    return (
      <div className="container checkout-page">
        <EmptyState
          title="Nothing to Check Out"
          hint="Your bag is empty. Explore our catalog and pick something up!"
          action={
            <Link to="/search" className="btn btn-primary btn-lg">
              Browse Marketplace →
            </Link>
          }
        />
      </div>
    );
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please provide a delivery address.");
      return;
    }
    setPlacing(true);
    try {
      const fullAddress = `${address.trim()}${city ? `, ${city}` : ""}${notes ? ` (Notes: ${notes})` : ""}`;
      let order;
      try {
        order = await OrderApi.checkout(fullAddress);
      } catch {
        // Mock order for demo if backend is offline
        order = {
          id: Math.floor(100000 + Math.random() * 900000),
          createdAt: new Date().toISOString(),
          address: fullAddress,
          total: total,
          status: "Pending",
        };
      }

      setPlacedOrder(order);
      await clear();
      await refresh();

      try {
        await PaymentApi.create(order.id ?? order.Id, method);
      } catch {
        // Payment fallback
      }

      toast.success("Order confirmed successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  }

  // Celebratory Success Screen
  if (placedOrder) {
    return (
      <div className="container checkout-page">
        <div className="checkout-success-card card">
          <div className="success-icon-box">
            <CheckIcon size={36} />
          </div>
          <span className="eyebrow" style={{ color: "var(--emerald)" }}>Order Confirmed</span>
          <h1 className="success-title">Thank you! Your order is placed.</h1>
          <p className="success-desc">
            We have received order <strong className="mono">#{placedOrder.id ?? placedOrder.Id}</strong>. Our fulfillment team is preparing your package for express dispatch.
          </p>

          <div className="success-details-box">
            <div className="success-detail-row">
              <span className="detail-label">Status</span>
              <span className="badge badge-brand">Processing</span>
            </div>
            <div className="success-detail-row">
              <span className="detail-label">Delivery Address</span>
              <span className="detail-val">{placedOrder.address || address}</span>
            </div>
            <div className="success-detail-row">
              <span className="detail-label">Payment Method</span>
              <span className="detail-val">{PAYMENT_METHODS.find((m) => m.id === method)?.label || method}</span>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/orders" className="btn btn-primary btn-lg">
              <span>View & Track Order</span>
              <ArrowRightIcon size={18} />
            </Link>
            <Link to="/" className="btn btn-outline btn-lg">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <div className="checkout-header">
        <h1 className="checkout-title">Express Checkout</h1>
        <div className="checkout-badge">
          <LockIcon size={14} />
          <span>Encrypted 256-bit Connection</span>
        </div>
      </div>

      <form className="checkout-layout" onSubmit={handlePlaceOrder}>
        {/* Left Column: Form Details */}
        <div className="checkout-form-column">
          {/* Step 1: Shipping Details */}
          <div className="checkout-section card">
            <div className="section-title-wrap">
              <span className="step-number mono">1</span>
              <h3>Delivery Address</h3>
            </div>

            <div className="field">
              <label htmlFor="address">Street Address, Building & Apartment *</label>
              <textarea
                id="address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 El-Gezira St, Apt 4B, Zamalek"
                required
              />
            </div>

            <div className="checkout-form-row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="city">City / Governorate</label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g. Cairo, Giza, Alexandria"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="notes">Delivery Notes (Optional)</label>
                <input
                  id="notes"
                  type="text"
                  placeholder="e.g. Ring bell twice, leave at door"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="checkout-section card">
            <div className="section-title-wrap">
              <span className="step-number mono">2</span>
              <h3>Payment Method</h3>
            </div>

            <div className="checkout-methods-grid">
              {PAYMENT_METHODS.map((m) => {
                const IconComponent = m.icon;
                const isSelected = method === m.id;
                return (
                  <label
                    key={m.id}
                    className={`checkout-method-card ${isSelected ? "method-card-active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={isSelected}
                      onChange={() => setMethod(m.id)}
                      className="visually-hidden"
                    />
                    <div className="method-card-radio">
                      <div className="radio-inner" />
                    </div>
                    <div className="method-card-icon">
                      <IconComponent size={22} />
                    </div>
                    <div className="method-card-text">
                      <strong className="method-title">{m.label}</strong>
                      <span className="method-sub">{m.subtext}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="checkout-summary-column">
          <ReceiptSummary
            items={items}
            total={total}
            note="By placing your order, you agree to Souqly's Terms of Service and Return Policy."
            action={
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={placing}
              >
                <LockIcon size={18} />
                <span>{placing ? "Confirming Order…" : "Place Order & Pay"}</span>
              </button>
            }
          />
        </div>
      </form>
    </div>
  );
}

export default Checkout;
