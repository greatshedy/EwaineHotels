export const NAIRA = "\u20A6";

export function formatNaira(value) {
  const n = Number(value) || 0;
  return NAIRA + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}
