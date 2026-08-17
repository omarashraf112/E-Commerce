import { useState } from "react";
import { AuthApi } from "@/api/auth";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/context/ToastContext";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { shortDate } from "@/utils/format";
import { UserIcon } from "@/components/icons/Icons";
import "./admin.css";

export function AdminSellerRequests() {
  const { data: rawRequests, loading, error, reload } = useAsync(() => AuthApi.getSellerRequests().catch(() => []), []);
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const requests = rawRequests || [];

  async function handle(id, action) {
    setBusyId(id);
    try {
      if (action === "approve") await AuthApi.approveSellerRequest(id);
      else await AuthApi.rejectSellerRequest(id);
      toast.success(`Merchant request ${action === "approve" ? "approved" : "rejected"}.`);
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to process request.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingState label="Reviewing pending applications" />;
  if (error && !requests.length) return <ErrorState message={error.message} onRetry={reload} />;

  return (
    <div className="admin-page-content">
      <div className="adm-head">
        <div>
          <span className="eyebrow">Merchant Applications</span>
          <h1 className="adm-title">Seller Requests ({requests.length})</h1>
        </div>
      </div>

      {requests.length ? (
        <div className="adm-table-card card">
          <div className="table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.userName || r.userId || "Merchant Applicant"}</strong></td>
                    <td className="mono">{shortDate(r.requestedAt)}</td>
                    <td className="adm-inline-actions">
                      <button className="btn btn-accent btn-sm" onClick={() => handle(r.id, "approve")} disabled={busyId === r.id}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handle(r.id, "reject")} disabled={busyId === r.id}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={UserIcon} title="No Pending Merchant Requests" hint="When users request seller access from their account page, their requests will appear here." />
      )}
    </div>
  );
}

export default AdminSellerRequests;
