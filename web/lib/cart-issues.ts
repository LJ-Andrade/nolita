import type { CheckoutIssue } from "lib/vadmin/types";

/**
 * Index availability issues by merchandise (variant) id so cart lines can look
 * up their own problem. VADMIN reports numeric ids; cart lines use strings.
 */
export function issuesByMerchandiseId(
  issues: CheckoutIssue[] | undefined,
): Map<string, CheckoutIssue> {
  const map = new Map<string, CheckoutIssue>();

  issues?.forEach((issue) => map.set(String(issue.variant_id), issue));

  return map;
}

/**
 * Short line-level text. The full message with product code and name is kept
 * for the toast; here the product is already visible next to the label.
 */
export function cartIssueText(issue: CheckoutIssue): string {
  switch (issue.reason) {
    case "out_of_stock":
      return "No hay stock de esta variante";
    case "insufficient_stock":
      return issue.available === 1
        ? "Solo queda 1 unidad disponible"
        : `Solo quedan ${issue.available} unidades disponibles`;
    default:
      return "Este producto ya no está disponible";
  }
}
