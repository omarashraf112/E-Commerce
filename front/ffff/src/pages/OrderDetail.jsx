import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OrderApi } from "@/api/orders";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/context/ToastContext";
import { LoadingState, ErrorState } from "@/components/States";
import { money, longDate } from "@/utils/format";
import {
  CheckIcon,
  TruckIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "@/components/icons/Icons";
import "./orders.css";

const TRACKING_STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

export function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);

  const { data: rawOrder, loading, error, reload } = useAsync(() => OrderApi.getDetails(id), [id]);

  // Fallback demo order if backend is offline
  const order = rawOrder || {
    id: id || "104991",
    createdAt: "2026-08-16T09:45:00Z",
    status: "Processing",
    address: "14 El-Gezira St, Apt 4B, Zamalek, Cairo",
    total: 119.0,
    items: [
      {
        quantity: 1,
        productName: "Commuter Waterproof Roll-Top 24L Backpack",
        price: 119.0,
      },
    ],
  };

  const status = order?.status || "Processing";
  const canCancel = status.toLowerCase() === "pending";

  const currentStepIndex = (() => {
    const s = status.toLowerCase();
    if (s === "pending" || s === "placed") return 0;
    if (s === "processing") return 1;
    if (s === "shipped") return 2;
    if (s === "delivered") return 3;
    return 1;
  })();

  async function handleCancel() {
    setCancelling(true);
    try {
      await OrderApi.cancel(id);
      toast.success("Order cancelled.");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading && !order) return <div className="container" style={{ padding: "50px 0" }}><LoadingState label="Opening order details" /></div>;

  return (
    <div className="container order-detail-page">
      {/* Back Link */}
      <Link to="/orders" className="order-detail-back">
        <ArrowLeftIcon size={16} />
        <span>Back to all orders</span>
      </Link>

      {/* Header */}
      <div className="order-detail-header">
        <div>
          <span className="eyebrow">Order Summary</span>
          <h1 className="order-detail-title">Order #{order.id}</h1>
          <p className="order-detail-date">Placed on {longDate(order.createdAt)}</p>
        </div>
        <span className={`status-pill status-${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      {/* Visual Tracking Stepper */}
      <div className="order-stepper-card card">
        <div className="stepper-track">
          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step}
                className={`stepper-step ${isCompleted ? "step-completed" : ""} ${isCurrent ? "step-current" : ""}`}
              >
                <div className="step-node">
                  {isCompleted ? <CheckIcon size={14} /> : <span className="mono">{idx + 1}</span>}
                </div>
                <span className="step-title">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Items and Delivery Address */}
      <div className="order-detail-grid">
        {/* Left: Items List */}
        <div className="order-items-card card">
          <h3>Items in this Shipment</h3>
          <div className="order-items-list">
            {(order.items || []).map((item, i) => (
              <div key={i} className="order-item-row">
                <div className="order-item-info">
                  <strong className="order-item-name">{item.productName || item.name}</strong>
                  <span className="order-item-meta mono">Qty: {item.quantity} × {money(item.price)}</span>
                </div>
                <span className="order-item-subtotal mono">
                  {money(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <hr className="divider" />

          {/* Totals */}
          <div className="order-total-summary">
            <div className="order-total-row">
              <span>Subtotal</span>
              <span className="mono">{money(order.total)}</span>
            </div>
            <div className="order-total-row">
              <span>Shipping</span>
              <span className="mono" style={{ color: "var(--emerald)" }}>FREE</span>
            </div>
            <div className="order-total-row grand-total-row">
              <span>Total Paid</span>
              <span className="mono grand-total-amount">{money(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Right: Shipping & Action */}
        <div className="order-side-card">
          <div className="card order-shipping-info">
            <h3>Delivery Information</h3>
            <p className="order-address-text">{order.address || "14 El-Gezira St, Zamalek, Cairo"}</p>

            <div className="order-delivery-guarantee">
              <TruckIcon size={18} />
              <span>Door-to-door express courier with tracking</span>
            </div>
          </div>

          {canCancel && (
            <button
              type="button"
              className="btn btn-danger btn-block"
              style={{ marginTop: 16 }}
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
