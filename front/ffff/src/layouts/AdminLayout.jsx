import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  SparklesIcon,
  GridIcon,
  CartIcon,
  UserIcon,
  ArrowLeftIcon,
} from "@/components/icons/Icons";
import "./adminLayout.css";

export function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();

  const links = isAdmin
    ? [
        { to: "/dashboard", label: "Overview", icon: GridIcon },
        { to: "/dashboard/categories", label: "Categories", icon: SparklesIcon },
        { to: "/dashboard/products", label: "Products", icon: CartIcon },
        { to: "/dashboard/orders", label: "Orders", icon: CartIcon },
        { to: "/dashboard/sellers", label: "Seller Requests", icon: UserIcon },
      ]
    : [{ to: "/dashboard/products", label: "My Products", icon: CartIcon }];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-side">
        <div className="admin-sidebar-top">
          <Link to="/" className="brand-logo admin-logo">
            <span className="brand-dot" />
            <span className="brand-text" style={{ color: "#fff" }}>Souqly</span>
            <span className="brand-tag">{isAdmin ? "Admin" : "Seller"}</span>
          </Link>
        </div>

        <nav className="admin-nav">
          {links.map(({ to, label, icon: IconComponent }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `admin-navlink ${isActive ? "admin-navlink-active" : ""}`
              }
            >
              <IconComponent size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-back-store">
            <ArrowLeftIcon size={16} />
            <span>Storefront</span>
          </Link>
          <button className="admin-signout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb-info">
            <span className="admin-role-pill badge badge-brand">
              {isAdmin ? "Administrator Portal" : "Merchant Dashboard"}
            </span>
          </div>

          <div className="admin-user-pill">
            <div className="admin-avatar">
              <UserIcon size={16} />
            </div>
            <span className="admin-username">{user?.fullName || "Admin User"}</span>
          </div>
        </header>

        <main className="admin-content page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
