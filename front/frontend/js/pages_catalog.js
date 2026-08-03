// ============================================================
// Catalog pages: Home/listing + Product detail
// ============================================================

// ---------- Category icon illustrations (no external images needed) ----------
function categoryIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("veg") || n.includes("fruit"))
    return `<svg viewBox="0 0 64 64"><path d="M32 6c10 0 17 12 17 26 0 14-8 26-17 26s-17-12-17-26C15 18 22 6 32 6Z"/><ellipse cx="32" cy="34" rx="7" ry="9" class="ic-pit"/></svg>`;
  if (n.includes("dairy") || n.includes("egg") || n.includes("milk"))
    return `<svg viewBox="0 0 64 64"><path d="M24 8h16v8l5 8v30a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3V24l5-8Z"/><path d="M24 16h16" class="ic-cap"/></svg>`;
  if (n.includes("bak") || n.includes("bread"))
    return `<svg viewBox="0 0 64 64"><path d="M10 40c0-14 10-26 22-26s22 12 22 26v6H10Z"/><path d="M22 30q10-6 20 0M22 38q10-6 20 0" class="ic-cap"/></svg>`;
  if (n.includes("phone") || n.includes("mobile") || n.includes("electr") || n.includes("computer") || n.includes("all in one"))
    return `<svg viewBox="0 0 64 64"><rect x="18" y="6" width="28" height="52" rx="5"/><circle cx="32" cy="50" r="2.4" class="ic-cap"/></svg>`;
  return `<svg viewBox="0 0 64 64"><path d="M16 22h32l-3 30a4 4 0 0 1-4 3.6H23a4 4 0 0 1-4-3.6L16 22Z"/><path d="M24 22v-4a8 8 0 0 1 16 0v4" class="ic-cap"/></svg>`;
}

function categoryPhoto(name = "") {
  const n = name.toLowerCase();
  if (n.includes("veg") || n.includes("fruit")) return "images/promo-produce.jpg";
  if (n.includes("dairy") || n.includes("egg") || n.includes("milk")) return "images/promo-dairy.jpg";
  if (n.includes("bak") || n.includes("bread")) return "images/promo-bakery.jpg";
  if (n.includes("phone") || n.includes("mobile") || n.includes("electr") || n.includes("computer") || n.includes("all in one")) return "images/promo-electronics.jpg";
  return "images/promo-general.jpg";
}

const PROMO_COLORS = ["promo-a", "promo-b", "promo-c", "promo-d"];

function promoTile(cat, i) {
  return `
    <a class="promo-card" href="#/category/${cat.id}">
      <div class="promo-icon-tile ${PROMO_COLORS[i % PROMO_COLORS.length]}">
        ${categoryIcon(cat.name)}
        <img class="promo-photo" src="${categoryPhoto(cat.name)}" alt="" onerror="this.remove()">
      </div>
      <div class="promo-label">Shop ${escapeHtml(cat.name)}</div>
    </a>
  `;
}

function railCard(p) {
  const id = p.id ?? p.Id;
  const img = imgUrl(p.imageUrl);
  return `
    <a class="rail-card" href="#/product/${id}">
      <div class="rail-thumb">
        ${img ? `<img src="${img}" alt="${escapeHtml(p.name)}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'>No image</div>'">` : `<div class="placeholder">No image</div>`}
      </div>
      <div class="rail-name">${escapeHtml(p.name)}</div>
      <div class="price rail-price">${money(p.price)}</div>
    </a>
  `;
}

function productCard(p) {
  const id = p.id ?? p.Id;
  const img = imgUrl(p.imageUrl);
  const inStock = (p.stock ?? 0) > 0;
  const href = id != null ? `#/product/${id}` : "#";
  return `
    <a class="product-card" href="${href}" ${id == null ? 'onclick="return false;" title="Backend didn\'t return a product Id"' : ""}>
      <div class="product-thumb">
        ${img ? `<img src="${img}" alt="${escapeHtml(p.name)}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'>No image</div>'">` : `<div class="placeholder">No image</div>`}
      </div>
      <div class="product-name">${escapeHtml(p.name)}</div>
      <div class="price-row"><span class="price">${money(p.price)}</span></div>
      <div class="stock-note ${inStock ? "in" : "out"}">${inStock ? `In stock (${p.stock})` : "Out of stock"}</div>
      <div class="product-cat">${p.categoryName ? `<span class="badge">${escapeHtml(p.categoryName)}</span>` : ""}</div>
    </a>
  `;
}

