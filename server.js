// ============================================================================
// Practical 12: Capstone Full-Stack Responsive Web Application
// Student ID: 26DCS064 | Class: CSE-C | DEPSTAR - CHARUSAT
// Project: AgroDirect - Farmer-to-Consumer Organic Marketplace
// ============================================================================
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Security: Input Sanitization Helper
function sanitizeInput(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// In-Memory Database Simulation (CRUD Data Store)
let productsDB = [
  { id: 1, name: "Organic Alphonso Mangoes", category: "Fruits", price: 450, stock: 40, farmer: "Kisan Ramesh", rating: 4.9 },
  { id: 2, name: "Farm-Fresh Baby Spinach", category: "Vegetables", price: 60, stock: 25, farmer: "Patel Agro", rating: 4.7 },
  { id: 3, name: "Single-Origin Sharbati Wheat", category: "Grains", price: 95, stock: 100, farmer: "Gujarat Biofarms", rating: 4.8 },
  { id: 4, name: "Cold-Pressed Mustard Oil", category: "Oils", price: 210, stock: 30, farmer: "Kisan Ramesh", rating: 4.9 },
  { id: 5, name: "Natural Wildflower Honey", category: "Spices", price: 320, stock: 15, farmer: "Gir Forest Natural", rating: 5.0 }
];
let ordersDB = [];

// REST API: Get all products (with optional search & category filter)
app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let results = productsDB;
  if (category && category !== "All") {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const query = search.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(query) || p.farmer.toLowerCase().includes(query));
  }
  res.json({ success: true, count: results.length, data: results });
});

// REST API: Create new product (CRUD: Create)
app.post("/api/products", (req, res) => {
  const { name, category, price, stock, farmer } = req.body;
  // Server-side validation
  if (!name || !category || isNaN(price) || isNaN(stock) || price <= 0 || stock < 0) {
    return res.status(400).json({ success: false, message: "Invalid product parameters." });
  }
  const newProduct = {
    id: productsDB.length > 0 ? Math.max(...productsDB.map(p => p.id)) + 1 : 1,
    name: sanitizeInput(name),
    category: sanitizeInput(category),
    price: parseFloat(price),
    stock: parseInt(stock),
    farmer: sanitizeInput(farmer || "Verified Partner"),
    rating: 5.0
  };
  productsDB.push(newProduct);
  res.status(201).json({ success: true, message: "Product listed successfully!", product: newProduct });
});

// REST API: Update product (CRUD: Update)
app.put("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, price, stock } = req.body;
  const idx = productsDB.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Product record not found." });
  }
  if (name) productsDB[idx].name = sanitizeInput(name);
  if (category) productsDB[idx].category = sanitizeInput(category);
  if (price && !isNaN(price)) productsDB[idx].price = parseFloat(price);
  if (stock && !isNaN(stock)) productsDB[idx].stock = parseInt(stock);
  res.json({ success: true, message: "Product updated successfully!", product: productsDB[idx] });
});

// REST API: Delete product (CRUD: Delete)
app.delete("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const initialLen = productsDB.length;
  productsDB = productsDB.filter(p => p.id !== id);
  if (productsDB.length === initialLen) {
    return res.status(404).json({ success: false, message: "Product record not found." });
  }
  res.json({ success: true, message: `Product #${id} deleted successfully.` });
});

// REST API: Place Order
app.post("/api/orders", (req, res) => {
  const { customerName, email, items, totalAmount } = req.body;
  if (!customerName || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Order must contain customer name and items." });
  }
  const order = {
    orderId: "AGRO-" + Math.floor(100000 + Math.random() * 900000),
    customerName: sanitizeInput(customerName),
    email: sanitizeInput(email),
    items,
    totalAmount,
    status: "Confirmed",
    timestamp: new Date().toISOString()
  };
  ordersDB.push(order);
  res.status(201).json({ success: true, message: "Order placed successfully!", order });
});

// REST API: Dashboard Stats
app.get("/api/stats", (req, res) => {
  res.json({
    totalProducts: productsDB.length,
    totalOrders: ordersDB.length,
    categories: [...new Set(productsDB.map(p => p.category))].length,
    platformStatus: "Operational (DEPSTAR Cloud)"
  });
});

app.listen(PORT, () => {
  console.log(`AgroDirect full-stack system running on http://127.0.0.1:${PORT}`);
});
