/**
 * AdminLogin.jsx
 * Admin login screen (mock for Part B).
 * B1 adds localStorage session + simple auth against seeded admin users.
 *
 * Connected to:
 * - src/services/adminStorage.js (authenticateAdmin, setAdminSession)
 * - src/admin/AdminApp.jsx (onSuccess redirect)
 */
import React, { useEffect, useState } from "react";
import { authenticateAdmin, ensureAdminSeed, setAdminSession } from "../../services/adminStorage";

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");

  useEffect(() => {
    ensureAdminSeed();
  }, []);

  function submit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Enter username and password.");
      return;
    }

    const session = authenticateAdmin(username, password);
    if (!session) {
      setError("Invalid admin credentials. Try admin/admin.");
      return;
    }

    setAdminSession(session);
    onSuccess();
  }

  return (
    <div className="page page-center">
      <div className="card auth-card">
        <div className="card-header">
          <h1 className="title">Admin Login</h1>
          <p className="muted">Manage products, inventory, employees, sales</p>
        </div>

        <form onSubmit={submit} className="form">
          <label className="label">
            Username
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </label>

          <label className="label">
            Password
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
              type="password"
            />
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit">
            Sign In
          </button>

          <p className="hint">
            Default (mock): <b>admin / admin</b>. Part C will use SQL + hashed passwords + JWT.
          </p>
        </form>
      </div>
    </div>
  );
}
