import { Link } from "react-router-dom";
import { SparklesIcon, ArrowRightIcon } from "@/components/icons/Icons";

export function NotFound() {
  return (
    <div className="container" style={{ padding: "100px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="state-icon-circle" style={{ marginBottom: 16 }}>
        <SparklesIcon size={28} />
      </div>
      <span className="eyebrow" style={{ color: "var(--coral)", marginBottom: 8 }}>Page Not Found (404)</span>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 12px", color: "var(--text-main)" }}>
        We couldn't find this page.
      </h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: 460, margin: "0 0 28px", lineHeight: 1.6 }}>
        The item or stall you are looking for may have moved or no longer exists. Explore our featured collections to continue shopping.
      </p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/" className="btn btn-primary btn-lg">
          <span>Back to Marketplace</span>
          <ArrowRightIcon size={18} />
        </Link>
        <Link to="/search" className="btn btn-outline btn-lg">
          Search All Goods
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
