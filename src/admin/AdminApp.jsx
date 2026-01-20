/**
 * AdminApp.jsx
 * Admin panel shell + tiny router for /admin pages (no external libs).
 * Guarded by admin session (Part B1).
 * Routes:
 * - /admin/login
 * - /admin/dashboard
 * - /admin/products
 *
 * Connected to:
 * - src/App.jsx (mounts AdminApp under /admin)
 * - src/services/adminStorage.js (get/clear session)
 */
import React, { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
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

  // ===== Guard =====
  useEffect(() => {
    const s = getAdminSession();
    setAdminSessionState(s);

    if (!s && path !== "/admin/login") {
      go("/admin/login");
      return;
    }

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

  let page = <AdminDashboard />;
  let active = "dashboard";

  if (path === "/admin/products") {
    page = <AdminProducts />;
    active = "products";
  } else if (path === "/admin/dashboard") {
    page = <AdminDashboard />;
    active = "dashboard";
  }

  return (
    <AdminShell session={adminSession} onLogout={logout} active={active}>
      {page}
    </AdminShell>
  );
}

function AdminShell({ children, onLogout, session, active }) {
  function nav(to) {
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
          onClick={() => nav("/admin/dashboard")}
          type="button"
        >
          Dashboard
        </button>

        <button
          className={`admin-nav ${active === "products" ? "admin-nav-active" : ""}`}
          onClick={() => nav("/admin/products")}
          type="button"
        >
          Products
        </button>

        {/* Coming in later micro-steps */}
        <button className="admin-nav" disabled type="button" title="Coming next">
          Inventory (next)
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
