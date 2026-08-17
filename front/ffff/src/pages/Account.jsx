import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { UserIcon, HeartIcon, TruckIcon, SparklesIcon, ArrowRightIcon } from "@/components/icons/Icons";
import "./account.css";

export function Account() {
  const { user, logout, requestSeller } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);

  async function handleRequestSeller() {
    setBusy(true);
    try {
      await requestSeller();
      setRequested(true);
      toast.success("Seller request submitted! Our team will review your shop application.");
    } catch (err) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setBusy(false);
    }
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SQ";

  return (
    <div className="container account-page">
      {/* Profile Header */}
      <div className="account-hero-card card">
        <div className="account-avatar-circle">
          <span>{initials}</span>
        </div>
        <div className="account-hero-info">
          <span className="badge badge-brand">Verified Shopper</span>
          <h1 className="account-name">{user?.fullName || "Valued Shopper"}</h1>
          <p className="account-email">{user?.email || "customer@souqly.com"}</p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="account-stats-grid">
        <Link to="/orders" className="account-stat-card card">
          <div className="stat-card-icon"><TruckIcon size={24} /></div>
          <div>
            <h3>Your Orders</h3>
            <p>Track packages & view receipts</p>
          </div>
          <ArrowRightIcon size={18} className="stat-arrow" />
        </Link>

        <Link to="/search" className="account-stat-card card">
          <div className="stat-card-icon"><HeartIcon size={24} /></div>
          <div>
            <h3>Saved Items</h3>
            <p>{wishlistCount} items on your wishlist</p>
          </div>
          <ArrowRightIcon size={18} className="stat-arrow" />
        </Link>
      </div>

      {/* Account Details & Seller Hub */}
      <div className="account-content-grid">
        <div className="account-section card">
          <h3>Personal Information</h3>
          <div className="account-data-list">
            <div className="account-data-row">
              <span className="data-label">Full Name</span>
              <span className="data-value">{user?.fullName || "—"}</span>
            </div>
            <div className="account-data-row">
              <span className="data-label">Email Address</span>
              <span className="data-value">{user?.email || "—"}</span>
            </div>
            <div className="account-data-row">
              <span className="data-label">Account Role</span>
              <span className="data-value" style={{ textTransform: "capitalize" }}>
                {user?.role || "Customer"}
              </span>
            </div>
          </div>

          <hr className="divider" />
          <button className="btn btn-danger btn-sm" onClick={logout}>
            Sign Out of Account
          </button>
        </div>

        {/* Partner with Souqly */}
        <div className="account-section card partner-card">
          <div className="partner-icon">
            <SparklesIcon size={26} />
          </div>
          <h3>Sell on Souqly</h3>
          <p>
            Reach thousands of discerning shoppers. List your lifestyle products, manage inventory, and grow your brand.
          </p>
          <button
            className="btn btn-accent btn-block"
            onClick={handleRequestSeller}
            disabled={busy || requested}
          >
            {requested ? "Application Submitted ✓" : busy ? "Submitting…" : "Apply as a Merchant"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Account;
