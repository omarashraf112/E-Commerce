import { Link } from "react-router-dom";
import "./categoryLedger.css";

export function CategoryLedger({ categories }) {
  return (
    <ul className="ledger">
      {categories.map((c, i) => (
        <li key={c.id} className="ledger-row">
          <Link to={`/category/${c.id}`} className="ledger-link">
            <span className="ledger-index mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="ledger-name">{c.name}</span>
            <span className="ledger-arrow" aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
