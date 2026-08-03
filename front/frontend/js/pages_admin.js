// ============================================================
// Admin panel — categories / products / order status
// ============================================================

async function PageAdmin() {
  const user = Store.getUser();
  const isAdmin = user?.isAdmin;
  const tabs = isAdmin
    ? [["categories", "Categories", "🗂"], ["products", "Products", "📦"], ["orders", "Orders", "🧾"], ["sellers", "Seller requests", "🧑‍💼"]]
    : [["products", "Products", "📦"]]; // Seller only manages products
  const defaultTab = tabs[0][0];

  $app.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <span class="admin-brand-mark">${isAdmin ? "Admin" : "Seller"}</span>
          <span class="admin-brand-sub">Console</span>
        </div>
        <nav class="admin-nav-list">
          ${tabs.map(([key, label, icon], i) => `
            <button class="admin-nav-item ${i === 0 ? "active" : ""}" data-tab="${key}">
              <span class="admin-nav-icon">${icon}</span> ${label}
            </button>`).join("")}
        </nav>
        <button class="admin-exit" id="admin-signout-btn">↩ Sign out</button>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <span class="admin-topbar-title" id="admin-panel-title"></span>
          <span class="admin-topbar-user">${escapeHtml(user?.fullName || user?.email || "")}</span>
        </header>
        <div class="admin-content" id="admin-tab-content"></div>
      </main>
    </div>
  `;

  $("#admin-signout-btn").addEventListener("click", () => {
    Store.clearAuth();
    toast("Signed out.");
    go("#/login");
  });

  $all(".admin-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      $all(".admin-nav-item").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderAdminTab(btn.dataset.tab);
    });
  });

  renderAdminTab(defaultTab);
}

function renderAdminTab(tab) {
  const titles = { categories: "Categories", products: "Products", orders: "Orders", sellers: "Seller requests" };
  const titleEl = $("#admin-panel-title");
  if (titleEl) titleEl.textContent = titles[tab] || "";

  if (tab === "categories") return adminCategoriesTab();
  if (tab === "products") return adminProductsTab();
  if (tab === "orders") return adminOrdersTab();
  if (tab === "sellers") return adminSellerRequestsTab();
}

// ---------- Categories ----------
async function adminCategoriesTab() {
  const wrap = $("#admin-tab-content");
  wrap.innerHTML = `
    <div class="grid-2">
      <div>
        <h3>All categories</h3>
        <div id="cat-list"><div class="spinner-row">Loading…</div></div>
      </div>
      <div>
        <h3>Add category</h3>
        <div id="cat-error"></div>
        <div class="form-group"><label>Name</label><input id="new-cat-name"></div>
        <div class="form-group"><label>Description</label><textarea id="new-cat-desc" rows="2"></textarea></div>
        <button class="btn" id="add-cat-btn">Add category</button>
      </div>
    </div>
  `;

  async function loadCats() {
    const listEl = $("#cat-list");
    try {
      const cats = await Api.getCategories();
      listEl.innerHTML = (cats || []).length ? `
        <table class="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Description</th><th></th></tr></thead>
          <tbody>
            ${cats.map((c) => `
              <tr>
                <td>${c.id}</td>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.description || "")}</td>
                <td><a class="del-cat" data-id="${c.id}" style="color:var(--danger);">Delete</a></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : `<p style="color:var(--text-secondary)">No categories yet.</p>`;

      $all(".del-cat").forEach((a) => {
        a.addEventListener("click", async () => {
          if (!confirm("Delete this category?")) return;
          try {
            await Api.deleteCategory(a.dataset.id);
            toast("Category deleted.");
            loadCats();
          } catch (err) { toast(err.message, true); }
        });
      });
    } catch (err) {
      listEl.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  }
  loadCats();

  $("#add-cat-btn").addEventListener("click", async () => {
    const name = $("#new-cat-name").value.trim();
    const description = $("#new-cat-desc").value.trim();
    if (!name) { $("#cat-error").innerHTML = `<div class="error-box">Name is required.</div>`; return; }
    try {
      await Api.createCategory({ name, description });
      $("#new-cat-name").value = "";
      $("#new-cat-desc").value = "";
      $("#cat-error").innerHTML = "";
      toast("Category added.");
      loadCats();
    } catch (err) {
      $("#cat-error").innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  });
}

// ---------- Products ----------
async function adminProductsTab() {
  const wrap = $("#admin-tab-content");
  wrap.innerHTML = `
    <div class="grid-2">
      <div>
        <h3>Add product</h3>
        <div id="prod-error"></div>
        <div class="form-group"><label>Name</label><input id="p-name"></div>
        <div class="form-group"><label>Description</label><textarea id="p-desc" rows="2"></textarea></div>
        <div class="form-group"><label>Category</label><select id="p-category"></select></div>
        <div class="form-group"><label>Price</label><input type="number" step="0.01" id="p-price"></div>
        <div class="form-group"><label>Stock</label><input type="number" id="p-stock"></div>
        <div class="form-group"><label>Image</label><input type="file" id="p-image" accept="image/*"></div>
        <button class="btn" id="add-product-btn">Add product</button>
      </div>
      <div>
        <h3>Edit / delete a product</h3>
        <p style="color:var(--text-secondary);font-size:12px;">Enter the product ID to load it (the listing endpoint doesn't return IDs yet — see note in README).</p>
        <div class="form-group" style="display:flex;gap:8px;">
          <input type="number" id="lookup-id" placeholder="Product ID" style="max-width:140px;">
          <button class="btn-secondary btn" id="lookup-btn">Load</button>
        </div>
        <div id="edit-product-area"></div>
      </div>
    </div>
  `;

  Api.getCategories().then((cats) => {
    const sel = $("#p-category");
    (cats || []).forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }).catch(() => {});

  $("#add-product-btn").addEventListener("click", async () => {
    const name = $("#p-name").value.trim();
    const description = $("#p-desc").value.trim();
    const categoryId = $("#p-category").value;
    const price = $("#p-price").value;
    const stock = $("#p-stock").value;
    const imageFile = $("#p-image").files[0];

    if (!name || !categoryId || !price || !stock) {
      $("#prod-error").innerHTML = `<div class="error-box">Please fill in name, category, price and stock.</div>`;
      return;
    }
    const fd = new FormData();
    fd.append("Name", name);
    fd.append("Description", description);
    fd.append("Stock", stock);
    fd.append("Price", price);
    fd.append("CategoryId", categoryId);
    if (imageFile) fd.append("ImageUrl", imageFile);

    try {
      await Api.addProduct(fd);
      toast("Product added.");
      $("#p-name").value = ""; $("#p-desc").value = ""; $("#p-price").value = ""; $("#p-stock").value = ""; $("#p-image").value = "";
      $("#prod-error").innerHTML = "";
    } catch (err) {
      $("#prod-error").innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  });

  $("#lookup-btn").addEventListener("click", async () => {
    const id = $("#lookup-id").value;
    const area = $("#edit-product-area");
    if (!id) return;
    area.innerHTML = `<div class="spinner-row">Loading…</div>`;
    try {
      const p = await Api.getProduct(id);
      area.innerHTML = `
        <div class="form-group"><label>Name</label><input value="${escapeHtml(p.name)}" disabled></div>
        <div class="form-group"><label>Price</label><input type="number" step="0.01" id="edit-price" value="${p.price}"></div>
        <div class="form-group"><label>Stock</label><input type="number" id="edit-stock" value="${p.stock}"></div>
        <div style="display:flex;gap:8px;">
          <button class="btn" id="save-product-btn">Save changes</button>
          <button class="btn-danger btn" id="delete-product-btn">Delete product</button>
        </div>
      `;
      $("#save-product-btn").addEventListener("click", async () => {
        try {
          await Api.editProduct(id, { price: parseFloat($("#edit-price").value), stock: parseInt($("#edit-stock").value, 10) });
          toast("Product updated.");
        } catch (err) { toast(err.message, true); }
      });
      $("#delete-product-btn").addEventListener("click", async () => {
        if (!confirm("Delete this product?")) return;
        try {
          await Api.deleteProduct(id);
          toast("Product deleted.");
          area.innerHTML = "";
        } catch (err) { toast(err.message, true); }
      });
    } catch (err) {
      area.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  });
}

// ---------- Seller requests ----------
async function adminSellerRequestsTab() {
  const wrap = $("#admin-tab-content");
  wrap.innerHTML = `<div class="spinner-row">Loading requests…</div>`;

  let requests;
  try {
    requests = await Api.getSellerRequests();
  } catch (err) {
    wrap.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    return;
  }

  if (!requests || requests.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><h2>No pending requests</h2></div>`;
    return;
  }

  wrap.innerHTML = `
    <div id="seller-req-result"></div>
    <table class="data-table">
      <thead><tr><th>User</th><th>Requested</th><th></th></tr></thead>
      <tbody>
        ${requests.map((r) => `
          <tr data-request-id="${r.id}">
            <td>${escapeHtml(r.userName || r.userId)}</td>
            <td>${new Date(r.requestedAt).toLocaleDateString()}</td>
            <td>
              <button class="btn req-approve-btn">Approve</button>
              <button class="btn-secondary btn req-reject-btn">Reject</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;

  wrap.querySelectorAll(".req-approve-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest("tr").dataset.requestId;
      await handleSellerReqAction(id, "approve");
    });
  });
  wrap.querySelectorAll(".req-reject-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest("tr").dataset.requestId;
      await handleSellerReqAction(id, "reject");
    });
  });
}

