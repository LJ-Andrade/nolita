import { GridTileImage } from "components/grid/tile";
import { getProducts } from "lib/vadmin";
import type { Product } from "lib/vadmin/types";
import Link from "next/link";

function ThreeItemGridItem({
  item,
  size,
  priority,
}: {
  item: Product;
  size: "full" | "half";
  priority?: boolean;
}) {
  const imageUrl = item.featuredImage?.url ?? item.images?.[0]?.url ?? '';

  return (
    <div
      className={
        size === "full"
          ? "md:col-span-4 md:row-span-2"
          : "md:col-span-2 md:row-span-1"
      }
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/producto/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={imageUrl}
          fill
          sizes={
            size === "full"
              ? "(min-width: 768px) 66vw, 100vw"
              : "(min-width: 768px) 33vw, 100vw"
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === "full" ? "center" : "bottom",
            title: item.title as string,
            amount: item.priceRange.maxVariantPrice.amount,
            currencyCode: item.priceRange.maxVariantPrice.currencyCode,
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  const homepageItems = await getProducts();

  if (!homepageItems?.length) return null;

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;

  // With 3+ products: original grid layout (1 large + 2 small)
  if (thirdProduct) {
    return (
      <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
        <ThreeItemGridItem size="full" item={firstProduct!} priority={true} />
        <ThreeItemGridItem size="half" item={secondProduct!} priority={true} />
        <ThreeItemGridItem size="half" item={thirdProduct!} />
      </section>
    );
  }

  // With 2 products: 2 equal columns
  if (secondProduct) {
    return (
      <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-2">
        <ThreeItemGridItem size="full" item={firstProduct!} priority={true} />
        <ThreeItemGridItem size="full" item={secondProduct!} priority={true} />
      </section>
    );
  }

  // With 1 product: full width
  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4">
      <ThreeItemGridItem size="full" item={firstProduct!} priority={true} />
    </section>
  );
}
