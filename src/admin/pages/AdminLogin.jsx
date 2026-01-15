/**
 * AdminLogin.jsx
 * Admin login screen (mock for Part B).
 * B1 will add real session + guard logic.
 *
 * Connected to: src/admin/AdminApp.jsx (onSuccess redirect)
 */
import React, { useState } from "react";

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Enter username and password.");
      return;
    }

    // Part B0 mock: accept anything
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
            Part B uses mock auth. Part C will use SQL + hashed passwords + JWT.
          </p>
        </form>
      </div>
    </div>
  );
}
