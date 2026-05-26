export function normalizePrices(prices) {
  if (!prices) return {};
  if (typeof prices === "object" && !Array.isArray(prices)) {
    if (typeof prices.entries === "function") {
      return Object.fromEntries(prices.entries());
    }
    return { ...prices };
  }
  return {};
}

export function formatPrices(prices) {
  const obj = normalizePrices(prices);
  return Object.entries(obj)
    .map(([k, v]) => `${k}: GH¢${v}`)
    .join(" · ");
}

export function pricesToForm(prices) {
  const p = normalizePrices(prices);
  return {
    priceSmall: p.M ?? p["3 sticks (M)"] ?? "",
    priceLarge: p.L ?? p["6 sticks (L)"] ?? "",
    priceSingle:
      p.Regular ??
      p["3 sticks"] ??
      (Object.keys(p).length === 1 ? Object.values(p)[0] : ""),
  };
}
