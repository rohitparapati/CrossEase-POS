/**
 * AdminDashboard.jsx
 * Placeholder dashboard page for B0.
 * B2 will add real metrics using localStorage sales.
 */
import React from "react";

export default function AdminDashboard() {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="h2">Dashboard</h2>
        <p className="muted">Next: today/yesterday totals + date range + transactions</p>
      </div>

      <div className="muted">
        B0 is only layout + routing. Metrics come in B2.
      </div>
    </div>
  );
}
