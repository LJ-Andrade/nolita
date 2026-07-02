export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE";
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: "Relevance",
  slug: null,
  sortKey: "RELEVANCE",
  reverse: false,
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: "Trending",
    slug: "trending-desc",
    sortKey: "BEST_SELLING",
    reverse: false,
  }, // asc
  {
    title: "Latest arrivals",
    slug: "latest-desc",
    sortKey: "CREATED_AT",
    reverse: true,
  },
  {
    title: "Price: Low to high",
    slug: "price-asc",
    sortKey: "PRICE",
    reverse: false,
  }, // asc
  {
    title: "Price: High to low",
    slug: "price-desc",
    sortKey: "PRICE",
    reverse: true,
  },
];

export const TAGS = {
  collections: "collections",
  products: "products",
  siteContent: "site-content",
  shopConfiguration: "shop-configuration",
  checkoutMethods: "checkout-methods",
  cart: "cart",
  newsletter: "newsletter",
};

export const HIDDEN_PRODUCT_TAG = "vadmin-hidden";
export const DEFAULT_OPTION = "Default";
export const SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2023-01/graphql.json";

export const COLOR_MAP: Record<string, string> = {
  beige: "#D4B896",
  negro: "#1A1A1A",
  blanco: "#F5F5F0",
  gris: "#9E9E9E",
  azul: "#4A6FA5",
  rojo: "#B94040",
  verde: "#4A7A5A",
  marron: "#8B6C5C",
  rosa: "#D4A0A0",
  crema: "#F0E8D8",
};
