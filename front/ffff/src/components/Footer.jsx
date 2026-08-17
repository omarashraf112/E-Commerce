import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { TruckIcon, ShieldCheckIcon, SparklesIcon, CreditCardIcon, WalletIcon } from "@/components/icons/Icons";
import "./footer.css";

export function Footer() {
  const [email, setEmail] = useState("");
  const toast = useToast();

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Welcome to the Souqly Club! Enjoy 15% off with code SOUQLY15.");
    setEmail("");
  }

  return (
    <footer className="footer-wrapper">
      {/* Trust Highlight Strip */}
      <div className="footer-perks">
        <div className="container footer-perks-grid">
          <div className="footer-perk-item">
            <div className="footer-perk-icon"><TruckIcon size={22} /></div>
            <div>
              <h4>Free Express Delivery</h4>
              <p>On all domestic orders over $50</p>
            </div>
          </div>
          <div className="footer-perk-item">
            <div className="footer-perk-icon"><ShieldCheckIcon size={22} /></div>
            <div>
              <h4>100% Authentic Goods</h4>
              <p>Directly verified from curated makers</p>
            </div>
          </div>
          <div className="footer-perk-item">
            <div className="footer-perk-icon"><SparklesIcon size={22} /></div>
            <div>
              <h4>30-Day Easy Returns</h4>
              <p>No questions asked return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="container footer-main">
        <div className="footer-brand-col">
          <Link to="/" className="brand-logo footer-logo">
            <span className="brand-dot" />
            <span className="brand-text" style={{ color: "#ffffff" }}>Souqly</span>
            <span className="brand-tag">Market</span>
          </Link>
          <p className="footer-brand-desc">
            A modern, curated marketplace for life, tech, style, and artisanal everyday essentials. Handpicked stock, fair prices, delivered with care.
          </p>

          <form className="footer-newsletter" onSubmit={handleSubscribe}>
            <span className="footer-newsletter-label">Get 15% off your first order:</span>
            <div className="footer-newsletter-wrap">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-accent btn-sm">
                Join
              </button>
            </div>
          </form>
        </div>

        <div className="footer-nav-col">
          <span className="footer-nav-title">Shop Stalls</span>
          <ul>
            <li><Link to="/search">All Collections</Link></li>
            <li><Link to="/category/1">Tech & Audio</Link></li>
            <li><Link to="/category/2">Home & Living</Link></li>
            <li><Link to="/category/3">Apparel & Style</Link></li>
            <li><Link to="/category/4">Coffee & Gourmet</Link></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <span className="footer-nav-title">Customer Care</span>
          <ul>
            <li><Link to="/orders">Track Your Order</Link></li>
            <li><Link to="/cart">Shopping Bag</Link></li>
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/search">Help & Return Policy</Link></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <span className="footer-nav-title">Accepted Payments</span>
          <div className="footer-payment-badges">
            <span className="payment-badge"><CreditCardIcon size={16} /> Visa / MC</span>
            <span className="payment-badge"><WalletIcon size={16} /> Vodafone Cash</span>
            <span className="payment-badge"><TruckIcon size={16} /> Cash on Delivery</span>
          </div>
          <div className="footer-seller-cta">
            <span className="footer-nav-title" style={{ marginTop: 16 }}>Become a Partner</span>
            <p style={{ fontSize: 12, color: "var(--text-light)", margin: "4px 0 10px" }}>
              Are you a maker or brand? Sell your goods on Souqly.
            </p>
            <Link to="/account" className="btn btn-outline btn-sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
              Seller Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright Sub-footer */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content mono">
          <span>© {new Date().getFullYear()} Souqly Market Inc. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/search">Privacy Policy</Link>
            <span>•</span>
            <Link to="/search">Terms of Service</Link>
            <span>•</span>
            <Link to="/search">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
