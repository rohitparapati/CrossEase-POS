/**
 * App.jsx
 * Simple router (no external libs) for POS + Admin.
 * Routes:
 * - /login         : employee login
 * - /pos           : POS screen (requires session)
 * - /admin/login   : admin login
 * - /admin/*       : admin pages (Part B)
 */
import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import POS from "./pages/POS";
import AdminApp from "./admin/AdminApp";
import { getSession } from "./services/storage";

function getPath() {
  return window.location.pathname || "/login";
}

export default function App() {
  const [path, setPath] = useState(getPath());
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function navigate(to) {
    window.history.pushState({}, "", to);
    setPath(to);
    setSession(getSession());
  }

  // Admin area is handled separately
  if (path.startsWith("/admin")) {
    return <AdminApp />;
  }

  // Guard: if not logged in, always go to /login
  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s && path !== "/login") navigate("/login");
    if (s && path === "/login") navigate("/pos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (path === "/login") {
    return <Login onLoginSuccess={() => navigate("/pos")} />;
  }

  return <POS onLogout={() => navigate("/login")} session={session} />;
}
