import { useState } from "react";
import { ProductApi } from "@/api/products";
import { CategoryApi } from "@/api/categories";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/context/ToastContext";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { money } from "@/utils/format";
import { PlusIcon, TrashIcon, CartIcon } from "@/components/icons/Icons";
import "./admin.css";

const empty = { name: "", description: "", price: "", stock: "", categoryId: "", image: null };

export function AdminProducts() {
  const { data: rawProducts, loading, error, reload } = useAsync(() => ProductApi.getAll({ pageSize: 100 }), []);
  const { data: categories } = useAsync(() => CategoryApi.getAll(), []);
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const products = rawProducts || [];

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await ProductApi.create({
        Name: form.name,
        Description: form.description,
        Price: form.price,
        Stock: form.stock,
        CategoryId: form.categoryId,
        ImageUrl: form.image,
      });
      setForm(empty);
      setShowAddForm(false);
      toast.success("Product created successfully.");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to create product.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    try {
      await ProductApi.remove(id);
      toast.success("Product removed from inventory.");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to delete product.");
    }
  }

  return (
    <div className="admin-page-content">
      <div className="adm-head">
        <div>
          <span className="eyebrow">Inventory Control</span>
          <h1 className="adm-title">Products ({products.length})</h1>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddForm((p) => !p)}
        >
          <PlusIcon size={16} />
          <span>{showAddForm ? "Close Form" : "Add New Product"}</span>
        </button>
      </div>

      {showAddForm && (
        <form className="adm-form card page-enter" onSubmit={handleCreate}>
          <h2>Create New Catalog Item</h2>
          <div className="field">
            <label htmlFor="p-name">Product Name *</label>
            <input id="p-name" placeholder="e.g. Wireless ANC Headphones" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="p-desc">Description</label>
            <textarea id="p-desc" rows={2} placeholder="Item specifications & highlights" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="p-price">Price ($) *</label>
              <input id="p-price" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="p-stock">Stock Units *</label>
              <input id="p-stock" type="number" min="0" placeholder="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="p-cat">Category *</label>
            <select id="p-cat" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
              <option value="">Select a category</option>
              {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-image">Product Image File</label>
            <input id="p-image" type="file" accept="image/*" onChange={(e) => set("image", e.target.files?.[0] || null)} />
          </div>
          <button className="btn btn-accent btn-block" disabled={busy}>
            {busy ? "Adding to catalog…" : "Publish Product"}
          </button>
        </form>
      )}

      {loading && <LoadingState label="Loading products list" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {!loading && !error && (
        products.length ? (
          <div className="adm-table-card card">
            <div className="table-responsive">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="badge badge-neutral">{p.categoryName || "Stall"}</span></td>
                      <td><strong className="mono">{money(p.price)}</strong></td>
                      <td className="mono">{p.stock}</td>
                      <td>
                        <span className={`status-pill ${p.stock > 0 ? "status-delivered" : "status-cancelled"}`}>
                          {p.stock > 0 ? "Active" : "Out of stock"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
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
          <EmptyState icon={CartIcon} title="No products in catalog yet" />
        )
      )}
    </div>
  );
}

export default AdminProducts;
