/**
 * Login.jsx
 * Employee login screen (mock).
 * For Part A, we accept any non-empty ID + password and store a session in localStorage.
 *
 * Connected to: src/services/storage.js (setSession)
 */
import React, { useMemo, useState } from "react";
import { setSession } from "../services/storage";

export default function Login({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const quickUsers = useMemo(
    () => [
      { id: "1001", name: "Cashier One", role: "cashier" },
      { id: "2001", name: "Manager One", role: "manager" },
    ],
    []
  );

  function loginAs(user) {
    setSession({
      employeeId: user.id,
      name: user.name,
      role: user.role,
      loginAt: new Date().toISOString(),
    });
    onLoginSuccess();
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!employeeId.trim() || !password.trim()) {
      setError("Enter Employee ID and Password.");
      return;
    }

    // Part A mock session
    setSession({
      employeeId: employeeId.trim(),
      name: "Employee",
      role: "cashier",
      loginAt: new Date().toISOString(),
    });

    onLoginSuccess();
  }

  return (
    <div className="page page-center">
      <div className="card auth-card">
        <div className="card-header">
          <h1 className="title">POS Login</h1>
          <p className="muted">Sign in to start selling</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            Employee ID
            <input
              className="input"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g., 1001"
              autoFocus
            />
          </label>

          <label className="label">
            Password
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
            />
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit">
            Sign In
          </button>

          <div className="divider" />

          <div className="quick-row">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => loginAs(quickUsers[0])}
            >
              Quick: Cashier (1001)
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => loginAs(quickUsers[1])}
            >
              Quick: Manager (2001)
            </button>
          </div>

          <p className="hint">
            Part A is mock login. Part C will use SQL + hashed passwords + JWT.
          </p>
        </form>
      </div>
    </div>
  );
}
