/**
 * AdminApp.jsx
 * Admin panel shell + tiny router for /admin pages (no external libs).
 * B1 adds:
 * - admin session from localStorage
 * - route guard (/admin/* requires session except /admin/login)
 * - logout clears session
 *
 * Connected to:
 * - src/App.jsx (mounts AdminApp under /admin)
 * - src/services/adminStorage.js (get/clear session)
 */
import React, { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { clearAdminSession, getAdminSession } from "../services/adminStorage";

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
  const [adminSession, setAdminSessionState] = useState(getAdminSession());

  useEffect(() => {
    const onPop = () => setPath(getAdminPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ===== B1 Guard =====
  useEffect(() => {
    const s = getAdminSession();
    setAdminSessionState(s);

    // if not logged in => force /admin/login
    if (!s && path !== "/admin/login") {
      go("/admin/login");
      return;
    }

    // if logged in and hits login => redirect to dashboard
    if (s && path === "/admin/login") {
      go("/admin/dashboard");
      return;
    }
  }, [path]);

  function logout() {
    clearAdminSession();
    setAdminSessionState(null);
    go("/admin/login");
  }

  if (path === "/admin/login") {
    return <AdminLogin onSuccess={() => go("/admin/dashboard")} />;
  }

  return (
    <AdminShell session={adminSession} onLogout={logout}>
      <AdminDashboard />
    </AdminShell>
  );
}

function AdminShell({ children, onLogout, session }) {
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

        <div className="muted small">
          Logged in as: <b>{session?.username || "admin"}</b>
        </div>

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
