/**
 * productsStore.js
 * LocalStorage-backed products store for Part B3.
 * - Seeds initial products from src/data/mockProducts.js if none exist
 * - CRUD operations
 * - Enforces unique barcode
 *
 * Connected to:
 * - src/admin/pages/AdminProducts.jsx (admin CRUD UI)
 * - src/pages/POS.jsx (POS reads active products)
 */
import { MOCK_PRODUCTS } from "../data/mockProducts";

const KEY_PRODUCTS = "products_mock";

export function ensureProductsSeed() {
  const raw = localStorage.getItem(KEY_PRODUCTS);
  if (raw) return;

  // Seed from Part A mock products, but normalize fields
  const seed = MOCK_PRODUCTS.map((p) => ({
    id: String(p.id),
    name: p.name,
    barcode: p.barcode,
    price: Number(p.price),
    category: p.category || "General",
    taxRate: Number(p.taxRate || 0),
    idCheckRequired: Boolean(p.idCheckRequired),
    status: p.status || "active", // active|inactive
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  localStorage.setItem(KEY_PRODUCTS, JSON.stringify(seed));
}

export function getAllProducts() {
  ensureProductsSeed();
  const raw = localStorage.getItem(KEY_PRODUCTS);
  return raw ? JSON.parse(raw) : [];
}

export function getActiveProducts() {
  return getAllProducts().filter((p) => p.status === "active");
}

function saveProducts(list) {
  localStorage.setItem(KEY_PRODUCTS, JSON.stringify(list));
}

export function createProduct(input) {
  const products = getAllProducts();

  const barcode = String(input.barcode || "").trim();
  if (!barcode) throw new Error("Barcode is required.");

  const exists = products.some(
    (p) => p.barcode.toLowerCase() === barcode.toLowerCase()
  );
  if (exists) throw new Error("Barcode must be unique.");

  const now = new Date().toISOString();
  const newProduct = {
    id: crypto.randomUUID(),
    name: String(input.name || "").trim(),
    barcode,
    price: Number(input.price || 0),
    category: String(input.category || "General").trim(),
    taxRate: Number(input.taxRate || 0),
    idCheckRequired: Boolean(input.idCheckRequired),
    status: input.status === "inactive" ? "inactive" : "active",
    createdAt: now,
    updatedAt: now,
  };

  if (!newProduct.name) throw new Error("Name is required.");
  if (Number.isNaN(newProduct.price) || newProduct.price < 0)
    throw new Error("Price must be a valid number.");

  saveProducts([newProduct, ...products]);
  return newProduct;
}

export function updateProduct(productId, updates) {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error("Product not found.");

  const current = products[idx];
  const next = { ...current, ...updates };

  // Barcode uniqueness check (if changing)
  if (updates.barcode != null) {
    const barcode = String(updates.barcode).trim();
    if (!barcode) throw new Error("Barcode is required.");
    const exists = products.some(
      (p) =>
        p.id !== productId &&
        p.barcode.toLowerCase() === barcode.toLowerCase()
    );
    if (exists) throw new Error("Barcode must be unique.");
    next.barcode = barcode;
  }

  if (!String(next.name || "").trim()) throw new Error("Name is required.");
  next.price = Number(next.price || 0);
  if (Number.isNaN(next.price) || next.price < 0)
    throw new Error("Price must be a valid number.");

  next.taxRate = Number(next.taxRate || 0);
  if (Number.isNaN(next.taxRate) || next.taxRate < 0)
    throw new Error("Tax rate must be a valid number.");

  next.updatedAt = new Date().toISOString();

  const newList = [...products];
  newList[idx] = next;
  saveProducts(newList);
  return next;
}

export function setProductStatus(productId, status) {
  return updateProduct(productId, {
    status: status === "inactive" ? "inactive" : "active",
  });
}
