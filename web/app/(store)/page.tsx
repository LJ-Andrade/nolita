import { ActiveFilters } from "components/catalog/active-filters";
import { CatalogFilterAction } from "components/catalog/catalog-filter-action";
import { EditorialFilterControls } from "components/catalog/editorial-filter-controls";
import { ProductCount } from "components/catalog/product-count";
import { ProductGrid } from "components/catalog/product-grid";
import { AnnouncementBarClient } from "components/layout/announcement-bar-client";
import {
  getCollections,
  getProducts,
  getSiteContent,
  getVadminImageUrl,
} from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import { getFavorites } from "lib/vadmin/favorites";
import type { Product } from "lib/vadmin/types";
import { COLOR_MAP } from "lib/constants";
import { Suspense } from "react";

export const metadata = {
  title: "Nolita — Moda Mayorista",
  description: "Descubrí la nueva colección de Nolita. Envíos a todo el país.",
  openGraph: { type: "website" },
};

type SearchParams = {
  category?: string;
  categoria?: string;
  color?: string | string[];
  size?: string | string[];
  sort?: string;
};

function sortProducts(products: Product[], sort: string): Product[] {
  const copy = [...products];

  switch (sort) {
    case "featured": {
      const withDiscount = copy.filter(
        (p) => (p.discount ?? 0) > 0 || p.hasDiscount,
      );
      const withoutDiscount = copy.filter(
        (p) => (p.discount ?? 0) === 0 && !p.hasDiscount,
      );
      const sortByDate = (a: Product, b: Product) =>
        new Date(b.createdAt || b.updatedAt).getTime() -
        new Date(a.createdAt || a.updatedAt).getTime();
      return [
        ...withDiscount.sort(sortByDate),
        ...withoutDiscount.sort(sortByDate),
      ];
    }
    case "price_asc":
      return copy.sort(
        (a, b) =>
          parseFloat(a.priceRange.minVariantPrice.amount) -
          parseFloat(b.priceRange.minVariantPrice.amount),
      );
    case "price_desc":
      return copy.sort(
        (a, b) =>
          parseFloat(b.priceRange.minVariantPrice.amount) -
          parseFloat(a.priceRange.minVariantPrice.amount),
      );
    case "discount_desc": {
      const withDiscount = copy.filter(
        (p) => (p.discount ?? 0) > 0 || p.hasDiscount,
      );
      return withDiscount.sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt).getTime() -
          new Date(a.createdAt || a.updatedAt).getTime(),
      );
    }
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }
}

function filterProducts(
  products: Product[],
  sizes: string[],
  colors: string[],
): Product[] {
  if (sizes.length === 0 && colors.length === 0) {
    return products;
  }

  return products.filter((product) => {
    const hasSize =
      sizes.length === 0 ||
      product.variants.some(
        (variant) =>
          variant.availableForSale &&
          variant.selectedOptions.some(
            (option) => option.name === "Talle" && sizes.includes(option.value),
          ),
      );
    const hasColor =
      colors.length === 0 ||
      product.variants.some(
        (variant) =>
          variant.availableForSale &&
          variant.selectedOptions.some(
            (option) =>
              option.name.toLowerCase() === "color" &&
              colors.includes(option.value),
          ),
      );

    return hasSize && hasColor;
  });
}

function hasAvailableVariant(product: Product) {
  return product.variants.some((variant) => variant.availableForSale);
}

function getAvailableProductSizes(products: Product[]) {
  const sizes = new Set<string>();

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      if (!variant.availableForSale) {
        return;
      }

      const size = variant.selectedOptions.find(
        (option) => option.name === "Talle",
      )?.value;

      if (size) {
        sizes.add(size);
      }
    });
  });

  return Array.from(sizes);
}

