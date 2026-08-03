// ============================================================
// App shell: helpers, layout, router
// ============================================================

const $app = document.getElementById("app");
const $header = document.getElementById("header");
const $footer = document.getElementById("footer");

function money(n) {
  const v = Number(n || 0);
  return `$${v.toFixed(2)}`;
}

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const origin = CONFIG.API_BASE_URL.replace(/\/api\/?$/, "");
  return origin + path;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function toast(msg, isError = false) {
  const t = document.createElement("div");
  t.className = "toast";
  if (isError) t.style.background = "#c40000";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function go(hash) {
  location.hash = hash;
}

function stars(avg) {
  const full = Math.round(avg || 0);
  return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
}

// ---------- Header / footer ----------
function renderHeader() {
  const user = Store.getUser();
  const sellerOnly = user?.isSeller && !user?.isAdmin;
  $header.innerHTML = `
    <div class="header-top">
      <a href="#/" class="logo">amaz<span>on</span>.eg</a>
      <div class="deliver-to">
        📍 Deliver to<br><b>Cairo, Egypt</b>
      </div>
      <form class="search-bar" id="search-form">
        <select id="search-category"><option value="">All</option></select>
        <input type="text" id="search-input" placeholder="Search products..." />
        <button type="submit">🔍</button>
      </form>
      <a href="#/${user ? "account" : "login"}" class="header-link">
        <span>Hello, ${user ? escapeHtml(user.fullName.split(" ")[0]) : "sign in"}</span>
        <b>Account &amp; Lists</b>
      </a>
      ${sellerOnly ? "" : `
        <a href="#/orders" class="header-link">
          <span>Returns</span>
          <b>&amp; Orders</b>
        </a>
        <a href="#/cart" class="cart-link">
          <span class="cart-icon">🛒<span class="cart-count" id="cart-count">0</span></span>
          <span class="cart-word">Cart</span>
        </a>
      `}
    </div>
    <div class="header-bottom" id="header-bottom">
      <button class="linklike all-btn">☰ All</button>
    </div>
  `;

  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#search-input").value.trim();
    go(`#/search?q=${encodeURIComponent(q)}`);
  });

  loadCartCount();
  loadCategoryNav();
}

async function loadCategoryNav() {
  try {
    const cats = await Api.getCategories();
    const sel = document.getElementById("search-category");
    const bar = document.getElementById("header-bottom");
    (cats || []).forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);

      const a = document.createElement("a");
      a.href = `#/category/${c.id}`;
      a.textContent = c.name;
      bar.appendChild(a);
    });
    const user = Store.getUser();
    if (user?.isAdmin || user?.isSeller) {
      const a = document.createElement("a");
      a.href = "#/admin";
      a.textContent = "⚙ Admin panel";
      a.style.marginLeft = "auto";
      bar.appendChild(a);
    }
  } catch { /* categories are optional in the nav */ }
}

async function loadCartCount() {
  const el = document.getElementById("cart-count");
  if (!Store.isLoggedIn()) { if (el) el.textContent = "0"; return; }
  try {
    const items = await Api.getCart();
    const count = (items || []).reduce((s, i) => s + i.quantity, 0);
    if (el) el.textContent = count;
  } catch { /* ignore */ }
}

function renderFooter() {
  $footer.innerHTML = `
    <div class="footer-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">Back to top</div>
    <div class="footer-mid">
      <div><h4>Get to Know Us</h4>Careers<br>About<br>Press</div>
      <div><h4>Make Money with Us</h4>Sell products<br>Become an Affiliate<br>Advertise</div>
      <div><h4>Payment Products</h4>Business Card<br>Shop with Points</div>
      <div><h4>Let Us Help You</h4>Your Account<br>Returns Centre<br>Help</div>
    </div>
    <div class="footer-bottom">Built for the NovaStore-style backend · not a real store</div>
  `;
}

// ---------- tiny DOM helper ----------
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

// ---------- Router ----------
const routes = [
  { pattern: /^\/$/, page: PageHome },
  { pattern: /^\/search$/, page: PageHome },
  { pattern: /^\/category\/(\d+)$/, page: (p, ctx) => PageHome(p, ctx) },
  { pattern: /^\/product\/(\d+)$/, page: (p) => PageProduct(p[1]) },
  { pattern: /^\/cart$/, page: PageCart, needsAuth: true },
  { pattern: /^\/checkout$/, page: PageCheckout, needsAuth: true },
  { pattern: /^\/orders$/, page: PageOrders, needsAuth: true },
  { pattern: /^\/orders\/(\d+)$/, page: (p) => PageOrderDetail(p[1]), needsAuth: true },
  { pattern: /^\/login$/, page: PageLogin },
  { pattern: /^\/register$/, page: PageRegister },
  { pattern: /^\/account$/, page: PageAccount, needsAuth: true },
  { pattern: /^\/admin$/, page: PageAdmin, needsAuth: true, adminOnly: true },
];

function parseHash() {
  const raw = location.hash.slice(1) || "/";
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  return { path, params };
}

async function router() {
  const { path, params } = parseHash();
  window.scrollTo(0, 0);

  const isAdminRoute = path === "/admin";
  const currentUser = Store.getUser();
  const isDashboardUser = currentUser?.isAdmin || currentUser?.isSeller;

  document.body.classList.toggle("admin-mode", isAdminRoute);

  // Admins and Sellers only ever see the dashboard — bounce them off every storefront route
  if (isDashboardUser && !isAdminRoute) {
    return go("#/admin");
  }

  if (!isAdminRoute) {
    renderHeader();
    renderFooter();
  } else {
    $("#header").innerHTML = "";
    $("#footer").innerHTML = "";
  }

  for (const route of routes) {
    const match = path.match(route.pattern);
    if (!match) continue;

    if (route.needsAuth && !Store.isLoggedIn()) {
      $app.innerHTML = "";
      toast("Please sign in to continue.", true);
      return go("#/login");
    }
    if (route.adminOnly && !isDashboardUser) {
      $app.innerHTML = `<div class="empty-state"><h2>Admins only</h2><p>You don't have access to this page.</p></div>`;
      return;
    }

    $app.innerHTML = `<div class="spinner-row">Loading…</div>`;
    try {
      await route.page(match, { params });
    } catch (err) {
      $app.innerHTML = `<div class="content-wrap"><div class="card"><div class="error-box">${escapeHtml(err.message || "Something went wrong.")}</div></div></div>`;
    }
    return;
  }
  $app.innerHTML = `<div class="empty-state"><h2>Page not found</h2><a href="#/">Go home</a></div>`;
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
