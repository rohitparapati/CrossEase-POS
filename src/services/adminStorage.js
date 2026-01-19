/**
 * adminStorage.js
 * LocalStorage utilities for Admin Panel (Part B).
 * - Seeds default admin account (admin/admin)
 * - Stores admin session
 *
 * Connected to:
 * - src/admin/pages/AdminLogin.jsx (auth + set session)
 * - src/admin/AdminApp.jsx (guard + logout)
 */

const KEY_ADMIN_USERS = "admin_users_mock";
const KEY_ADMIN_SESSION = "admin_session";

export function ensureAdminSeed() {
  const raw = localStorage.getItem(KEY_ADMIN_USERS);
  if (raw) return;

  // Part B mock users (Part C will move to SQL + hashed passwords + JWT)
  const seed = [
    {
      id: "a-001",
      username: "admin",
      password: "admin", // mock only (do NOT do this in Part C)
      role: "admin",
      createdAt: new Date().toISOString(),
      active: true,
    },
  ];

  localStorage.setItem(KEY_ADMIN_USERS, JSON.stringify(seed));
}

export function getAdminUsers() {
  ensureAdminSeed();
  const raw = localStorage.getItem(KEY_ADMIN_USERS);
  return raw ? JSON.parse(raw) : [];
}

export function authenticateAdmin(username, password) {
  ensureAdminSeed();
  const users = getAdminUsers();
  const u = users.find(
    (x) =>
      x.active &&
      x.username.toLowerCase() === String(username).trim().toLowerCase() &&
      x.password === String(password)
  );

  if (!u) return null;

  return {
    adminId: u.id,
    username: u.username,
    role: u.role,
    loginAt: new Date().toISOString(),
  };
}

export function setAdminSession(session) {
  localStorage.setItem(KEY_ADMIN_SESSION, JSON.stringify(session));
}

export function getAdminSession() {
  const raw = localStorage.getItem(KEY_ADMIN_SESSION);
  return raw ? JSON.parse(raw) : null;
}

export function clearAdminSession() {
  localStorage.removeItem(KEY_ADMIN_SESSION);
}
