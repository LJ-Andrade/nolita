import { HomeProductSection } from "components/home/product-section";
import { ProductDescription } from "components/product/product-description";
import { ProductMedia } from "components/product/product-media";
import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import { getProduct, getProducts } from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import { getFavorites } from "lib/vadmin/favorites";
import type { Image } from "lib/vadmin/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const [product, session] = await Promise.all([
    getProduct(params.handle),
    getSession(),
  ]);

  if (!product) return notFound();
  const isAuthenticated = Boolean(session);
  const [favorites, relatedProducts] = await Promise.all([
    session ? getFavorites() : Promise.resolve([]),
    getRelatedProducts(product.id, product.category?.handle),
  ]);
  const favoriteIds = new Set(favorites.map((favorite) => favorite.id));

  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage.url,
  };

  if (isAuthenticated) {
    productJsonLd.offers = {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="bg-white">
        <div className="mx-auto max-w-[1500px] px-0 pb-12 md:px-8 md:pt-3 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_470px]">
            <div className="min-w-0">
              <ProductMedia
                title={product.title}
                images={[
                  ...product.images.map((image: Image) => ({
                    src: image.url,
                    altText: image.altText,
                  })),
                  ...(product.colorImages || [])
                    .filter(
                      (ci) => !product.images.some((img) => img.url === ci.url),
                    )
                    .map((ci) => ({
                      src: ci.url,
                      altText: ci.color,
                    })),
                ]}
              />
            </div>

            <div className="px-5 md:px-0">
              <div className="lg:sticky lg:top-28 lg:pt-12">
                <ProductDescription
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>
        </div>
        <HomeProductSection
          products={relatedProducts}
          favoriteIds={favoriteIds}
          isAuthenticated={isAuthenticated}
          title="Productos relacionados"
        />
      </div>
    </>
  );
}

async function getRelatedProducts(productId: string, categoryHandle?: string) {
  const [categoryProducts, allProducts] = await Promise.all([
    categoryHandle
      ? getProducts({ category: categoryHandle })
      : Promise.resolve([]),
    getProducts(),
  ]);

  const shuffledCategoryProducts = shuffleProducts(
    categoryProducts.filter((product) => product.id !== productId),
    `${productId}:category`,
  );
  const selectedProducts = shuffledCategoryProducts.slice(0, 4);

  if (selectedProducts.length >= 4) {
    return selectedProducts;
  }

  const selectedIds = new Set([
    productId,
    ...selectedProducts.map((product) => product.id),
  ]);
  const fallbackProducts = shuffleProducts(
    allProducts.filter((product) => !selectedIds.has(product.id)),
    `${productId}:fallback`,
  );

  return [...selectedProducts, ...fallbackProducts].slice(0, 4);
}

function shuffleProducts<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  let hash = Array.from(seed).reduce(
    (value, char) => value + char.charCodeAt(0),
    0,
  );

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    hash = (hash * 9301 + 49297) % 233280;
    const randomIndex = hash % (index + 1);
    const current = shuffled[index]!;
    shuffled[index] = shuffled[randomIndex]!;
    shuffled[randomIndex] = current;
  }

  return shuffled;
}