function getAvailableProductColors(products: Product[]) {
  const colors = new Map<string, string | undefined>();

  products.forEach((product) => {
    const colorOption = product.options.find(
      (option) => option.name.toLowerCase() === "color",
    );

    product.variants.forEach((variant) => {
      if (!variant.availableForSale) {
        return;
      }

      const color = variant.selectedOptions.find(
        (option) => option.name.toLowerCase() === "color",
      )?.value;

      if (!color || colors.has(color)) {
        return;
      }

      const optionIndex = colorOption?.values.findIndex(
        (value) => value.toLowerCase() === color.toLowerCase(),
      );
      const optionHex =
        optionIndex !== undefined && optionIndex >= 0
          ? colorOption?.hexValues?.[optionIndex]
          : undefined;
      const imageHex = product.colorImages?.find(
        (image) => image.color.toLowerCase() === color.toLowerCase(),
      )?.hex;

      colors.set(
        color,
        imageHex ?? optionHex ?? COLOR_MAP[color.toLowerCase()],
      );
    });
  });

  return Array.from(colors, ([name, hex]) => ({ name, hex }));
}

export default async function HomePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.categoria ?? searchParams.category;
  const sizes = searchParams.size
    ? Array.isArray(searchParams.size)
      ? searchParams.size
      : [searchParams.size]
    : [];
  const colors = searchParams.color
    ? Array.isArray(searchParams.color)
      ? searchParams.color
      : [searchParams.color]
    : [];
  const sort = searchParams.sort ?? "featured";
  const [products, collections, content, session, categoryFilterProducts] =
    await Promise.all([
      getProducts({ category }),
      getCollections(),
      getSiteContent("home"),
      getSession(),
      category ? getProducts() : Promise.resolve(null),
    ]);

  const favorites = session ? await getFavorites() : [];
  const favoriteIds = new Set(favorites.map((product) => product.id));
  const allSizes = getAvailableProductSizes(products);
  const allColors = getAvailableProductColors(products);
  const filteredProducts = filterProducts(products, sizes, colors);
  const sortedProducts = sortProducts(filteredProducts, sort);
  const categoryProductHandles = new Set(
    (categoryFilterProducts ?? products)
      .filter(hasAvailableVariant)
      .map((product) => product.category?.handle)
      .filter(Boolean),
  );
  const filterCategories = collections.filter(
    (collection) =>
      collection.handle && categoryProductHandles.has(collection.handle),
  );
  const allFilterCategories = collections.filter(
    (collection) => collection.handle,
  );
  const heroImage = getVadminImageUrl(
    content.home_hero_banner || "/storage/web/hero_1.jpg",
  );
  const heroMobileImage = getVadminImageUrl(
    content.home_hero_banner_mobile ||
      content.home_hero_banner ||
      "/storage/web/hero_1.jpg",
  );
  return (
    <>
      {/* ── Announcement Bar ─────────────────────────────────────────── */}
      <AnnouncementBarClient
        retailText={content.home_top_text_retail}
        wholesaleText={content.home_top_text_wholesale}
        fallbackText={content.home_top_text}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-76px)] overflow-hidden bg-[#eee8e3]">
        {/* Hero background */}
        {heroImage || heroMobileImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 md:hidden"
              style={{
                backgroundImage: `url(${heroMobileImage || heroImage})`,
              }}
            />
            <div
              className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat transition-opacity duration-1000 md:block"
              style={{
                backgroundImage: `url(${heroImage || heroMobileImage})`,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(120deg, #d7cbc3 0%, #f8f1ec 100%)",
            }}
          />
        )}
      </section>

      <Suspense fallback={null}>
        <EditorialFilterControls
          categories={allFilterCategories}
          colors={allColors}
          sizes={allSizes}
          total={sortedProducts.length}
          showAllCategoryNav={true}
        />
      </Suspense>

      <section className="bg-white px-4 pb-40 pt-10 lg:px-8 lg:pb-48 lg:pt-14">
        <div className="mx-auto max-w-screen-2xl">
          <div className="sticky top-[64px] z-30 mb-6 flex flex-wrap items-center justify-between gap-3 border-b bg-white/90 py-3 backdrop-blur-md md:top-[76px]">
            <ProductCount products={sortedProducts} />
            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <Suspense fallback={null}>
                <ActiveFilters categories={filterCategories} />
              </Suspense>
              <Suspense fallback={null}>
                <CatalogFilterAction />
              </Suspense>
            </div>
          </div>
          <ProductGrid
            products={sortedProducts}
            favoriteIds={favoriteIds}
            isAuthenticated={Boolean(session)}
            showColors={true}
          />
        </div>
      </section>
    </>
  );
}
