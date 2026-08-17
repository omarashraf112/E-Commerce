import { FilterIcon, CloseIcon } from "@/components/icons/Icons";
import "./filterPanel.css";

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under $50", min: "0", max: "50" },
  { label: "$50 to $100", min: "50", max: "100" },
  { label: "$100 to $200", min: "100", max: "200" },
  { label: "$200+", min: "200", max: "" },
];

export function FilterPanel({ categories = [], filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function handlePresetPrice(preset) {
    onChange({
      ...filters,
      minPrice: preset.min,
      maxPrice: preset.max,
    });
  }

  function handleReset() {
    onChange({
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      sortBy: undefined,
      sortOrder: undefined,
    });
  }

  const hasActiveFilters =
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sortBy;

  return (
    <div className="filter-panel card">
      <div className="filter-header">
        <div className="filter-header-title">
          <FilterIcon size={18} />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button type="button" className="filter-reset-btn" onClick={handleReset}>
            Reset all
          </button>
        )}
      </div>

      <div className="filter-sections">
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Categories</label>
          <div className="filter-chips">
            <button
              type="button"
              className={`filter-chip ${!filters.categoryId ? "filter-chip-active" : ""}`}
              onClick={() => set("categoryId", "")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`filter-chip ${String(filters.categoryId) === String(c.id) ? "filter-chip-active" : ""}`}
                onClick={() => set("categoryId", c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Presets */}
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <div className="filter-price-presets">
            {PRICE_PRESETS.map((p, idx) => {
              const isActive =
                String(filters.minPrice || "") === p.min &&
                String(filters.maxPrice || "") === p.max;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`filter-price-preset ${isActive ? "filter-price-preset-active" : ""}`}
                  onClick={() => handlePresetPrice(p)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="filter-price-inputs">
            <div className="filter-input-wrap">
              <span className="filter-currency">$</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) => set("minPrice", e.target.value)}
              />
            </div>
            <span className="filter-price-dash">–</span>
            <div className="filter-input-wrap">
              <span className="filter-currency">$</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) => set("maxPrice", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sort Order */}
        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <select
            className="filter-select"
            value={`${filters.sortBy || ""}-${filters.sortOrder || ""}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              onChange({
                ...filters,
                sortBy: sortBy || undefined,
                sortOrder: sortOrder || undefined,
              });
            }}
          >
            <option value="-">✨ Featured & Trending</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Highest Customer Rating</option>
            <option value="name-asc">Alphabetical: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
