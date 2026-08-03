# amazon.eg — frontend for Final_Ecommerce backend

Plain HTML/CSS/JS (no build step, no npm) — styled after Amazon, talks to your
ASP.NET Core API over `fetch`.

## Run it

1. Open `js/config.js` and set `API_BASE_URL` to your backend's actual URL
   (check `Properties/launchSettings.json` → `applicationUrl`, or the console
   when you `dotnet run`). It currently points at `https://localhost:7000/api`.
2. Don't open `index.html` directly with `file://` — some browsers block
   fetches from a `file://` page. Serve the folder instead, e.g.:
   - VS Code "Live Server" extension, or
   - `npx serve .` from inside the `frontend` folder
3. Make sure the backend is running, then open the served URL.

## You need to add CORS to the backend

Your `Program.cs` doesn't call `UseCors` anywhere, so the browser will block
every request from this frontend (different origin/port = blocked by
default). Add this before `app.MapControllers()`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500") // whatever origin you serve the frontend from
              .AllowAnyHeader()
              .AllowAnyMethod());
});
// ...
app.UseCors("AllowFrontend");
```

## Two things worth fixing in the backend

1. **`Prodouctresponse` has no `Id`.** `GetProducts`, `GetProductByCategory`
   and `GetProductById` all return this DTO, so the product **list** page has
   no way to know a product's ID to link to its detail page or add it to the
   cart. I worked around it in the admin panel (manual ID lookup), but the
   public product grid needs `Id` in the DTO to fully work — add
   `public int Id { get; set; }` to `Prodouctresponse` and set it wherever
   the DTO is built in `ProductServices.cs`.
2. **No "list all orders" endpoint for admins.** `OrderController` only
   exposes the logged-in user's own orders (`/summary`, `/details`), so an
   admin can't browse orders to update their status — they'd need to already
   know the order ID. Worth adding something like
   `GET /api/Order/all` (Admin-only) if you want a real admin order queue.

I built the admin "update order status" and "edit/delete product" screens
around manual ID entry so the app still works today, but fixing #1 especially
will make the storefront feel a lot more normal.

## What's here

- Home / search / category browsing with price & sort filters
- Product detail page with reviews (read + write)
- Cart (add, change quantity, remove, clear)
- Checkout → order → payment (create / confirm / mark failed)
- Order history + order detail
- Login / register (JWT stored in `localStorage`, decoded client-side for
  role-based UI)
- Admin panel: categories (add/delete), products (add/edit/delete), order
  status updates

## Notes

- The `OrderController.UpdateOrderStatus` endpoint takes `status` as a query
  string enum. I used common status names (Pending/Processing/Shipped/
  Delivered/Cancelled) in the dropdown — rename these in
  `js/pages_admin.js` if your actual `OrderStatus` enum uses different names.
- `DELETE /api/Cart/item` expects the cart item ID as a raw JSON number in
  the body (not `{ "cartItemId": 1 }`) — the frontend already sends it that
  way to match `[FromBody] int cartItemId`.
