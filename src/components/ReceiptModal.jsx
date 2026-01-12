/**
 * ReceiptModal.jsx
 * Print-friendly receipt modal.
 * - Shows receipt details
 * - Print button triggers window.print()
 *
 * Connected to: src/pages/POS.jsx (passes sale object)
 */
import React, { useEffect } from "react";

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

export default function ReceiptModal({ open, sale, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !sale) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header no-print">
          <h2 className="title">Receipt</h2>
          <div className="row gap">
            <button className="btn" onClick={() => window.print()}>
              Print
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="receipt">
          <div className="receipt-top">
            <div className="receipt-store">My Store</div>
            <div className="receipt-meta">
              <div>Receipt: {sale.receiptNo}</div>
              <div>Date: {new Date(sale.createdAt).toLocaleString()}</div>
              <div>Cashier: {sale.cashierId}</div>
              <div>Payment: {sale.paymentType.toUpperCase()}</div>
            </div>
          </div>

          <div className="receipt-line" />

          <div className="receipt-items">
            {sale.items.map((it) => (
              <div key={it.lineId} className="receipt-item">
                <div className="receipt-item-name">
                  {it.name} × {it.qty}
                </div>
                <div className="receipt-item-price">{money(it.lineTotal)}</div>
              </div>
            ))}
          </div>

          <div className="receipt-line" />

          <div className="receipt-totals">
            <div className="receipt-row">
              <span>Subtotal</span>
              <span>{money(sale.subtotal)}</span>
            </div>
            <div className="receipt-row">
              <span>Tax</span>
              <span>{money(sale.taxTotal)}</span>
            </div>
            <div className="receipt-row receipt-grand">
              <span>Total</span>
              <span>{money(sale.total)}</span>
            </div>
          </div>

          <div className="receipt-footer">
            <div className="muted">Thank you! Have a great day.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
