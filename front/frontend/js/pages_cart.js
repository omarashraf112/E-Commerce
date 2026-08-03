// ============================================================
// Cart + Checkout
// ============================================================

async function PageCart() {
  $app.innerHTML = `
    <div class="content-wrap">
      <div class="card" id="cart-card">
        <div class="spinner-row">Loading your cart…</div>
      </div>
    </div>
  `;
  await renderCart();
}

async function renderCart() {
  const card = $("#cart-card");
  let items;
  try {
    items = await Api.getCart();
  } catch (err) {
    card.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    return;
  }
  items = items || [];

  if (items.length === 0) {
    card.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <a class="btn" href="#/">Continue shopping</a>
      </div>`;
    return;
  }

  const total = items.reduce((s, i) => s + (i.subtotal ?? i.price * i.quantity), 0);

  card.innerHTML = `
    <div class="cart-layout">
      <div>
        <h1 style="font-weight:400;">Shopping Cart</h1>
        <hr class="divider">
        <div id="cart-items">
          ${items.map((i) => `
            <div class="cart-item" data-id="${i.id}">
              <img src="${imgUrl(i.imageUrl) || ""}" onerror="this.style.visibility='hidden'" alt="${escapeHtml(i.productName)}">
              <div>
                <div style="font-weight:600;">${escapeHtml(i.productName)}</div>
                <div style="color:var(--success);font-size:12px;">In stock</div>
                <div class="cart-item-actions">
                  <label>Qty:
                    <select class="cart-qty" data-id="${i.id}">
                      ${Array.from({ length: 10 }, (_, n) => n + 1)
                        .map((n) => `<option value="${n}" ${n === i.quantity ? "selected" : ""}>${n}</option>`).join("")}
                    </select>
                  </label>
                  <a class="cart-delete" data-id="${i.id}">Delete</a>
                </div>
              </div>
              <div style="font-weight:700;">${money(i.subtotal ?? i.price * i.quantity)}</div>
            </div>
          `).join("")}
        </div>
        <div style="text-align:right;padding-top:10px;font-size:16px;">
          Subtotal (${items.reduce((s, i) => s + i.quantity, 0)} items): <b>${money(total)}</b>
        </div>
        <div style="text-align:right;padding-top:8px;">
          <a id="clear-cart" style="color:var(--danger);">Clear cart</a>
        </div>
      </div>
      <div class="card summary-box" style="border:1px solid var(--border);">
        <div>Subtotal (${items.reduce((s, i) => s + i.quantity, 0)} items):</div>
        <div class="price">${money(total)}</div>
        <button class="btn btn-block" id="checkout-btn" style="margin-top:12px;">Proceed to Checkout</button>
      </div>
    </div>
  `;

  $all(".cart-qty").forEach((sel) => {
    sel.addEventListener("change", async () => {
      const id = sel.dataset.id;
      try {
        await Api.updateCartQuantity(id, parseInt(sel.value, 10));
        loadCartCount();
        renderCart();
      } catch (err) {
        toast(err.message, true);
      }
    });
  });

  $all(".cart-delete").forEach((a) => {
    a.addEventListener("click", async () => {
      try {
        await Api.deleteCartItem(parseInt(a.dataset.id, 10));
        toast("Item removed.");
        loadCartCount();
        renderCart();
      } catch (err) {
        toast(err.message, true);
      }
    });
  });

  $("#clear-cart")?.addEventListener("click", async () => {
    if (!confirm("Remove all items from your cart?")) return;
    try {
      await Api.clearCart();
      loadCartCount();
      renderCart();
    } catch (err) {
      toast(err.message, true);
    }
  });

  $("#checkout-btn")?.addEventListener("click", () => go("#/checkout"));
}

async function PageCheckout() {
  $app.innerHTML = `
    <div class="content-wrap">
      <div class="card form-card" style="max-width:480px;">
        <h2>Checkout</h2>
        <div id="checkout-error"></div>
        <div class="form-group">
          <label>Shipping address</label>
          <textarea id="address" rows="3" placeholder="Street, city, governorate"></textarea>
        </div>
        <button class="btn btn-block" id="place-order-btn">Place your order</button>
      </div>
    </div>
  `;

  $("#place-order-btn").addEventListener("click", async () => {
    const address = $("#address").value.trim();
    if (!address) {
      $("#checkout-error").innerHTML = `<div class="error-box">Please enter a shipping address.</div>`;
      return;
    }
    const btn = $("#place-order-btn");
    btn.disabled = true;
    btn.textContent = "Placing order…";
    try {
      const order = await Api.checkout(address);
      loadCartCount();
      toast("Order placed!");
      go(`#/orders/${order.id}`);
    } catch (err) {
      $("#checkout-error").innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
      btn.disabled = false;
      btn.textContent = "Place your order";
    }
  });
}
