import { ProductCard } from "./ProductCard";
import "./productGrid.css";

export function ProductGrid({ products = [], layout = "grid", cols = 4 }) {
  return (
    <div className={`product-grid product-grid-cols-${cols} ${layout === "list" ? "product-grid-list" : ""}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
