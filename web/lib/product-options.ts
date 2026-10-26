import type { ProductOption } from "lib/vadmin/types";

export function getProductOptionParams(
  options: ProductOption[],
  searchParams: { toString(): string },
) {
  const params = new URLSearchParams(searchParams.toString());

  for (const option of options) {
    const name = option.name.toLowerCase();
    const value = option.values[0];

    if (!params.has(name) && option.values.length === 1 && value) {
      params.set(name, value);
    }
  }

  return params;
}
