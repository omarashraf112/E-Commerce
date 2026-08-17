export function money(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `EGP ${n.toFixed(2)}`;
}

export function shortDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function longDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