async function PageHome(match, { params }) {
  const categoryId = (match && match[1]) || params.get("categoryId") || "";
  const q = params.get("q") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const sortBy = params.get("sortBy") || "";
  const sortOrder = params.get("sortOrder") || "asc";
  const page = parseInt(params.get("page") || "1", 10);
  const pageSize = 12;

  const showHero = !categoryId && !q;

  $app.innerHTML = `
    ${showHero ? `
      <section class="hero">
        <div class="hero-photo" style="background-image:url('images/hero-banner.jpg')"></div>
        <div class="hero-inner">
          <h1>Everything you need, delivered fast.</h1>
          <p>Browse categories or search for exactly what you're after.</p>
        </div>
      </section>
      <section class="content-wrap">
        <div class="promo-grid" id="promo-grid"></div>
      </section>
      <section class="content-wrap rail-section">
        <h2 class="rail-title">Best sellers right now</h2>
        <div class="rail" id="bestsellers-rail"><div class="spinner-row">Loading picks…</div></div>
      </section>
    ` : ""}
    <div class="content-wrap">
      <div class="card">
        <div class="filter-bar">
          <select id="f-category"><option value="">All categories</option></select>
          <input type="number" id="f-min" placeholder="Min $" style="width:90px" value="${escapeHtml(minPrice)}">
          <input type="number" id="f-max" placeholder="Max $" style="width:90px" value="${escapeHtml(maxPrice)}">
          <select id="f-sort">
            <option value="">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
          <button class="btn" id="f-apply">Apply</button>
          <span class="grow"></span>
          <span class="result-count" id="result-count"></span>
        </div>
        <div id="product-area"><div class="spinner-row">Loading products…</div></div>
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  `;

  // populate category dropdown + promo grid
  Api.getCategories().then((cats) => {
    const sel = $("#f-category");
    (cats || []).forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      if (String(c.id) === String(categoryId)) opt.selected = true;
      sel.appendChild(opt);
    });
    const promo = $("#promo-grid");
    if (promo) {
      promo.innerHTML = (cats || []).map((c, i) => promoTile(c, i)).join("");
    }
  }).catch(() => {});

  if (showHero) {
    Api.getProducts({ Page: 1, PageSize: 10 }).then((products) => {
      const rail = $("#bestsellers-rail");
      if (!rail) return;
      const list = products || [];
      rail.innerHTML = list.length
        ? list.map(railCard).join("")
        : `<div class="empty-state" style="padding:24px;">No products yet.</div>`;
    }).catch((err) => {
      const rail = $("#bestsellers-rail");
      if (rail) rail.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    });
  }

  if (sortBy) {
    $("#f-sort").value = `${sortBy}-${sortOrder}`;
  }

  $("#f-apply").addEventListener("click", () => {
    const catVal = $("#f-category").value;
    const minVal = $("#f-min").value;
    const maxVal = $("#f-max").value;
    const sortVal = $("#f-sort").value;
    const [sBy, sOrder] = sortVal ? sortVal.split("-") : ["", "asc"];
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (minVal) p.set("minPrice", minVal);
    if (maxVal) p.set("maxPrice", maxVal);
    if (sBy) { p.set("sortBy", sBy); p.set("sortOrder", sOrder); }
    if (catVal) {
      go(`#/category/${catVal}?${p.toString()}`);
    } else {
      go(`#/search?${p.toString()}`);
    }
  });

  async function loadPage(pageNum) {
    const area = $("#product-area");
    area.innerHTML = `<div class="spinner-row">Loading products…</div>`;
    const filter = {
      Search: q || undefined,
      CategoryId: categoryId || undefined,
      MinPrice: minPrice || undefined,
      MaxPrice: maxPrice || undefined,
      SortBy: sortBy || undefined,
      SortOrder: sortOrder || undefined,
      Page: pageNum,
      PageSize: pageSize,
    };
    try {
      const products = await Api.getProducts(filter);
      const list = products || [];
      $("#result-count").textContent = `${list.length} result${list.length === 1 ? "" : "s"}`;
      if (list.length === 0) {
        area.innerHTML = `<div class="empty-state"><h2>No products found</h2><p>Try adjusting your filters or search.</p></div>`;
      } else {
        area.innerHTML = `<div class="product-grid">${list.map(productCard).join("")}</div>`;
      }
      const pag = $("#pagination");
      pag.innerHTML = `
        <button id="prev-page" ${pageNum <= 1 ? "disabled" : ""}>‹ Prev</button>
        <button class="active">${pageNum}</button>
        <button id="next-page" ${list.length < pageSize ? "disabled" : ""}>Next ›</button>
      `;
      $("#prev-page")?.addEventListener("click", () => loadPage(pageNum - 1));
      $("#next-page")?.addEventListener("click", () => loadPage(pageNum + 1));
    } catch (err) {
      area.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  }

  loadPage(page || 1);
}

