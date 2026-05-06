import { ActiveFilters } from "components/catalog/active-filters";
import { FilterSidebar } from "components/catalog/filter-sidebar";
import { ProductGrid } from "components/catalog/product-grid";
import { SortBar } from "components/catalog/sort-bar";
import { getCollections, getProducts } from "lib/vadmin";
import { getFavorites } from "lib/vadmin/favorites";
import { getSession } from "lib/vadmin/auth";
import type { Product } from "lib/vadmin/types";
import { Suspense } from "react";

type SearchParams = {
  category?: string;
  size?: string | string[];
  sort?: string;
  q?: string;
};

function sortProducts(products: Product[], sort: string): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price_asc":
      return copy.sort(
        (a, b) =>
          parseFloat(a.priceRange.minVariantPrice.amount) -
          parseFloat(b.priceRange.minVariantPrice.amount)
      );
    case "price_desc":
      return copy.sort(
        (a, b) =>
          parseFloat(b.priceRange.minVariantPrice.amount) -
          parseFloat(a.priceRange.minVariantPrice.amount)
      );
    case "name_asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }
}

function filterProducts(
  products: Product[],
  sizes: string[]
): Product[] {
  let result = products;

  if (sizes.length > 0) {
    result = result.filter((p) =>
      p.options
        .find((o) => o.name === "Talle")
        ?.values.some((v) => sizes.includes(v))
    );
  }

  return result;
}

export default async function CatalogPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;

  const category = searchParams.category;
  const sizes = searchParams.size
    ? Array.isArray(searchParams.size)
      ? searchParams.size
      : [searchParams.size]
    : [];
  const sort = searchParams.sort ?? "newest";
  const query = searchParams.q;

  const [allProducts, collections, session] = await Promise.all([
    getProducts({ category, query }),
    getCollections(),
    getSession(),
  ]);

  const favorites = session ? await getFavorites() : [];
  const favoriteIds = new Set(favorites.map((p) => p.id));
  const isAuthenticated = !!session;

  const allSizes = Array.from(
    new Set(
      allProducts.flatMap(
        (p) => p.options.find((o) => o.name === "Talle")?.values ?? []
      )
    )
  );

  const filtered = filterProducts(allProducts, sizes);
  const sorted = sortProducts(filtered, sort);
  const sidebarCategories = collections.filter((c) => c.handle !== "");

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 lg:px-8">
      <div className="flex gap-10 lg:gap-16">
        <div
          className="hidden w-56 shrink-0 lg:block"
          style={{ borderRight: "1px solid var(--pb-border)" }}
        >
          <Suspense fallback={null}>
            <FilterSidebar categories={sidebarCategories} sizes={allSizes} />
          </Suspense>
        </div>

        <div className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <SortBar total={sorted.length} />
            <ActiveFilters />
          </Suspense>
          <div className="mt-6">
            <ProductGrid products={sorted} favoriteIds={favoriteIds} isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>
    </div>
  );
}
