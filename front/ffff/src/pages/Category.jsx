import { useState, useMemo } from "react";
import { useParams, useSearchParams, useOutletContext, Link } from "react-router-dom";
import { ProductApi } from "@/api/products";
import { useAsync } from "@/hooks/useAsync";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterPanel } from "@/components/FilterPanel";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { SparklesIcon, CloseIcon } from "@/components/icons/Icons";
import "./category.css";

export function Category() {
  const { categories = [] } = useOutletContext();
  const { id: categoryIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [filters, setFilters] = useState({
    categoryId: categoryIdParam || "",
    minPrice: "",
    maxPrice: "",
    sortBy: undefined,
    sortOrder: undefined,
  });

  const activeCategoryId = categoryIdParam || filters.categoryId;
  const category = categories.find((c) => String(c.id) === String(activeCategoryId));

  const { data: rawProducts, loading, error, reload } = useAsync(
    () => ProductApi.getAll({ ...filters, categoryId: activeCategoryId, search: q, pageSize: 24 }),
    [activeCategoryId, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortOrder, q]
  );

  const products = rawProducts || [];

  const title = useMemo(() => {
    if (q) return `Results for “${q}”`;
    if (category) return category.name;
    return "All Marketplace Products";
  }, [q, category]);

  const activeCategoryName = category ? category.name : null;

  return (
    <div className="container category-page">
      {/* Category Header */}
      <div className="category-header">
        <div className="category-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{activeCategoryName || "Catalog"}</span>
          {q && (
            <>
              <span>/</span>
              <span>Search: “{q}”</span>
            </>
          )}
        </div>

        <div className="category-title-row">
          <div>
            <h1 className="category-title">{title}</h1>
            {category?.description && (
              <p className="category-desc">{category.description}</p>
            )}
          </div>
          <div className="category-count-badge mono">
            {products.length} {products.length === 1 ? "product" : "products"}
          </div>
        </div>
      </div>

      {/* Filter Controls Panel */}
      <FilterPanel
        categories={categories}
        filters={{ ...filters, categoryId: activeCategoryId }}
        onChange={setFilters}
      />

      {/* Products Grid / States */}
      {loading && <LoadingState label="Sorting and filtering items" count={8} />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {!loading && !error && (
        products.length > 0 ? (
          <ProductGrid products={products} cols={4} />
        ) : (
          <EmptyState
            title="No products found"
            hint="Try broadening your search or clearing price filters."
            action={
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setFilters({ categoryId: "", minPrice: "", maxPrice: "" })}
              >
                Clear all filters
              </button>
            }
          />
        )
      )}
    </div>
  );
}

export default Category;
