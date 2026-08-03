// ============================================================
// Auth pages: Login, Register, Account
// ============================================================

async function PageLogin() {
  $app.innerHTML = `
    <div class="content-wrap">
      <div class="card form-card">
        <h2>Sign in</h2>
        <div id="login-error"></div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="login-email" autocomplete="username">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="login-password" autocomplete="current-password">
        </div>
        <button class="btn btn-block" id="login-btn">Sign in</button>
        <p class="form-note">New here? <a href="#/register">Create an account</a></p>
      </div>
    </div>
  `;

  $("#login-btn").addEventListener("click", async () => {
    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;
    const btn = $("#login-btn");
    btn.disabled = true;
    try {
      const res = await Api.login({ email, password });
      Store.setAuth(res.token, res.fullName);
      toast(`Welcome back, ${res.fullName}!`);
      const u = Store.getUser();
      go(u?.isAdmin || u?.isSeller ? "#/admin" : "#/");
    } catch (err) {
      $("#login-error").innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    } finally {
      btn.disabled = false;
    }
  });
}

async function PageRegister() {
  $app.innerHTML = `
    <div class="content-wrap">
      <div class="card form-card">
        <h2>Create account</h2>
        <div id="register-error"></div>
        <div class="form-group">
          <label>Full name</label>
          <input type="text" id="reg-name">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="reg-email" autocomplete="username">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="reg-password" autocomplete="new-password">
          <div class="form-note">At least 6 characters.</div>
        </div>
        <button class="btn btn-block" id="register-btn">Create your account</button>
        <p class="form-note">Already have an account? <a href="#/login">Sign in</a></p>
      </div>
    </div>
  `;

  $("#register-btn").addEventListener("click", async () => {
    const fullName = $("#reg-name").value.trim();
    const email = $("#reg-email").value.trim();
    const password = $("#reg-password").value;
    const btn = $("#register-btn");
    btn.disabled = true;
    try {
      const res = await Api.register({ fullName, email, password });
      Store.setAuth(res.token, res.fullName);
      toast(`Account created. Welcome, ${res.fullName}!`);
      go("#/");
    } catch (err) {
      $("#register-error").innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
    } finally {
      btn.disabled = false;
    }
  });
}

async function PageAccount() {
  const user = Store.getUser();
  const showSellerRequest = !user.isAdmin && !user.isSeller;
  $app.innerHTML = `
    <div class="content-wrap">
      <div class="card form-card">
        <h2>Your Account</h2>
        <p><b>Name:</b> ${escapeHtml(user.fullName)}</p>
        <p><b>Email:</b> ${escapeHtml(user.email || "—")}</p>
        <p><b>Role:</b> ${escapeHtml(user.role || "Customer")}</p>
        <hr class="divider">
        <a class="btn" href="#/orders">View your orders</a>
        ${user.isAdmin ? `<a class="btn btn-secondary" href="#/admin" style="margin-left:8px;">Admin panel</a>` : ""}
        ${showSellerRequest ? `
          <hr class="divider">
          <p class="form-note" style="margin-top:0;">Want to sell your own products on amazon.eg?</p>
          <button class="btn btn-secondary" id="request-seller-btn">Request to become a Seller</button>
          <div id="seller-request-result" style="margin-top:10px;"></div>
        ` : ""}
        <hr class="divider">
        <button class="btn-danger btn" id="logout-btn">Sign out</button>
      </div>
    </div>
  `;
  $("#logout-btn").addEventListener("click", () => {
    Store.clearAuth();
    toast("Signed out.");
    go("#/");
  });

  const sellerBtn = $("#request-seller-btn");
  if (sellerBtn) {
    sellerBtn.addEventListener("click", async () => {
      const box = $("#seller-request-result");
      sellerBtn.disabled = true;
      try {
        await Api.requestSeller();
        box.innerHTML = `<div class="success-box">Request submitted! An admin will review it soon.</div>`;
      } catch (err) {
        box.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
        sellerBtn.disabled = false;
      }
    });
  }
}
