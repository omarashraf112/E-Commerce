import { useState } from "react";
import { Link } from "react-router-dom";
import { StarRating } from "./StarRating";
import { QuickViewModal } from "./QuickViewModal";
import { money } from "@/utils/format";
import { resolveImageUrl } from "@/utils/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { HeartIcon, CartIcon, EyeIcon, CheckIcon } from "@/components/icons/Icons";
import "./productCard.css";

export function ProductCard({ product }) {
  const {
    id,
    name,
    price,
    originalPrice,
    imageUrl,
    stock,
    categoryName,
    categoryId,
    averageRating,
    reviewsCount,
    badge,
  } = product;

  const { add, shoppingEnabled } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();

  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const inStock = stock > 0;
  const isLowStock = inStock && stock <= 5;
  const favorited = isInWishlist(id);

  // Calculate discount percentage if original price exists
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  async function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    try {
      await add(id, 1);
      setAdded(true);
      toast.success(`Added ${name} to your bag!`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast.error(err.message || "Failed to add to bag.");
    } finally {
      setBusy(false);
    }
  }

  function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast(favorited ? `Removed from saved items` : `Added ${name} to saved items!`);
  }

  function handleQuickView(e) {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  }

  return (
    <>
      <div className="product-card">
        {/* Media Container */}
        <div className="product-card-media">
          <Link to={`/product/${id}`} className="product-card-img-link">
            {imageUrl ? (
              <img
                src={resolveImageUrl(imageUrl)}
                alt={name}
                loading="lazy"
                className="product-card-img"
              />
            ) : (
              <div className="product-card-fallback mono">No image</div>
            )}
          </Link>

          {/* Badges */}
          <div className="product-card-badges">
            {discountPercent ? (
              <span className="pbadge pbadge-discount">-{discountPercent}%</span>
            ) : badge ? (
              <span className="pbadge pbadge-accent">{badge}</span>
            ) : null}

            {isLowStock && (
              <span className="pbadge pbadge-urgent">Only {stock} left</span>
            )}
            {!inStock && (
              <span className="pbadge pbadge-soldout">Sold Out</span>
            )}
          </div>

          {/* Top-Right Wishlist Button */}
          <button
            type="button"
            className={`product-wishlist-btn ${favorited ? "product-wishlist-active" : ""}`}
            onClick={handleWishlist}
            aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartIcon size={18} filled={favorited} />
          </button>

          {/* Hover Overlay: Quick View Button */}
          <div className="product-card-overlay">
            <button
              type="button"
              className="product-quickview-btn"
              onClick={handleQuickView}
            >
              <EyeIcon size={16} />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="product-card-body">
          <div className="product-card-meta">
            {categoryName && (
              <Link
                to={`/category/${categoryId || ""}`}
                className="product-card-category"
              >
                {categoryName}
              </Link>
            )}
            {typeof averageRating === "number" && averageRating > 0 && (
              <StarRating value={averageRating} count={reviewsCount} size="sm" />
            )}
          </div>

          <h3 className="product-card-title">
            <Link to={`/product/${id}`}>{name}</Link>
          </h3>

          {/* Footer: Price & Add Button */}
          <div className="product-card-footer">
            <div className="product-card-pricing">
              <span className="product-card-price mono">{money(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="product-card-orig-price mono">
                  {money(originalPrice)}
                </span>
              )}
            </div>

            {shoppingEnabled && inStock && (
              <button
                type="button"
                className={`product-add-btn ${added ? "product-add-btn-done" : ""}`}
                onClick={handleAdd}
                disabled={busy}
                aria-label={`Add ${name} to cart`}
              >
                {added ? (
                  <CheckIcon size={16} />
                ) : busy ? (
                  <span className="product-add-spinner" />
                ) : (
                  <CartIcon size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
}
