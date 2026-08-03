// ============================================================
// Orders + Payment
// ============================================================

async function PageOrders() {
  $app.innerHTML = `<div class="content-wrap"><div class="card"><h1 style="font-weight:400;">Your Orders</h1><div id="orders-area"><div class="spinner-row">Loading…</div></div></div></div>`;
  const area = $("#orders-area");
  try {
    const orders = await Api.getMyOrders();
    const list = orders || [];
    if (list.length === 0) {
      area.innerHTML = `<div class="empty-state"><h2>No orders yet</h2><a class="btn" href="#/">Start shopping</a></div>`;
      return;
    }
    area.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
        <tbody>
          ${list.map((o) => `
            <tr>
              <td>#${o.id}</td>
              <td>${new Date(o.createdAt).toLocaleDateString()}</td>
              <td><span class="status-pill">${escapeHtml(o.status)}</span></td>
              <td>${money(o.total)}</td>
              <td><a href="#/orders/${o.id}">View details ›</a></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    area.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
  }
}

async function PageOrderDetail(orderId) {
  $app.innerHTML = `<div class="content-wrap"><div class="card"><div class="spinner-row">Loading order…</div></div></div>`;
  let order;
  try {
    order = await Api.getOrderDetails(orderId);
  } catch (err) {
    $app.innerHTML = `<div class="content-wrap"><div class="card"><div class="error-box">${escapeHtml(err.message)}</div></div></div>`;
    return;
  }

  $app.innerHTML = `
    <div class="content-wrap">
      <div class="card">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <h1 style="font-weight:400;margin-bottom:4px;">Order #${order.id}</h1>
            <div style="color:var(--text-secondary);">Placed ${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div style="text-align:right;">
            <span class="status-pill">${escapeHtml(order.status)}</span>
            <div style="margin-top:8px;">
              <button class="btn-secondary btn" id="cancel-order-btn">Cancel order</button>
            </div>
          </div>
        </div>
        <hr class="divider">
        <p><b>Shipping address:</b> ${escapeHtml(order.address)}</p>
        <table class="data-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${(order.items || []).map((i) => `
              <tr>
                <td>${escapeHtml(i.productName)}</td>
                <td>${i.quantity}</td>
                <td>${money(i.price)}</td>
                <td>${money(i.subtotal)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="text-align:right;font-size:18px;padding-top:10px;">Total: <b>${money(order.total)}</b></div>

        <hr class="divider">
        <h2>Payment</h2>
        <div id="payment-area"></div>
      </div>
    </div>
  `;

  $("#cancel-order-btn").addEventListener("click", async () => {
    if (!confirm("Cancel this order?")) return;
    try {
      await Api.cancelOrder(order.id);
      toast("Order cancelled.");
      PageOrderDetail(orderId);
    } catch (err) {
      toast(err.message, true);
    }
  });

  renderPaymentArea(order);
}

function renderPaymentArea(order) {
  const area = $("#payment-area");

  if (order.status === "Cancelled") {
    area.innerHTML = `<p style="color:var(--text-secondary);">This order was cancelled — no payment needed.</p>`;
    return;
  }
  if (order.status !== "Pending") {
    area.innerHTML = `<p style="color:var(--text-secondary);">This order is already <b>${escapeHtml(order.status)}</b>.</p>`;
    return;
  }

  area.innerHTML = `
    <div class="form-group" style="max-width:320px;">
      <label>Payment method</label>
      <select id="pay-method">
        <option value="Card">Credit / Debit Card</option>
        <option value="CashOnDelivery">Cash on Delivery</option>
        <option value="Wallet">Mobile Wallet</option>
      </select>
    </div>
    <button class="btn" id="pay-btn">Pay ${money(order.total)}</button>
    <div id="payment-result" style="margin-top:14px;"></div>
  `;

  $("#pay-btn").addEventListener("click", async () => {
    const method = $("#pay-method").value;
    const resultBox = $("#payment-result");
    try {
      const payment = await Api.createPayment({ orderId: order.id, method });
      resultBox.innerHTML = `
        <div class="success-box">Payment created (#${payment.id}) — status: ${escapeHtml(payment.status)}</div>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <button class="btn" id="confirm-pay-btn">Confirm payment</button>
          <button class="btn-danger btn" id="fail-pay-btn">Mark as failed</button>
        </div>
      `;
      $("#confirm-pay-btn").addEventListener("click", async () => {
        try {
          const tx = "TX-" + Math.random().toString(36).slice(2, 10).toUpperCase();
          await Api.confirmPayment(payment.id, { transactionId: tx });
          toast("Payment confirmed!");
          resultBox.innerHTML = `<div class="success-box">Payment confirmed. Transaction: ${tx}</div>`;
        } catch (err) { toast(err.message, true); }
      });
      $("#fail-pay-btn").addEventListener("click", async () => {
        try {
          await Api.failPayment(payment.id);
          toast("Payment marked as failed.");
          resultBox.innerHTML = `<div class="error-box">Payment failed.</div>`;
        } catch (err) { toast(err.message, true); }
      });
    } catch (err) {
      resultBox.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    }
  });
}
