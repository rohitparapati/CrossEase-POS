/**
 * AdminApp.jsx
 * Admin panel shell + tiny router for /admin pages (no external libs).
 * Pages:
 * - /admin/login
 * - /admin/dashboard
 *
 * Connected to:
 * - src/App.jsx (mounts AdminApp under /admin)
 */
import React, { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function getAdminPath() {
  const full = window.location.pathname || "/";
  if (!full.startsWith("/admin")) return "/admin/login";
  const rest = full.replace("/admin", "") || "/login";
  return `/admin${rest}`;
}

function go(to) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function AdminApp() {
  const [path, setPath] = useState(getAdminPath());

  useEffect(() => {
    const onPop = () => setPath(getAdminPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // For B0, no auth guard yet — B1 will add it
  const page =
    path === "/admin/login" ? (
      <AdminLogin onSuccess={() => go("/admin/dashboard")} />
    ) : (
      <AdminShell onLogout={() => go("/admin/login")}>
        <AdminDashboard />
      </AdminShell>
    );

  return page;
}

function AdminShell({ children, onLogout }) {
  const [active, setActive] = useState("dashboard");

  function nav(id, to) {
    setActive(id);
    go(to);
  }

  return (
    <div className="admin-root">
      {/* ===== Admin Sidebar ===== */}
      <aside className="admin-sidebar">
        <div className="admin-brand">Admin Panel</div>

        <button
          className={`admin-nav ${active === "dashboard" ? "admin-nav-active" : ""}`}
          onClick={() => nav("dashboard", "/admin/dashboard")}
          type="button"
        >
          Dashboard
        </button>

        {/* These pages will be added in later micro-steps */}
        <button className="admin-nav" disabled type="button" title="Coming next">
          Products (next)
        </button>
        <button className="admin-nav" disabled type="button" title="Coming later">
          Inventory
        </button>
        <button className="admin-nav" disabled type="button" title="Coming later">
          Deliveries
        </button>
        <button className="admin-nav" disabled type="button" title="Coming later">
          Employees
        </button>

        <div className="admin-spacer" />
        <button className="btn btn-ghost" onClick={onLogout} type="button">
          Logout
        </button>
      </aside>

      {/* ===== Admin Content ===== */}
      <main className="admin-content">
        <div className="admin-topbar">
          <div className="muted">Simple, clean admin tools</div>
          <div className="row gap">
            <a className="btn" href="/pos">
              Go to POS
            </a>
          </div>
        </div>

        <div className="admin-page">{children}</div>
      </main>
    </div>
  );
}
