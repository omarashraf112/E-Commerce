import { RefreshIcon, SparklesIcon } from "@/components/icons/Icons";
import "./states.css";

export function LoadingState({ label = "Loading", count = 4 }) {
  return (
    <div className="state-skeleton-wrapper" role="status" aria-live="polite">
      <div className="state-skeleton-header">
        <span className="state-spinner" aria-hidden="true" />
        <span className="state-loading-label">{label}…</span>
      </div>
      <div className="state-skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-media shimmer" />
            <div className="skeleton-body">
              <div className="skeleton-line shimmer" style={{ width: "40%", height: 12 }} />
              <div className="skeleton-line shimmer" style={{ width: "85%", height: 16 }} />
              <div className="skeleton-line shimmer" style={{ width: "60%", height: 14 }} />
              <div className="skeleton-footer">
                <div className="skeleton-line shimmer" style={{ width: "35%", height: 20 }} />
                <div className="skeleton-circle shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint, action, icon: Icon = SparklesIcon }) {
  return (
    <div className="state-card state-empty card">
      <div className="state-icon-circle">
        <Icon size={28} />
      </div>
      <h3 className="state-title">{title}</h3>
      {hint && <p className="state-hint">{hint}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="state-card state-error card">
      <span className="eyebrow" style={{ color: "var(--coral)" }}>Attention</span>
      <h3 className="state-title">Unable to load data</h3>
      <p className="state-hint">{message}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          <RefreshIcon size={15} />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}
