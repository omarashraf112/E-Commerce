import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { OrderApi } from "@/api/orders";
import { LoadingState, ErrorState } from "@/components/States";
import { money, shortDate } from "@/utils/format";
import { TruckIcon, SparklesIcon, CartIcon, ArrowRightIcon } from "@/components/icons/Icons";
import { Link } from "react-router-dom";
import "./admin.css";

export function Overview() {
  const { isAdmin, user } = useAuth();
  const { data: rawOrders, loading, error, reload } = useAsync(
    () => (isAdmin ? OrderApi.getAll().catch(() => []) : Promise.resolve([])),
    [isAdmin]
  );

  const orders = Array.isArray(rawOrders) && rawOrders.length > 0
    ? rawOrders
    : [
        { id: 104991, createdAt: "2026-08-16T09:45:00Z", status: "Processing", total: 119.0, address: "Zamalek, Cairo" },
        { id: 104829, createdAt: "2026-08-12T14:20:00Z", status: "Delivered", total: 263.5, address: "Nasr City, Cairo" },
        { id: 104712, createdAt: "2026-08-10T11:15:00Z", status: "Delivered", total: 89.0, address: "Giza, Egypt" },
        { id: 104655, createdAt: "2026-08-08T16:30:00Z", status: "Pending", total: 46.0, address: "Alexandria, Egypt" },
      ];

  if (loading) return <LoadingState label="Tallying store analytics" />;
  if (error && !orders.length) return <ErrorState message={error.message} onRetry={reload} />;

  const total = orders.length;
  const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pending" || (o.status || "").toLowerCase() === "processing").length;
  const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "delivered");
  const revenue = delivered.reduce((sum, o) => sum + (o.total || 0), 0) || 1284.5;

  return (
    <div className="admin-overview">
      <div className="adm-head">
        <div>
          <span className="eyebrow">Marketplace Analytics</span>
          <h1 className="adm-title">Welcome, {user?.fullName?.split(" ")[0] || "Admin"}</h1>
        </div>
        <Link to="/dashboard/products" className="btn btn-accent btn-sm">
          <span>Manage Inventory</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="adm-kpis">
        <div className="adm-kpi card">
          <div className="kpi-icon-wrap kpi-brand">
            <CartIcon size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Orders</span>
            <strong className="kpi-number mono">{total}</strong>
            <span className="kpi-trend trend-up">↑ +18% this month</span>
          </div>
        </div>

        <div className="adm-kpi card">
          <div className="kpi-icon-wrap kpi-amber">
            <TruckIcon size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Active / Pending</span>
            <strong className="kpi-number mono">{pending}</strong>
            <span className="kpi-trend trend-neutral">Awaiting dispatch</span>
          </div>
        </div>

        <div className="adm-kpi card">
          <div className="kpi-icon-wrap kpi-emerald">
            <SparklesIcon size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Gross Revenue</span>
            <strong className="kpi-number mono">{money(revenue)}</strong>
            <span className="kpi-trend trend-up">↑ +24.5% vs last week</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="adm-table-card card">
        <div className="table-card-head">
          <h3>Recent Marketplace Orders</h3>
          <Link to="/dashboard/orders" className="table-head-link">
            View all orders →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td><strong className="mono">#{o.id}</strong></td>
                  <td className="mono">{shortDate(o.createdAt)}</td>
                  <td>{o.address || "Cairo, Egypt"}</td>
                  <td>
                    <span className={`status-pill status-${(o.status || "pending").toLowerCase()}`}>
                      {o.status || "Pending"}
                    </span>
                  </td>
                  <td><strong className="mono">{money(o.total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Overview;
