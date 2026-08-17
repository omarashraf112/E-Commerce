import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { ProtectedRoute, ShopperRoute, DashboardRoute, AdminOnlyRoute } from "@/components/RouteGuards";

import { MainLayout } from "@/layouts/MainLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import Home from "@/pages/Home";
import Category from "@/pages/Category";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import NotFound from "@/pages/NotFound";

import Overview from "@/pages/admin/Overview";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminSellerRequests from "@/pages/admin/AdminSellerRequests";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                {/* Storefront — off-limits to Admin/Seller accounts */}
                <Route element={<ShopperRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Category />} />
                    <Route path="/category/:id" element={<Category />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<ProtectedRoute />}>
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetail />} />
                    </Route>
                  </Route>
                </Route>

                {/* Dashboard — Admin & Seller only */}
                <Route element={<DashboardRoute />}>
                  <Route path="/dashboard" element={<AdminLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route element={<AdminOnlyRoute />}>
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="sellers" element={<AdminSellerRequests />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
