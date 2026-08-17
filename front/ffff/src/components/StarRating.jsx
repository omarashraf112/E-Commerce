import { StarIcon } from "@/components/icons/Icons";
import "./starRating.css";

export function StarRating({ value = 0, count, size = "md", showScore = true }) {
  const numValue = Number(value) || 0;
  const clamped = Math.max(0, Math.min(5, numValue));

  return (
    <div className={`star-rating star-rating-${size}`}>
      <div className="star-rating-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={size === "sm" ? 13 : size === "lg" ? 18 : 15}
            filled={star <= Math.round(clamped)}
            className={star <= Math.round(clamped) ? "star-filled" : "star-empty"}
          />
        ))}
      </div>
      {showScore && <span className="star-rating-score mono">{clamped.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="star-rating-count">({count})</span>
      )}
      <span className="visually-hidden">{clamped.toFixed(1)} out of 5 stars</span>
    </div>
  );
}
