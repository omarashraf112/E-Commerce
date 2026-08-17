import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useAsync } from "@/hooks/useAsync";
import { ProductApi } from "@/api/products";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryCard } from "@/components/CategoryCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import {
  SparklesIcon,
  ZapIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  CheckIcon,
} from "@/components/icons/Icons";
import { MOCK_TESTIMONIALS } from "@/data/mockStoreData";
import "./home.css";

export function Home() {
  const { categories = [] } = useOutletContext();
  const [activeTab, setActiveTab] = useState("all");
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 28, seconds: 15 });

  const { data: allProducts, loading, error, reload } = useAsync(
    () => ProductApi.getAll({ pageSize: 16 }),
    []
  );

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const products = allProducts || [];
  const flashSaleProducts = products.filter((p) => p.isFlashSale || p.originalPrice).slice(0, 4);

  // Tabbed filtering for trending section
  const filteredProducts = activeTab === "all"
    ? products.slice(0, 8)
    : products.filter((p) => String(p.categoryId) === String(activeTab)).slice(0, 8);

  const heroSpotlight = products[0] || null;

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container home-hero-grid">
          {/* Copy Column */}
          <div className="hero-copy">
            <div className="hero-eyebrow-pill">
              <SparklesIcon size={15} />
              <span>The Modern Everyday Marketplace</span>
            </div>

            <h1 className="hero-headline">
              Curated goods.
              <br />
              <span className="hero-highlight">Honest value.</span>
              <br />
              Delivered fast.
            </h1>

            <p className="hero-subtext">
              Discover handpicked lifestyle tech, minimalist home essentials, and timeless apparel — priced transparently and shipped directly to your door.
            </p>

            <div className="hero-cta-group">
              <Link to="/search" className="btn btn-primary btn-lg">
                <span>Explore Catalog</span>
                <ArrowRightIcon size={18} />
              </Link>
              <a href="#flash-deals" className="btn btn-outline btn-lg">
                <ZapIcon size={18} style={{ color: "var(--coral)" }} />
                <span>Today's Deals</span>
              </a>
            </div>

            {/* Hero Stats */}
            <div className="hero-stats">
              <div className="hero-stat-item">
                <strong className="mono">25k+</strong>
                <span>Happy Shoppers</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-item">
                <strong className="mono">4.9 ★</strong>
                <span>Average Rating</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-item">
                <strong className="mono">100%</strong>
                <span>Authentic Goods</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Spotlight */}
          <div className="hero-spotlight">
            <div className="spotlight-card card">
              <div className="spotlight-badge-wrap">
                <span className="badge badge-brand">✨ Featured Drop</span>
                <span className="badge badge-coral">Save $60</span>
              </div>

              {heroSpotlight && (
                <Link to={`/product/${heroSpotlight.id}`} className="spotlight-media">
                  <img
                    src={heroSpotlight.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"}
                    alt={heroSpotlight.name}
                    className="spotlight-img"
                  />
                </Link>
              )}

              <div className="spotlight-info">
                <span className="eyebrow">{heroSpotlight?.categoryName || "Tech & Audio"}</span>
                <h3 className="spotlight-title">
                  <Link to={`/product/${heroSpotlight?.id || 101}`}>
                    {heroSpotlight?.name || "Acoustic Aura ANC Wireless Headphones"}
                  </Link>
                </h3>
                <div className="spotlight-rating">
                  <StarIcon size={15} filled className="star-filled" />
                  <span className="mono">4.9</span>
                  <span className="spotlight-rating-count">(142 verified reviews)</span>
                </div>
                <div className="spotlight-bottom">
                  <div className="spotlight-pricing">
                    <span className="spotlight-price mono">${heroSpotlight?.price || 189}</span>
                    <span className="spotlight-orig mono">$249</span>
                  </div>
                  <Link to={`/product/${heroSpotlight?.id || 101}`} className="btn btn-accent btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Value Bar */}
      <section className="home-trust-bar container">
        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-icon-box"><TruckIcon size={22} /></div>
            <div>
              <h4>Free Express Delivery</h4>
              <p>On domestic orders over $50 with real-time tracking</p>
            </div>
          </div>
          <div className="trust-card">
            <div className="trust-icon-box"><ShieldCheckIcon size={22} /></div>
            <div>
              <h4>100% Buyer Protection</h4>
              <p>30-day money-back guarantee on all marketplace items</p>
            </div>
          </div>
          <div className="trust-card">
            <div className="trust-icon-box"><SparklesIcon size={22} /></div>
            <div>
              <h4>Curated Quality</h4>
              <p>Every product is handpicked and verified by our team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Exploration Showcase */}
      <section className="home-categories container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Explore Stalls</span>
            <h2>Curated Collections</h2>
          </div>
          <Link to="/search" className="section-more-link">
            <span>Browse all categories</span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>

        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <CategoryCard key={cat.id} category={cat} index={idx} />
          ))}
        </div>
      </section>

      {/* Flash Sale Banner & Rail */}
      <section id="flash-deals" className="home-flash-deals container">
        <div className="flash-banner card">
          <div className="flash-header">
            <div className="flash-title-wrap">
              <span className="flash-badge">
                <ZapIcon size={16} /> Flash Sale
              </span>
              <h2>Limited-Time Deals</h2>
              <p>Grab handpicked essentials at exclusive discount prices before stock runs out.</p>
            </div>

            {/* Countdown Clock */}
            <div className="flash-timer-box">
              <span className="flash-timer-label">Ending In</span>
              <div className="flash-timer-digits mono">
                <div className="timer-unit">
                  <span>{String(countdown.hours).padStart(2, "0")}</span>
                  <small>Hours</small>
                </div>
                <span className="timer-sep">:</span>
                <div className="timer-unit">
                  <span>{String(countdown.minutes).padStart(2, "0")}</span>
                  <small>Mins</small>
                </div>
                <span className="timer-sep">:</span>
                <div className="timer-unit">
                  <span>{String(countdown.seconds).padStart(2, "0")}</span>
                  <small>Secs</small>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Products */}
          <div className="flash-products-grid">
            {flashSaleProducts.map((p) => (
              <div key={p.id} className="flash-product-wrapper">
                <ProductGrid products={[p]} cols={1} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products & Tabbed Filter Section */}
      <section className="home-trending container">
        <div className="section-head-with-tabs">
          <div>
            <span className="eyebrow">Fresh & Trending</span>
            <h2>Popular Right Now</h2>
          </div>

          <div className="trending-tabs">
            <button
              type="button"
              className={`trending-tab ${activeTab === "all" ? "trending-tab-active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Items
            </button>
            {categories.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`trending-tab ${activeTab === String(c.id) ? "trending-tab-active" : ""}`}
                onClick={() => setActiveTab(String(c.id))}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingState label="Weighing today's stock" />}
        {error && <ErrorState message={error.message} onRetry={reload} />}
        {!loading && !error && (
          filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} cols={4} />
          ) : (
            <EmptyState
              title="Nothing on the shelf yet"
              hint="Check back soon for fresh arrivals in this stall."
            />
          )
        )}
      </section>

      {/* Editorial Promo Banner */}
      <section className="home-promo-banner container">
        <div className="editorial-card">
          <div className="editorial-content">
            <span className="badge badge-brand">Curator's Pick</span>
            <h2>Elevate Your Everyday Essentials</h2>
            <p>
              Crafted from premium sustainable materials, engineered for functional longevity, and styled with effortless elegance.
            </p>
            <div className="editorial-perks-list">
              <div><CheckIcon size={16} /> Single-origin roasts & handcrafted ceramics</div>
              <div><CheckIcon size={16} /> Planar driver acoustic gear & workspace lamps</div>
              <div><CheckIcon size={16} /> 100% GOTS certified organic heavyweight cotton</div>
            </div>
            <Link to="/search" className="btn btn-primary btn-lg" style={{ marginTop: 12 }}>
              Shop the Editorial Collection →
            </Link>
          </div>
          <div className="editorial-media">
            <img
              src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80"
              alt="Editorial lifestyle collection"
            />
          </div>
        </div>
      </section>

      {/* Shopper Testimonials */}
      <section className="home-testimonials container">
        <div className="section-head text-center" style={{ marginBottom: 36 }}>
          <span className="eyebrow">Real Experiences</span>
          <h2>Loved by Modern Shoppers</h2>
        </div>

        <div className="testimonials-grid">
          {MOCK_TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="testimonial-card card">
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon key={s} size={15} filled className="star-filled" />
                ))}
              </div>
              <p className="testimonial-quote">“{t.quote}”</p>
              <div className="testimonial-author">
                <img src={t.avatar} alt={t.author} className="testimonial-avatar" />
                <div>
                  <h4 className="testimonial-name">{t.author}</h4>
                  <span className="testimonial-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
