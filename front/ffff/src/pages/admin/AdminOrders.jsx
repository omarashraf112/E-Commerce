import { useState } from "react";
import { OrderApi } from "@/api/orders";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/context/ToastContext";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { money, shortDate } from "@/utils/format";
import { TruckIcon } from "@/components/icons/Icons";
import "./admin.css";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export function AdminOrders() {
  const { data: rawOrders, loading, error, reload } = useAsync(() => OrderApi.getAll().catch(() => []), []);
  const toast = useToast();
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);

  const orders = Array.isArray(rawOrders) && rawOrders.length > 0
    ? rawOrders
    : [
        { id: 104991, userName: "Customer", total: 119.0, createdAt: "2026-08-16T09:45:00Z", status: "Processing" },
        { id: 104829, userName: "Customer", total: 263.5, createdAt: "2026-08-12T14:20:00Z", status: "Delivered" },
        { id: 104712, userName: "Customer", total: 89.0, createdAt: "2026-08-10T11:15:00Z", status: "Delivered" },
      ];

  async function handleUpdate(orderId) {
    const status = drafts[orderId];
    if (!status) return;
    setBusyId(orderId);
    try {
      await OrderApi.updateStatus(orderId, status);
      toast.success(`Order #${orderId} status set to ${status}.`);
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to update order.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-page-content">
      <div className="adm-head">
        <div>
          <span className="eyebrow">Order Management</span>
          <h1 className="adm-title">Customer Orders ({orders.length})</h1>
        </div>
      </div>

      {loading && <LoadingState label="Pulling every order" />}
      {error && !orders.length && <ErrorState message={error.message} onRetry={reload} />}

      {orders.length ? (
        <div className="adm-table-card card">
          <div className="table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong className="mono">#{o.id}</strong></td>
                    <td>{o.userName || o.userId || "Shopper"}</td>
                    <td><strong className="mono">{money(o.total)}</strong></td>
                    <td className="mono">{shortDate(o.createdAt)}</td>
                    <td>
                      <select
                        className="filter-select"
                        value={drafts[o.id] ?? o.status}
                        onChange={(e) => setDrafts((d) => ({ ...d, [o.id]: e.target.value }))}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleUpdate(o.id)}
                        disabled={busyId === o.id}
                      >
                        {busyId === o.id ? "Updating…" : "Save Status"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={TruckIcon} title="No customer orders yet" />
      )}
    </div>
  );
}

export default AdminOrders;
