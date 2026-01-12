/**
 * storage.js
 * LocalStorage utilities to simulate backend persistence in Part A.
 * - Session: current logged-in employee
 * - Sales: completed sales list
 *
 * Connected to:
 * - src/pages/Login.jsx (creates session)
 * - src/pages/POS.jsx (reads session, writes sales)
 */

const KEY_SESSION = "pos_session";
const KEY_SALES = "pos_sales";

export function setSession(session) {
  localStorage.setItem(KEY_SESSION, JSON.stringify(session));
}

export function getSession() {
  const raw = localStorage.getItem(KEY_SESSION);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(KEY_SESSION);
}

export function getSales() {
  const raw = localStorage.getItem(KEY_SALES);
  return raw ? JSON.parse(raw) : [];
}

export function addSale(sale) {
  const sales = getSales();
  sales.unshift(sale); // newest first
  localStorage.setItem(KEY_SALES, JSON.stringify(sales));
}

/**
 * Simple receipt number generator for Part A.
 * In Part C this becomes a SQL sequence/identity + formatted receipt no.
 */
export function nextReceiptNo() {
  const key = "pos_receipt_counter";
  const current = Number(localStorage.getItem(key) || "1000");
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return `R-${next}`;
}
