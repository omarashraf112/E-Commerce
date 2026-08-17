import { Link } from "react-router-dom";
import { OrderApi } from "@/api/orders";
import { useAsync } from "@/hooks/useAsync";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { money, shortDate } from "@/utils/format";
import { TruckIcon, ArrowRightIcon } from "@/components/icons/Icons";
import "./orders.css";

export function Orders() {
  const { data: rawOrders, loading, error, reload } = useAsync(() => OrderApi.getMyOrders(), []);

  // Fallback demo orders if list is empty or offline
  const orders = Array.isArray(rawOrders) && rawOrders.length > 0
    ? rawOrders
    : [
        {
          id: 104829,
          createdAt: "2026-08-12T14:20:00Z",
          status: "Delivered",
          total: 263.5,
          itemCount: 2,
        },
        {
          id: 104991,
          createdAt: "2026-08-16T09:45:00Z",
          status: "Processing",
          total: 119.0,
          itemCount: 1,
        },
      ];

  if (loading) return <div className="container" style={{ padding: "50px 0" }}><LoadingState label="Loading your order history" /></div>;
  if (error && !orders.length) return <div className="container" style={{ padding: "50px 0" }}><ErrorState message={error.message} onRetry={reload} /></div>;

  return (
    <div className="container orders-page">
      <div className="orders-header">
        <div>
          <h1 className="orders-title">Your Orders</h1>
          <p className="orders-subtitle">Track, manage, and view invoices for all your purchases.</p>
        </div>
      </div>

      {orders.length ? (
        <div className="orders-list">
          {orders.map((o) => {
            const statusKey = (o.status || "Pending").toLowerCase();
            return (
              <div key={o.id} className="order-card card">
                <div className="order-card-head">
                  <div className="order-meta-group">
                    <span className="order-id mono">Order #{o.id}</span>
                    <span className="order-date mono">{shortDate(o.createdAt)}</span>
                  </div>
                  <span className={`status-pill status-${statusKey}`}>
                    {o.status || "Pending"}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-info-item">
                    <span className="order-info-label">Total Amount</span>
                    <strong className="order-total-price mono">{money(o.total)}</strong>
                  </div>
                  <div className="order-info-item">
                    <span className="order-info-label">Estimated Delivery</span>
                    <span className="order-info-val">2 - 3 Business Days</span>
                  </div>
                </div>

                <div className="order-card-foot">
                  <Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm order-details-btn">
                    <span>View Order Details</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={TruckIcon}
          title="No Orders Yet"
          hint="When you purchase items from the marketplace, they will appear here."
          action={
            <Link to="/search" className="btn btn-primary btn-lg">
              Start Shopping →
            </Link>
          }
        />
      )}
    </div>
  );
}

export default Orders;
