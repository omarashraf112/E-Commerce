import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@/components/icons/Icons";
import "./categoryCard.css";

export function CategoryCard({ category, index }) {
  const { id, name, imageUrl, itemCount, badge, description } = category;

  return (
    <Link to={`/category/${id}`} className="cat-card">
      <div className="cat-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" />
        ) : (
          <div className="cat-card-fallback" />
        )}
        <div className="cat-card-gradient" />
        {badge && <span className="cat-card-badge">{badge}</span>}
      </div>

      <div className="cat-card-content">
        <div className="cat-card-meta">
          <span className="cat-card-count mono">{itemCount ? `${itemCount}+ Items` : "Curated"}</span>
        </div>
        <h3 className="cat-card-title">{name}</h3>
        {description && <p className="cat-card-desc">{description}</p>}
        <div className="cat-card-action">
          <span>Explore stall</span>
          <ArrowRightIcon size={15} className="cat-card-arrow" />
        </div>
      </div>
    </Link>
  );
}
