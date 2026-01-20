/**
 * POS.jsx
 * POS selling screen (Part A).
 * Features:
 * - Scan barcode (type + Enter)
 * - Search by name/barcode and add item
 * - Cart qty +/- , remove
 * - Subtotal, tax, total
 * - Payment type and Complete Sale
 * - Receipt modal (print-friendly)
 *
 * Connected to:
 * - src/data/mockProducts.js (product list)
 * - src/services/storage.js (session, addSale, receipt number)
 */
import React, { useMemo, useRef, useState } from "react";
import { ensureProductsSeed, getActiveProducts } from "../services/productsStore";
import { addSale, clearSession, nextReceiptNo } from "../services/storage";
import ReceiptModal from "../components/ReceiptModal";

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function calcCartTotals(cartLines) {
  let subtotal = 0;
  let taxTotal = 0;

  for (const line of cartLines) {
    subtotal += line.price * line.qty;
    taxTotal += line.price * line.qty * (line.taxRate || 0);
  }

  const total = subtotal + taxTotal;
  return { subtotal, taxTotal, total };
}

export default function POS({ onLogout, session }) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [needsIdCheck, setNeedsIdCheck] = useState(false);
  const [error, setError] = useState("");

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const scanRef = useRef(null);

  const activeProducts = useMemo(() => {
  ensureProductsSeed();
  return getActiveProducts();
}, []);


  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeProducts;
    return activeProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
    );
  }, [search, activeProducts]);

  const totals = useMemo(() => calcCartTotals(cart), [cart]);

  function focusScan() {
    scanRef.current?.focus();
  }

  function addToCart(product) {
    setError("");

    if (product.idCheckRequired) {
      setNeedsIdCheck(true);
    }

    setCart((prev) => {
      const existing = prev.find((x) => x.productId === product.id);
      if (existing) {
        return prev.map((x) =>
          x.productId === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [
        ...prev,
        {
          lineId: crypto.randomUUID(),
          productId: product.id,
          name: product.name,
          barcode: product.barcode,
          price: product.price,
          taxRate: product.taxRate || 0,
          qty: 1,
        },
      ];
    });
  }

  function removeLine(lineId) {
    setCart((prev) => prev.filter((x) => x.lineId !== lineId));
  }

  function changeQty(lineId, delta) {
    setCart((prev) =>
      prev
        .map((x) =>
          x.lineId === lineId ? { ...x, qty: Math.max(1, x.qty + delta) } : x
        )
        .filter((x) => x.qty > 0)
    );
  }

  function onScanSubmit(e) {
    e.preventDefault();
    setError("");

    const code = barcodeInput.trim();
    if (!code) return;

    const product = activeProducts.find((p) => p.barcode === code);
    if (!product) {
      setError(`No product found for barcode: ${code}`);
      return;
    }

    addToCart(product);
    setBarcodeInput("");
    focusScan();
  }

  function completeSale() {
    setError("");

    if (!cart.length) {
      setError("Cart is empty. Add items before completing sale.");
      return;
    }

    if (needsIdCheck) {
      // Part A: simple checkbox gate. Part D: enforce ID check by category + audit log.
      const ok = window.confirm(
        "ID Check Required for one or more items.\n\nConfirm you verified customer ID?"
      );
      if (!ok) {
        setError("Sale blocked: ID check not confirmed.");
        return;
      }
    }

    const receiptNo = nextReceiptNo();
    const createdAt = new Date().toISOString();

    const items = cart.map((x) => ({
      ...x,
      lineSubtotal: x.price * x.qty,
      lineTax: x.price * x.qty * (x.taxRate || 0),
      lineTotal: x.price * x.qty + x.price * x.qty * (x.taxRate || 0),
    }));

    const sale = {
      saleId: crypto.randomUUID(),
      receiptNo,
      createdAt,
      cashierId: session?.employeeId || "UNKNOWN",
      paymentType,
      items,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
    };

    addSale(sale);
    setLastSale(sale);
    setReceiptOpen(true);

    // Reset POS for next customer
    setCart([]);
    setSearch("");
    setNeedsIdCheck(false);
    setPaymentType("cash");
    setBarcodeInput("");
    focusScan();
  }

  function logout() {
    clearSession();
    onLogout();
  }

  return (
    <div className="page">
      {/* ===== Header ===== */}
      <header className="header">
        <div>
          <div className="title">POS</div>
          <div className="muted">
            Cashier: <b>{session?.employeeId}</b> ({session?.role})
          </div>
        </div>

        <div className="row gap">
          <button className="btn" onClick={focusScan}>
            Focus Scan
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="grid">
        {/* ===== Left: Product Search + Scan ===== */}
        <section className="card">
          <div className="card-header">
            <h2 className="h2">Scan / Search</h2>
            <p className="muted">Type barcode and press Enter • Or search and click</p>
          </div>

          <form onSubmit={onScanSubmit} className="row gap">
            <input
              ref={scanRef}
              className="input input-lg"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan barcode here…"
            />
            <button className="btn btn-primary btn-lg" type="submit">
              Add
            </button>
          </form>

          <div className="spacer" />

          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or barcode…"
          />

          {error ? <div className="alert alert-error">{error}</div> : null}

          <div className="product-list">
            {filteredProducts.slice(0, 20).map((p) => (
              <button
                key={p.id}
                className="product-row"
                onClick={() => addToCart(p)}
                type="button"
              >
                <div className="product-main">
                  <div className="product-name">{p.name}</div>
                  <div className="muted small">
                    {p.barcode} • {p.category}
                    {p.idCheckRequired ? " • ID CHECK" : ""}
                  </div>
                </div>
                <div className="product-price">{money(p.price)}</div>
              </button>
            ))}
            {filteredProducts.length === 0 ? (
              <div className="muted small">No products found.</div>
            ) : null}
          </div>
        </section>

        {/* ===== Right: POS Cart ===== */}
        <section className="card">
          <div className="card-header">
            <h2 className="h2">Cart</h2>
            <p className="muted">Adjust quantities and complete the sale</p>
          </div>

          <div className="cart">
            {cart.length === 0 ? (
              <div className="muted">Cart is empty.</div>
            ) : (
              cart.map((line) => (
                <div key={line.lineId} className="cart-line">
                  <div className="cart-line-main">
                    <div className="cart-item-name">{line.name}</div>
                    <div className="muted small">{line.barcode}</div>
                  </div>

                  <div className="cart-actions">
                    <button
                      className="btn btn-mini"
                      onClick={() => changeQty(line.lineId, -1)}
                      type="button"
                    >
                      −
                    </button>
                    <div className="qty">{line.qty}</div>
                    <button
                      className="btn btn-mini"
                      onClick={() => changeQty(line.lineId, +1)}
                      type="button"
                    >
                      +
                    </button>

                    <div className="line-total">{money(line.price * line.qty)}</div>

                    <button
                      className="btn btn-mini btn-ghost"
                      onClick={() => removeLine(line.lineId)}
                      type="button"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="divider" />

          <div className="totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <b>{money(totals.subtotal)}</b>
            </div>
            <div className="totals-row">
              <span>Tax</span>
              <b>{money(totals.taxTotal)}</b>
            </div>
            <div className="totals-row totals-grand">
              <span>Total</span>
              <b>{money(totals.total)}</b>
            </div>
          </div>

          <div className="divider" />

          <div className="row gap wrap">
            <div className="pill-group" role="group" aria-label="Payment Type">
              <button
                className={`pill ${paymentType === "cash" ? "pill-active" : ""}`}
                onClick={() => setPaymentType("cash")}
                type="button"
              >
                Cash
              </button>
              <button
                className={`pill ${paymentType === "card" ? "pill-active" : ""}`}
                onClick={() => setPaymentType("card")}
                type="button"
              >
                Card
              </button>
            </div>

            <button
              className="btn btn-primary btn-lg grow"
              onClick={completeSale}
              type="button"
            >
              Complete Sale
            </button>
          </div>

          <p className="hint">
            Part A saves sales in localStorage. Part C will POST to API and store in SQL.
          </p>
        </section>
      </div>

      <ReceiptModal
        open={receiptOpen}
        sale={lastSale}
        onClose={() => setReceiptOpen(false)}
      />
    </div>
  );
}
