import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchIcon, CloseIcon } from "@/components/icons/Icons";
import "./searchBar.css";

export function SearchBar({ compact, onSearchSubmit }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get("q") || "");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (onSearchSubmit) onSearchSubmit();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  function handleClear() {
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <form
      className={`searchbar ${compact ? "searchbar-compact" : ""} ${isFocused ? "searchbar-focused" : ""}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <span className="searchbar-icon" aria-hidden="true">
        <SearchIcon size={18} />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search tech, apparel, home essentials…"
        aria-label="Search products"
      />
      {value && (
        <button
          type="button"
          className="searchbar-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <CloseIcon size={15} />
        </button>
      )}
      <button type="submit" className="searchbar-btn" aria-label="Submit search">
        Search
      </button>
    </form>
  );
}
