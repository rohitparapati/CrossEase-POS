/**
 * mockProducts.js
 * Mock product catalog used in Part A (no backend yet).
 * Includes:
 * - barcode (unique)
 * - taxRate (as decimal)
 * - idCheckRequired for restricted items
 */
export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Coca-Cola 20oz",
    barcode: "049000028911",
    price: 2.49,
    category: "Beverages",
    taxRate: 0.0875,
    idCheckRequired: false,
    status: "active",
  },
  {
    id: 2,
    name: "Lay's Classic Chips",
    barcode: "028400064057",
    price: 2.99,
    category: "Snacks",
    taxRate: 0.0875,
    idCheckRequired: false,
    status: "active",
  },
  {
    id: 3,
    name: "Red Bull 8.4oz",
    barcode: "611269991000",
    price: 3.29,
    category: "Energy",
    taxRate: 0.0875,
    idCheckRequired: false,
    status: "active",
  },
  {
    id: 4,
    name: "Cigarettes (Restricted)",
    barcode: "CIG-001",
    price: 10.99,
    category: "Tobacco",
    taxRate: 0.0875,
    idCheckRequired: true,
    status: "active",
  },
  {
    id: 5,
    name: "Milk 1 Gallon",
    barcode: "MILK-1GAL",
    price: 4.79,
    category: "Grocery",
    taxRate: 0.0,
    idCheckRequired: false,
    status: "active",
  },
];
