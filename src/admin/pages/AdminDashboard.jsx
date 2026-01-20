/**
 * AdminDashboard.jsx
 * Admin dashboard metrics (Part B2) using localStorage sales from POS (Part A).
 * Shows:
 * - Today sales total
 * - Yesterday sales total
 * - Date range totals + transaction count
 *
 * Connected to: src/services/storage.js (getSales)
 */
import React, { useMemo, useState } from "react";
import { getSales } from "../../services/storage";

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function toDateInputValue(dateObj) {
  // yyyy-mm-dd for <input type="date">
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sumSales(sales) {
  return sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
}

export default function AdminDashboard() {
  const allSales = useMemo(() => getSales(), []);

  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }, []);

  const [fromDate, setFromDate] = useState(toDateInputValue(today));
  const [toDate, setToDate] = useState(toDateInputValue(today));

  // Today + yesterday
  const todaySales = useMemo(() => {
    const from = startOfDay(today).getTime();
    const to = endOfDay(today).getTime();
    return allSales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= from && t <= to;
    });
  }, [allSales, today]);

  const yesterdaySales = useMemo(() => {
    const from = startOfDay(yesterday).getTime();
    const to = endOfDay(yesterday).getTime();
    return allSales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= from && t <= to;
    });
  }, [allSales, yesterday]);

  // Range filter
  const rangeSales = useMemo(() => {
    // If user selects invalid range, return empty
    if (!fromDate || !toDate) return [];
    const from = startOfDay(new Date(fromDate)).getTime();
    const to = endOfDay(new Date(toDate)).getTime();
    if (from > to) return [];

    return allSales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= from && t <= to;
    });
  }, [allSales, fromDate, toDate]);

  const stats = useMemo(() => {
    return {
      todayTotal: sumSales(todaySales),
      yesterdayTotal: sumSales(yesterdaySales),
      rangeTotal: sumSales(rangeSales),
      rangeTransactions: rangeSales.length,
    };
  }, [todaySales, yesterdaySales, rangeSales]);

  return (
    <div className="admin-dashboard">
      {/* ===== Dashboard Header ===== */}
      <div className="card">
        <div className="card-header">
          <h2 className="h2">Dashboard</h2>
          <p className="muted">
            Metrics are computed from localStorage sales (Part A). Part C will read from SQL.
          </p>
        </div>

        {/* ===== Summary Cards ===== */}
        <div className="dash-cards">
          <div className="dash-card">
            <div className="muted small">Today Total</div>
            <div className="dash-value">{money(stats.todayTotal)}</div>
            <div className="muted small">{todaySales.length} transactions</div>
          </div>

          <div className="dash-card">
            <div className="muted small">Yesterday Total</div>
            <div className="dash-value">{money(stats.yesterdayTotal)}</div>
            <div className="muted small">{yesterdaySales.length} transactions</div>
          </div>

          <div className="dash-card">
            <div className="muted small">Selected Range Total</div>
            <div className="dash-value">{money(stats.rangeTotal)}</div>
            <div className="muted small">{stats.rangeTransactions} transactions</div>
          </div>
        </div>
      </div>

      {/* ===== Date Range Filter ===== */}
      <div className="card">
        <div className="card-header">
          <h3 className="h2">Date Range</h3>
          <p className="muted">Filter transactions by date (inclusive)</p>
        </div>

        <div className="row gap wrap">
          <label className="label" style={{ minWidth: 220 }}>
            From
            <input
              className="input"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>

          <label className="label" style={{ minWidth: 220 }}>
            To
            <input
              className="input"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>

          <button
            className="btn"
            type="button"
            onClick={() => {
              setFromDate(toDateInputValue(today));
              setToDate(toDateInputValue(today));
            }}
          >
            Reset to Today
          </button>
        </div>

        {/* ===== Range Transactions Table ===== */}
        <div className="divider" />

        {fromDate && toDate && new Date(fromDate) > new Date(toDate) ? (
          <div className="alert alert-error">Invalid range: From date is after To date.</div>
        ) : rangeSales.length === 0 ? (
          <div className="muted">No sales in selected range.</div>
        ) : (
          <div className="table">
            <div className="table-head">
              <div>Date/Time</div>
              <div>Receipt</div>
              <div>Cashier</div>
              <div className="right">Total</div>
            </div>

            {rangeSales.slice(0, 25).map((s) => (
              <div key={s.saleId} className="table-row">
                <div>{new Date(s.createdAt).toLocaleString()}</div>
                <div>{s.receiptNo}</div>
                <div>{s.cashierId}</div>
                <div className="right">{money(s.total)}</div>
              </div>
            ))}

            {rangeSales.length > 25 ? (
              <div className="muted small" style={{ marginTop: 8 }}>
                Showing first 25 transactions. (We’ll add pagination later.)
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