async function PageProduct(id) {
  $app.innerHTML = `<div class="content-wrap"><div class="spinner-row">Loading product…</div></div>`;
  let p;
  try {
    p = await Api.getProduct(id);
  } catch (err) {
    $app.innerHTML = `<div class="content-wrap"><div class="card"><div class="error-box">${escapeHtml(err.message)}</div></div></div>`;
    return;
  }
  const img = imgUrl(p.imageUrl);
  const inStock = (p.stock ?? 0) > 0;
  const user = Store.getUser();

  $app.innerHTML = `
    <div class="content-wrap">
      <div class="card">
        <div class="detail-grid">
          <div class="detail-image">
            ${img ? `<img src="${img}" alt="${escapeHtml(p.name)}">` : `<div class="placeholder" style="height:300px;display:flex;align-items:center;justify-content:center;background:#f0f2f2;">No image</div>`}
          </div>
          <div>
            <h1 class="detail-title">${escapeHtml(p.name)}</h1>
            ${p.categoryName ? `<a href="#/">${escapeHtml(p.categoryName)}</a>` : ""}
            <div id="rating-summary" class="stars" style="margin:8px 0;"></div>
            <hr class="divider">
            <p>${escapeHtml(p.description || "No description provided.")}</p>
          </div>
          <div class="buybox">
            <div class="price">${money(p.price)}</div>
            <div class="stock-note ${inStock ? "in" : "out"}">${inStock ? `In stock (${p.stock} available)` : "Currently unavailable"}</div>
            <hr class="divider">
            ${user?.isSeller && !user?.isAdmin ? `
              <p class="form-note" style="margin-top:0;">Seller accounts can't purchase products.</p>
            ` : `
              <label for="qty">Qty:</label>
              <select class="qty-select" id="qty">
                ${Array.from({ length: Math.min(10, p.stock || 0) || 1 }, (_, i) => i + 1)
                  .map((n) => `<option value="${n}">${n}</option>`).join("")}
              </select>
              <button class="btn btn-block" id="add-cart-btn" ${inStock ? "" : "disabled"}>Add to Cart</button>
            `}
          </div>
        </div>

        <hr class="divider">
        <h2>Customer reviews</h2>
        <div id="reviews-area"><div class="spinner-row">Loading reviews…</div></div>

        ${user ? `
          <div id="review-form-wrap" style="max-width:420px;margin-top:18px;">
            <h3>Write a review</h3>
            <div id="review-error"></div>
            <div class="form-group">
              <label>Rating</label>
              <select id="review-rating">
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div class="form-group">
              <label>Comment</label>
              <textarea id="review-comment" rows="3"></textarea>
            </div>
            <button class="btn" id="submit-review">Submit review</button>
          </div>
        ` : `<p><a href="#/login">Sign in</a> to write a review.</p>`}
      </div>
    </div>
  `;

  $("#add-cart-btn")?.addEventListener("click", async () => {
    if (!Store.isLoggedIn()) { toast("Please sign in first.", true); return go("#/login"); }
    const qty = parseInt($("#qty").value, 10) || 1;
    try {
      await Api.addToCart({ productId: Number(id), quantity: qty });
      toast("Added to cart.");
      loadCartCount();
    } catch (err) {
      toast(err.message, true);
    }
  });

  async function loadReviews() {
    const area = $("#reviews-area");
    try {
      const reviews = await Api.getReviews(id);
      const list = reviews || [];
      const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
      const summary = $("#rating-summary");
      if (summary) summary.innerHTML = list.length ? `${stars(avg)} <span style="color:var(--text-secondary)">${avg.toFixed(1)} (${list.length} review${list.length === 1 ? "" : "s"})</span>` : `<span style="color:var(--text-secondary)">No reviews yet</span>`;

      area.innerHTML = list.length
        ? list.map((r) => `
            <div class="review">
              <div class="review-head">${stars(r.rating)} ${escapeHtml(r.userName)}</div>
              <div class="review-date">${new Date(r.createdAt).toLocaleDateString()}</div>
              <p>${escapeHtml(r.comment || "")}</p>
            </div>
          `).join("")
        : `<p style="color:var(--text-secondary)">Be the first to review this product.</p>`;
    } catch (err) {
      area.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  }
  loadReviews();

  $("#submit-review")?.addEventListener("click", async () => {
    const rating = parseInt($("#review-rating").value, 10);
    const comment = $("#review-comment").value.trim();
    try {
      await Api.createReview({ productId: Number(id), rating, comment });
      $("#review-comment").value = "";
      toast("Review submitted.");
      loadReviews();
    } catch (err) {
      $("#review-error").innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  });
}
