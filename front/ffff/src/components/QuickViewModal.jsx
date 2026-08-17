import { useState } from "react";
import { Link } from "react-router-dom";
import { StarRating } from "./StarRating";
import { QuantitySelector } from "./QuantitySelector";
import { money } from "@/utils/format";
import { resolveImageUrl } from "@/utils/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { CloseIcon, HeartIcon, CartIcon, CheckIcon, TruckIcon, ShieldCheckIcon } from "@/components/icons/Icons";
import "./quickViewModal.css";

export function QuickViewModal({ product, onClose }) {
  const { id, name, price, originalPrice, imageUrl, stock, categoryName, categoryId, averageRating, reviewsCount, description, specs } = product;
  const { add, shoppingEnabled } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const inStock = stock > 0;
  const favorited = isInWishlist(id);

  async function handleAdd() {
    setBusy(true);
    try {
      await add(id, qty);
      setAdded(true);
      toast.success(`Added ${qty} × ${name} to bag.`);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      toast.error(err.message || "Failed to add item.");
    } finally {
      setBusy(false);
    }
  }

  function handleWishlist() {
    toggleWishlist(product);
    toast(favorited ? `Removed ${name} from saved items` : `Added ${name} to saved items!`);
  }

  return (
    <div className="quickview-backdrop" onClick={onClose}>
      <div className="quickview-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="quickview-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={20} />
        </button>

        <div className="quickview-grid">
          {/* Media Column */}
          <div className="quickview-media">
            {imageUrl ? (
              <img src={resolveImageUrl(imageUrl)} alt={name} />
            ) : (
              <div className="quickview-fallback">No image available</div>
            )}
            <span className={`quickview-stock-pill ${inStock ? "in-stock" : "out-stock"}`}>
              {inStock ? `In Stock (${stock} left)` : "Sold Out"}
            </span>
          </div>

          {/* Details Column */}
          <div className="quickview-details">
            <div className="quickview-header">
              {categoryName && (
                <Link to={`/category/${categoryId}`} className="eyebrow" onClick={onClose}>
                  {categoryName}
                </Link>
              )}
              <h2 className="quickview-title">{name}</h2>

              {typeof averageRating === "number" && averageRating > 0 && (
                <div className="quickview-rating">
                  <StarRating value={averageRating} count={reviewsCount} />
                </div>
              )}
            </div>

            {/* Price Block */}
            <div className="quickview-price-block">
              <span className="quickview-price mono">{money(price)}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="quickview-orig-price mono">{money(originalPrice)}</span>
                  <span className="badge badge-coral">
                    Save {money(originalPrice - price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="quickview-desc">{description || "Curated premium essential crafted for everyday excellence."}</p>

            {/* Specs Quick List */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="quickview-specs">
                {Object.entries(specs).slice(0, 3).map(([key, val]) => (
                  <div key={key} className="quickview-spec-row">
                    <span className="quickview-spec-key">{key}:</span>
                    <span className="quickview-spec-val">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar */}
            {shoppingEnabled && (
              <div className="quickview-actions">
                <div className="quickview-qty-wrap">
                  <QuantitySelector
                    value={qty}
                    onChange={setQty}
                    max={Math.max(1, stock)}
                    disabled={!inStock}
                  />
                </div>

                <button
                  className={`btn btn-accent quickview-add-btn ${added ? "btn-success" : ""}`}
                  onClick={handleAdd}
                  disabled={!inStock || busy}
                >
                  {added ? (
                    <>
                      <CheckIcon size={18} />
                      <span>Added to Bag!</span>
                    </>
                  ) : busy ? (
                    "Adding…"
                  ) : (
                    <>
                      <CartIcon size={18} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  className={`quickview-heart-btn ${favorited ? "quickview-heart-active" : ""}`}
                  onClick={handleWishlist}
                  aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartIcon size={20} filled={favorited} />
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="quickview-perks">
              <div className="quickview-perk">
                <TruckIcon size={16} />
                <span>Free shipping over $50</span>
              </div>
              <div className="quickview-perk">
                <ShieldCheckIcon size={16} />
                <span>30-day money-back guarantee</span>
              </div>
            </div>

            <div className="quickview-footer">
              <Link to={`/product/${id}`} className="quickview-view-full" onClick={onClose}>
                View full product page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
