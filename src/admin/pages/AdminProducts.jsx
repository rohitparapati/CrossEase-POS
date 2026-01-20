/**
 * AdminProducts.jsx
 * Products management UI (Part B3).
 * - List + search
 * - Add product form
 * - Edit product form (inline modal-like panel)
 * - Enable/Disable (soft delete)
 *
 * Connected to:
 * - src/services/productsStore.js (CRUD)
 */
import React, { useMemo, useState } from "react";
import {
  createProduct,
  ensureProductsSeed,
  getAllProducts,
  setProductStatus,
  updateProduct,
} from "../../services/productsStore";

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

export default function AdminProducts() {
  useMemo(() => ensureProductsSeed(), []);

  const [refresh, setRefresh] = useState(0);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all|active|inactive
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    price: "",
    category: "",
    taxRate: "0.0875",
    idCheckRequired: false,
    status: "active",
  });

  const [editing, setEditing] = useState(null); // product object

  const products = useMemo(() => {
    const all = getAllProducts();
    const query = q.trim().toLowerCase();

    return all.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.barcode.toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query)
      );
    });
  }, [q, statusFilter, refresh]);

  function doRefresh() {
    setRefresh((x) => x + 1);
  }

  function onCreate(e) {
    e.preventDefault();
    setError("");

    try {
      createProduct({
        ...form,
        price: Number(form.price),
        taxRate: Number(form.taxRate),
      });
      setForm({
        name: "",
        barcode: "",
        price: "",
        category: "",
        taxRate: "0.0875",
        idCheckRequired: false,
        status: "active",
      });
      doRefresh();
    } catch (err) {
      setError(err.message || "Failed to create product.");
    }
  }

  function toggleStatus(p) {
    setError("");
    try {
      setProductStatus(p.id, p.status === "active" ? "inactive" : "active");
      doRefresh();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  }

  function saveEdit() {
    setError("");
    try {
      updateProduct(editing.id, {
        name: editing.name,
        barcode: editing.barcode,
        price: Number(editing.price),
        category: editing.category,
        taxRate: Number(editing.taxRate),
        idCheckRequired: Boolean(editing.idCheckRequired),
        status: editing.status,
      });
      setEditing(null);
      doRefresh();
    } catch (err) {
      setError(err.message || "Failed to update product.");
    }
  }

  return (
    <div className="admin-products">
      {/* ===== Products Header ===== */}
      <div className="card">
        <div className="card-header">
          <h2 className="h2">Products</h2>
          <p className="muted">
            Add/edit/disable products. POS reads this same product list.
          </p>
        </div>

        <div className="row gap wrap">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, barcode, category…"
            style={{ minWidth: 320 }}
          />

          <div className="pill-group" role="group" aria-label="Status Filter">
            <button
              type="button"
              className={`pill ${statusFilter === "all" ? "pill-active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`pill ${statusFilter === "active" ? "pill-active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={`pill ${statusFilter === "inactive" ? "pill-active" : ""}`}
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
      </div>

      {/* ===== Add Product Form ===== */}
      <div className="card">
        <div className="card-header">
          <h3 className="h2">Add New Product</h3>
          <p className="muted">Barcode must be unique.</p>
        </div>

        <form className="products-form" onSubmit={onCreate}>
          <label className="label">
            Name
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g., Sprite 20oz"
            />
          </label>

          <label className="label">
            Barcode
            <input
              className="input"
              value={form.barcode}
              onChange={(e) =>
                setForm((s) => ({ ...s, barcode: e.target.value }))
              }
              placeholder="Scan/type barcode"
            />
          </label>

          <label className="label">
            Price
            <input
              className="input"
              value={form.price}
              onChange={(e) =>
                setForm((s) => ({ ...s, price: e.target.value }))
              }
              placeholder="e.g., 2.49"
            />
          </label>

          <label className="label">
            Category
            <input
              className="input"
              value={form.category}
              onChange={(e) =>
                setForm((s) => ({ ...s, category: e.target.value }))
              }
              placeholder="e.g., Beverages"
            />
          </label>

          <label className="label">
            Tax Rate (decimal)
            <input
              className="input"
              value={form.taxRate}
              onChange={(e) =>
                setForm((s) => ({ ...s, taxRate: e.target.value }))
              }
              placeholder="e.g., 0.0875"
            />
          </label>

          <label className="label">
            Status
            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="label checkbox">
            <input
              type="checkbox"
              checked={form.idCheckRequired}
              onChange={(e) =>
                setForm((s) => ({ ...s, idCheckRequired: e.target.checked }))
              }
            />
            ID Check Required
          </label>

          <button className="btn btn-primary" type="submit">
            Add Product
          </button>
        </form>
      </div>

      {/* ===== Products List ===== */}
      <div className="card">
        <div className="card-header">
          <h3 className="h2">Product List</h3>
          <p className="muted">{products.length} results</p>
        </div>

        {products.length === 0 ? (
          <div className="muted">No products found.</div>
        ) : (
          <div className="table">
            <div className="table-head products-head">
              <div>Name</div>
              <div>Barcode</div>
              <div>Category</div>
              <div className="right">Price</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {products.map((p) => (
              <div key={p.id} className="table-row products-row">
                <div>
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div className="muted small">
                    Tax: {p.taxRate} {p.idCheckRequired ? "• ID CHECK" : ""}
                  </div>
                </div>
                <div>{p.barcode}</div>
                <div>{p.category}</div>
                <div className="right">{money(p.price)}</div>
                <div>{p.status}</div>
                <div className="row gap wrap">
                  <button className="btn btn-mini" onClick={() => setEditing({ ...p })} type="button">
                    Edit
                  </button>
                  <button className="btn btn-mini btn-ghost" onClick={() => toggleStatus(p)} type="button">
                    {p.status === "active" ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Edit Panel ===== */}
      {editing ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header no-print">
              <h2 className="title">Edit Product</h2>
              <div className="row gap">
                <button className="btn btn-primary" onClick={saveEdit} type="button">
                  Save
                </button>
                <button className="btn btn-ghost" onClick={() => setEditing(null)} type="button">
                  Close
                </button>
              </div>
            </div>

            <div className="receipt">
              <div className="products-form products-form-edit">
                <label className="label">
                  Name
                  <input
                    className="input"
                    value={editing.name}
                    onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                  />
                </label>

                <label className="label">
                  Barcode
                  <input
                    className="input"
                    value={editing.barcode}
                    onChange={(e) => setEditing((s) => ({ ...s, barcode: e.target.value }))}
                  />
                </label>

                <label className="label">
                  Price
                  <input
                    className="input"
                    value={editing.price}
                    onChange={(e) => setEditing((s) => ({ ...s, price: e.target.value }))}
                  />
                </label>

                <label className="label">
                  Category
                  <input
                    className="input"
                    value={editing.category}
                    onChange={(e) => setEditing((s) => ({ ...s, category: e.target.value }))}
                  />
                </label>

                <label className="label">
                  Tax Rate (decimal)
                  <input
                    className="input"
                    value={editing.taxRate}
                    onChange={(e) => setEditing((s) => ({ ...s, taxRate: e.target.value }))}
                  />
                </label>

                <label className="label">
                  Status
                  <select
                    className="input"
                    value={editing.status}
                    onChange={(e) => setEditing((s) => ({ ...s, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <label className="label checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.idCheckRequired)}
                    onChange={(e) => setEditing((s) => ({ ...s, idCheckRequired: e.target.checked }))}
                  />
                  ID Check Required
                </label>

                <div className="muted small">
                  Tip: Barcode must stay unique. Disable instead of deleting (audit-friendly).
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