async function handleSellerReqAction(id, action) {
  const box = $("#seller-req-result");
  try {
    if (action === "approve") await Api.approveSellerRequest(id);
    else await Api.rejectSellerRequest(id);
    box.innerHTML = `<div class="success-box">Request ${action === "approve" ? "approved" : "rejected"}.</div>`;
    adminSellerRequestsTab();
  } catch (err) {
    box.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
  }
}
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

async function adminOrdersTab() {
  const wrap = $("#admin-tab-content");
  wrap.innerHTML = `<div class="spinner-row">Loading orders…</div>`;

  let orders;
  try {
    orders = await Api.getAllOrders();
  } catch (err) {
    wrap.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    return;
  }

  if (!orders || orders.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><h2>No orders yet</h2></div>`;
    return;
  }

  wrap.innerHTML = `
    <div id="admin-orders-result"></div>
    <div style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Placed</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (o) => `
            <tr data-order-id="${o.id}">
              <td>#${o.id}</td>
              <td>${escapeHtml(o.userName || o.userId || "")}</td>
              <td class="price" style="font-size:13px;">$${Number(o.total).toFixed(2)}</td>
              <td>${new Date(o.createdAt).toLocaleDateString()}</td>
              <td>
                <select class="ord-status-select">
                  ${ORDER_STATUSES.map(
                    (s) =>
                      `<option value="${s}" ${String(o.status).toLowerCase() === s.toLowerCase() ? "selected" : ""}>${s}</option>`
                  ).join("")}
                </select>
              </td>
              <td><button class="btn btn-secondary ord-update-btn">Update</button></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  wrap.querySelectorAll(".ord-update-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest("tr");
      const orderId = row.dataset.orderId;
      const status = row.querySelector(".ord-status-select").value;
      const box = $("#admin-orders-result");
      btn.disabled = true;
      try {
        await Api.updateOrderStatus(orderId, status);
        box.innerHTML = `<div class="success-box">Order #${orderId} updated to ${status}.</div>`;
      } catch (err) {
        box.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
      } finally {
        btn.disabled = false;
      }
    });
  });
}
