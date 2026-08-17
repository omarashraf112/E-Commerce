import { useState } from "react";
import { CategoryApi } from "@/api/categories";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/context/ToastContext";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { PlusIcon, TrashIcon, SparklesIcon } from "@/components/icons/Icons";
import "./admin.css";

export function AdminCategories() {
  const { data: rawCategories, loading, error, reload } = useAsync(() => CategoryApi.getAll(), []);
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = rawCategories || [];

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await CategoryApi.create({ name, description: description || undefined });
      setName("");
      setDescription("");
      setShowAddForm(false);
      toast.success("Category added successfully.");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to create category.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    try {
      await CategoryApi.remove(id);
      toast.success("Category deleted.");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to remove category.");
    }
  }

  return (
    <div className="admin-page-content">
      <div className="adm-head">
        <div>
          <span className="eyebrow">Category Architecture</span>
          <h1 className="adm-title">Stalls & Categories ({categories.length})</h1>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddForm((p) => !p)}
        >
          <PlusIcon size={16} />
          <span>{showAddForm ? "Close Form" : "New Category"}</span>
        </button>
      </div>

      {showAddForm && (
        <form className="adm-form card page-enter" onSubmit={handleCreate}>
          <h2>Create New Category</h2>
          <div className="field">
            <label htmlFor="cat-name">Category Title *</label>
            <input id="cat-name" placeholder="e.g. Wellness & Scent" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="cat-desc">Description (Optional)</label>
            <textarea id="cat-desc" rows={2} placeholder="Brief category introduction" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button className="btn btn-accent btn-block" disabled={busy}>
            {busy ? "Creating…" : "Save Category"}
          </button>
        </form>
      )}

      {loading && <LoadingState label="Loading categories" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {!loading && !error && (
        categories.length ? (
          <div className="adm-table-card card">
            <div className="table-responsive">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.description || "—"}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                          <TrashIcon size={14} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState icon={SparklesIcon} title="No categories found" />
        )
      )}
    </div>
  );
}

export default AdminCategories;
