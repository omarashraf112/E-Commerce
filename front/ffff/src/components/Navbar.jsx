import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  CartIcon,
  HeartIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  SparklesIcon,
  ZapIcon,
  TruckIcon,
} from "@/components/icons/Icons";
import "./navbar.css";

const ANNOUNCEMENTS = [
  { text: "⚡ Summer Drop is LIVE — Free Express Shipping on orders over $50", icon: TruckIcon },
  { text: "✨ 100% Handpicked Authentic Quality & 30-Day Easy Returns", icon: SparklesIcon },
  { text: "🔥 Use code SOUQLY10 for 10% off your first purchase", icon: ZapIcon },
];

export function Navbar({ categories = [] }) {
  const { user, isAuthenticated, isDashboardOnly, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotate announcement ticker every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const ActiveTickerIcon = ANNOUNCEMENTS[tickerIndex].icon;

  return (
    <header className="navbar-wrapper">
      {/* Top Announcement Ticker */}
      <div className="announcement-bar">
        <div className="container announcement-content">
          <div className="announcement-item">
            <ActiveTickerIcon size={14} className="announcement-icon" />
            <span>{ANNOUNCEMENTS[tickerIndex].text}</span>
          </div>
          <div className="announcement-links">
            <Link to="/orders" className="announcement-link">Track Order</Link>
            <span className="announcement-sep">•</span>
            <Link to="/search" className="announcement-link">Help & FAQs</Link>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <nav className="main-nav">
        <div className="container nav-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" aria-label="Souqly Home">
            <span className="brand-dot" aria-hidden="true" />
            <span className="brand-text">Souqly</span>
            <span className="brand-tag">Market</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="nav-search-wrapper">
            <SearchBar />
          </div>

          {/* Action Links */}
          <div className="nav-actions">
            {/* Wishlist Link */}
            {!isDashboardOnly && (
              <Link to="/search" className="nav-action-btn" title="Wishlist">
                <span className="nav-icon-badge-wrap">
                  <HeartIcon size={20} />
                  {wishlistCount > 0 && (
                    <span className="nav-badge mono">{wishlistCount}</span>
                  )}
                </span>
                <span className="nav-action-label">Saved</span>
              </Link>
            )}

            {/* Account / Auth */}
            {isAuthenticated ? (
              <div className="nav-account-group">
                <Link to={isDashboardOnly ? "/dashboard" : "/account"} className="nav-action-btn">
                  <span className="nav-avatar-icon">
                    <UserIcon size={18} />
                  </span>
                  <div className="nav-user-text">
                    <span className="nav-user-greeting">Hi, {user.fullName?.split(" ")[0]}</span>
                    <span className="nav-user-role">{isDashboardOnly ? "Dashboard" : "Account"}</span>
                  </div>
                </Link>
                <button
                  className="nav-signout-btn"
                  onClick={logout}
                  title="Sign out"
                >
                  Exit
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-action-btn nav-signin-btn">
                <UserIcon size={19} />
                <span className="nav-action-label">Sign in</span>
              </Link>
            )}

            {/* Cart Button */}
            {!isDashboardOnly && (
              <Link to="/cart" className="nav-cart-btn" aria-label="Shopping Cart">
                <div className="nav-cart-icon-wrap">
                  <CartIcon size={20} />
                  <span className="nav-cart-badge mono">{cartCount}</span>
                </div>
                <span className="nav-cart-label">Bag</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Sub-Navbar: Categories Pill Strip */}
      <div className="category-subnav">
        <div className="container subnav-container">
          <div className="subnav-links">
            <NavLink
              to="/search"
              end
              className={({ isActive }) => `subnav-pill ${isActive ? "subnav-pill-active" : ""}`}
            >
              <SparklesIcon size={14} />
              <span>All Products</span>
            </NavLink>

            {categories.map((c) => (
              <NavLink
                key={c.id}
                to={`/category/${c.id}`}
                className={({ isActive }) => `subnav-pill ${isActive ? "subnav-pill-active" : ""}`}
              >
                {c.name}
              </NavLink>
            ))}
          </div>

          <div className="subnav-highlights">
            <Link to="/search" className="subnav-highlight-deal">
              <ZapIcon size={14} />
              <span>Flash Deals</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-head">
              <span className="brand-text">Souqly</span>
              <button
                className="btn-icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="mobile-search-section">
              <SearchBar onSearchSubmit={() => setMobileMenuOpen(false)} />
            </div>

            <div className="mobile-drawer-menu">
              <span className="eyebrow">Explore Categories</span>
              <NavLink
                to="/search"
                className="mobile-menu-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>✨ All Products</span>
              </NavLink>
              {categories.map((c) => (
                <NavLink
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{c.name}</span>
                </NavLink>
              ))}

              <hr className="divider" />
              <span className="eyebrow">Account & Orders</span>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    className="mobile-menu-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="mobile-menu-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track Orders
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <Link
                    to="/login"
                    className="btn btn-primary btn-sm btn-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline btn-sm btn-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
