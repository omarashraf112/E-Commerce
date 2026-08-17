import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ProductApi } from "@/api/products";
import { ReviewApi } from "@/api/reviews";
import { useAsync } from "@/hooks/useAsync";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { QuantitySelector } from "@/components/QuantitySelector";
import { StarRating } from "@/components/StarRating";
import { ProductGrid } from "@/components/ProductGrid";
import { LoadingState, ErrorState } from "@/components/States";
import { money, shortDate } from "@/utils/format";
import { resolveImageUrl } from "@/utils/image";
import {
  CartIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckIcon,
  LockIcon,
} from "@/components/icons/Icons";
import "./productDetail.css";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, shoppingEnabled } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("specs");

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: product, loading, error, reload } = useAsync(() => ProductApi.getById(id), [id]);
  const { data: related } = useAsync(
    () => (product?.categoryId ? ProductApi.getByCategory(product.categoryId) : Promise.resolve([])),
    [product?.categoryId]
  );
  const { data: rawReviews, reload: reloadReviews } = useAsync(
    () => ReviewApi.getByProduct(id).catch(() => []),
    [id]
  );

  const reviews = rawReviews || [];

  if (loading) return <div className="container" style={{ padding: "40px 0" }}><LoadingState label="Preparing product view" /></div>;
  if (error) return <div className="container" style={{ padding: "40px 0" }}><ErrorState message={error.message} onRetry={reload} /></div>;
  if (!product) return null;

  const inStock = product.stock > 0;
  const isLowStock = inStock && product.stock <= 5;
  const favorited = isInWishlist(product.id);

  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const currentImage = galleryImages[activeImageIndex] || product.imageUrl;

  const relatedOthers = (related || []).filter((p) => String(p.id) !== String(id)).slice(0, 4);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await add(product.id, qty);
      setAdded(true);
      toast.success(`Added ${qty} × ${product.name} to your bag.`);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      toast.error(err.message || "Failed to add item.");
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    try {
      await add(product.id, qty);
      navigate("/checkout");
    } catch (err) {
      toast.error(err.message || "Could not proceed to checkout.");
    }
  }

  function handleWishlist() {
    toggleWishlist(product);
    toast(favorited ? `Removed from saved items` : `Added ${product.name} to saved items!`);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to write a review.");
      return;
    }
    setSubmittingReview(true);
    try {
      await ReviewApi.create(product.id, reviewRating, reviewComment.trim());
      toast.success("Thank you! Your review has been submitted.");
      setReviewComment("");
      reloadReviews();
    } catch (err) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="container pd-page">
      {/* Breadcrumbs */}
      <nav className="pd-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        {product.categoryName && (
          <>
            <Link to={`/category/${product.categoryId}`}>{product.categoryName}</Link>
            <span>/</span>
          </>
        )}
        <span className="pd-crumb-active">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="pd-showcase-grid">
        {/* Left: Interactive Image Gallery */}
        <div className="pd-gallery-section">
          <div className="pd-main-image-wrap">
            {currentImage ? (
              <img
                src={resolveImageUrl(currentImage)}
                alt={product.name}
                className="pd-main-img"
              />
            ) : (
              <div className="pd-media-fallback mono">No image available</div>
            )}

            {product.badge && (
              <span className="pd-badge badge badge-brand">{product.badge}</span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="pd-thumbnails">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`pd-thumb-btn ${activeImageIndex === idx ? "pd-thumb-active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={resolveImageUrl(img)} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Buy Box */}
        <div className="pd-info-section">
          {product.categoryName && (
            <Link to={`/category/${product.categoryId}`} className="eyebrow">
              {product.categoryName}
            </Link>
          )}

          <h1 className="pd-title">{product.name}</h1>

          {/* Rating Summary */}
          {typeof product.averageRating === "number" && product.averageRating > 0 && (
            <div className="pd-rating-summary">
              <StarRating value={product.averageRating} count={product.reviewsCount} size="md" />
              <span className="pd-rating-sep">•</span>
              <a href="#reviews" onClick={() => setActiveTab("reviews")} className="pd-review-jump">
                Read all reviews
              </a>
            </div>
          )}

          {/* Price Block */}
          <div className="pd-price-row">
            <span className="pd-price mono">{money(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="pd-orig-price mono">{money(product.originalPrice)}</span>
                <span className="badge badge-coral">
                  Save {money(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="pd-description">
            {product.description || "A curated everyday essential crafted with care, high quality materials, and transparent pricing."}
          </p>

          {/* Stock Urgency Indicator */}
          <div className="pd-stock-box">
            <span className={`pd-stock-indicator ${inStock ? "stock-in" : "stock-out"}`} />
            <span className="pd-stock-text">
              {inStock
                ? isLowStock
                  ? `⚡ Order soon — Only ${product.stock} items left in stock`
                  : `In Stock — Ready for immediate dispatch`
                : "Currently Out of Stock"}
            </span>
          </div>

          {/* Buy Controls */}
          {shoppingEnabled && (
            <div className="pd-buy-box">
              <div className="pd-actions-row">
                <QuantitySelector
                  value={qty}
                  onChange={setQty}
                  max={Math.max(1, product.stock)}
                  disabled={!inStock}
                  size="lg"
                />

                <button
                  type="button"
                  className={`btn btn-accent btn-lg pd-add-btn ${added ? "btn-success" : ""}`}
                  onClick={handleAddToCart}
                  disabled={!inStock || adding}
                >
                  {added ? (
                    <>
                      <CheckIcon size={20} />
                      <span>Added to Bag!</span>
                    </>
                  ) : adding ? (
                    "Adding…"
                  ) : (
                    <>
                      <CartIcon size={20} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`pd-heart-btn ${favorited ? "pd-heart-active" : ""}`}
                  onClick={handleWishlist}
                  aria-label="Wishlist"
                >
                  <HeartIcon size={22} filled={favorited} />
                </button>
              </div>

              {inStock && (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg pd-buy-now-btn"
                  onClick={handleBuyNow}
                >
                  <LockIcon size={18} />
                  <span>Buy Now — Instant Checkout</span>
                </button>
              )}
            </div>
          )}

          {/* Value Props Strip */}
          <div className="pd-perks-box card">
            <div className="pd-perk">
              <TruckIcon size={18} />
              <div>
                <strong>Free Express Shipping</strong>
                <p>On orders above $50. Arrives in 2-3 business days.</p>
              </div>
            </div>
            <div className="pd-perk">
              <ShieldCheckIcon size={18} />
              <div>
                <strong>30-Day Money Back Guarantee</strong>
                <p>Return in original condition for a full refund.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Specifications, Reviews, Shipping */}
      <section id="reviews" className="pd-tabs-section">
        <div className="pd-tabs-header">
          <button
            type="button"
            className={`pd-tab-btn ${activeTab === "specs" ? "pd-tab-active" : ""}`}
            onClick={() => setActiveTab("specs")}
          >
            Product Details & Specs
          </button>
          <button
            type="button"
            className={`pd-tab-btn ${activeTab === "reviews" ? "pd-tab-active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Customer Reviews ({reviews.length})
          </button>
          <button
            type="button"
            className={`pd-tab-btn ${activeTab === "shipping" ? "pd-tab-active" : ""}`}
            onClick={() => setActiveTab("shipping")}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="pd-tab-content card">
          {/* Specifications Tab */}
          {activeTab === "specs" && (
            <div className="pd-specs-tab">
              <h3>Technical Specifications</h3>
              {product.specs && Object.keys(product.specs).length > 0 ? (
                <table className="pd-specs-table">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val]) => (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "var(--text-secondary)" }}>
                  Crafted to highest manufacturing standards. Rigorously tested for durability, ergonomic comfort, and long-term utility.
                </p>
              )}
            </div>
          )}

          {/* Customer Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="pd-reviews-tab">
              <div className="pd-reviews-summary-bar">
                <div className="pd-reviews-score-box">
                  <strong className="pd-score-number mono">
                    {product.averageRating ? product.averageRating.toFixed(1) : "5.0"}
                  </strong>
                  <StarRating value={product.averageRating || 5} size="md" showScore={false} />
                  <span className="pd-score-sub">Based on {reviews.length} reviews</span>
                </div>

                {/* Write Review Form */}
                <form className="pd-review-form" onSubmit={handleSubmitReview}>
                  <h4>Leave a Review</h4>
                  <div className="pd-form-stars">
                    <label>Rating:</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="filter-select"
                    >
                      <option value={5}>★★★★★ (5 - Excellent)</option>
                      <option value={4}>★★★★☆ (4 - Very Good)</option>
                      <option value={3}>★★★☆☆ (3 - Average)</option>
                      <option value={2}>★★☆☆☆ (2 - Poor)</option>
                      <option value={1}>★☆☆☆☆ (1 - Terrible)</option>
                    </select>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Share your experience with this item…"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting…" : "Post Review"}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="pd-reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r.id} className="pd-review-card">
                      <div className="pd-review-head">
                        <StarRating value={r.rating} size="sm" showScore={false} />
                        <span className="pd-review-date mono">{shortDate(r.createdAt)}</span>
                      </div>
                      <div className="pd-review-author-row">
                        <strong>{r.userName}</strong>
                        <span className="badge badge-brand" style={{ fontSize: 10 }}>Verified Buyer</span>
                      </div>
                      {r.comment && <p className="pd-review-text">{r.comment}</p>}
                    </div>
                  ))
                ) : (
                  <p className="pd-no-reviews">
                    No reviews yet. Be the first shopper to share your thoughts!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === "shipping" && (
            <div className="pd-shipping-tab">
              <h3>Shipping & Returns Policy</h3>
              <ul className="pd-shipping-list">
                <li><strong>Fast Domestic Dispatch:</strong> Orders placed before 2 PM are dispatched the same business day.</li>
                <li><strong>Free Shipping:</strong> Automatically applied at checkout on all orders of $50 or more.</li>
                <li><strong>30-Day Hassle-Free Returns:</strong> Items can be returned within 30 days of delivery in original packaging for a full refund or exchange.</li>
                <li><strong>Insured Delivery:</strong> Every parcel is fully insured with door-to-door tracking.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Rail */}
      {relatedOthers.length > 0 && (
        <section className="pd-related-section">
          <div className="section-head">
            <div>
              <span className="eyebrow">You May Also Like</span>
              <h2>From the Same Stall</h2>
            </div>
          </div>
          <ProductGrid products={relatedOthers} cols={4} />
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
