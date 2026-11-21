// AgroDirect Frontend Controller (Fetch API, DOM Manipulation, CRUD Handlers)
let products = [];
let cart = [];

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    const json = await res.json();
    products = json.data;
    renderCatalog(products);
    renderCrudTable(products);
    fetchStats();
  } catch (err) {
    console.error("Failed to load products from API:", err);
  }
}

async function fetchStats() {
  try {
    const res = await fetch("/api/stats");
    const stats = await res.json();
    document.getElementById("statProducts").textContent = stats.totalProducts;
    document.getElementById("statOrders").textContent = stats.totalOrders;
    document.getElementById("statCategories").textContent = stats.categories;
  } catch (err) {}
}

function renderCatalog(items) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  if (items.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center py-5 text-muted">No organic produce found matching your query.</div>';
    return;
  }
  items.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm rounded-4 product-card overflow-hidden">
        <div class="card-body p-4 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-success-subtle text-success px-2 py-1 rounded">${p.category}</span>
              <span class="text-warning fw-bold small">★ ${p.rating}</span>
            </div>
            <h5 class="fw-bold text-dark mb-1">${p.name}</h5>
            <p class="text-muted small mb-3">Farmer: <strong>${p.farmer}</strong> | Stock: ${p.stock} units</p>
          </div>
          <div class="d-flex justify-content-between align-items-center pt-3 border-top">
            <span class="fs-5 fw-bold text-success">₹${p.price}</span>
            <button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" onclick="addToCart(${p.id})">
              + Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function renderCrudTable(items) {
  const tbody = document.getElementById("crudTableBody");
  tbody.innerHTML = "";
  items.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${p.id}</td>
      <td class="fw-bold">${p.name}</td>
      <td><span class="badge bg-light text-dark border">${p.category}</span></td>
      <td>₹${p.price}</td>
      <td>${p.stock}</td>
      <td>${p.farmer}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterProducts() {
  const cat = document.getElementById("categoryFilter").value;
  const query = document.getElementById("searchInput").value.toLowerCase();
  let filtered = products;
  if (cat !== "All") {
    filtered = filtered.filter(p => p.category.toLowerCase() === cat.toLowerCase());
  }
  if (query) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.farmer.toLowerCase().includes(query));
  }
  renderCatalog(filtered);
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const name = document.getElementById("newProdName").value;
  const category = document.getElementById("newProdCat").value;
  const price = document.getElementById("newProdPrice").value;
  const stock = document.getElementById("newProdStock").value;
  const farmer = document.getElementById("newProdFarmer").value;

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, price, stock, farmer })
    });
    const data = await res.json();
    if (data.success) {
      alert("Product added to database via POST /api/products!");
      const modal = bootstrap.Modal.getInstance(document.getElementById("addProductModal"));
      if (modal) modal.hide();
      document.getElementById("addProductForm").reset();
      fetchProducts();
    }
  } catch (err) {
    alert("Error adding product.");
  }
}

async function deleteProduct(id) {
  if (!confirm(`Are you sure you want to delete Product #${id}?`)) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      alert(`Product #${id} deleted via DELETE /api/products/${id}!`);
      fetchProducts();
    }
  } catch (err) {
    alert("Error deleting product.");
  }
}

function addToCart(id) {
  const item = products.find(p => p.id === id);
  if (item) {
    cart.push(item);
    document.getElementById("cartBadge").textContent = cart.length;
    alert(`Added "${item.name}" to cart!`);
  }
}

function openCartModal() {
  if (cart.length === 0) {
    alert("Your cart is empty. Add organic produce from the catalog!");
    return;
  }
  const total = cart.reduce((acc, curr) => acc + curr.price, 0);
  alert(`AgroDirect Cart (${cart.length} items):\n\nTotal Payable: ₹${total}\n\nProceeding to checkout with student discount applied!`);
}

document.addEventListener("DOMContentLoaded", fetchProducts);
