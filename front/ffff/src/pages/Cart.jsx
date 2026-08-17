import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { CartLineItem } from "@/components/CartLineItem";
import { ReceiptSummary } from "@/components/ReceiptSummary";
import { LoadingState, EmptyState } from "@/components/States";
import { CartIcon, ArrowLeftIcon, TrashIcon } from "@/components/icons/Icons";
import "./cart.css";

export function Cart() {
  const { items, loading, total, count, clear } = useCart();

  if (loading) return <div className="container" style={{ padding: "50px 0" }}><LoadingState label="Counting your bag items" /></div>;

  if (!items.length) {
    return (
      <div className="container cart-page">
        <EmptyState
          icon={CartIcon}
          title="Your Shopping Bag is Empty"
          hint="Looks like you haven't added any curated goods to your bag yet."
          action={
            <Link to="/search" className="btn btn-primary btn-lg">
              Start Shopping →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="cart-header">
        <div>
          <h1 className="cart-title">Your Shopping Bag</h1>
          <p className="cart-subtitle">
            You have <strong className="mono">{count}</strong> {count === 1 ? "item" : "items"} ready for checkout.
          </p>
        </div>

        <button type="button" className="cart-clear-all-btn" onClick={clear}>
          <TrashIcon size={15} />
          <span>Empty Bag</span>
        </button>
      </div>

      <div className="cart-layout">
        {/* Left Column: Items */}
        <div className="cart-items-column">
          <div className="cart-items-list">
            {items.map((item) => (
              <CartLineItem key={item.id ?? item.productId} item={item} />
            ))}
          </div>

          <div className="cart-back-wrap">
            <Link to="/search" className="cart-back-link">
              <ArrowLeftIcon size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="cart-summary-column">
          <ReceiptSummary
            items={items}
            total={total}
            action={
              <Link to="/checkout" className="btn btn-primary btn-block btn-lg">
                Proceed to Checkout →
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Cart;
