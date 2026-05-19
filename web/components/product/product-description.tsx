import { AddToCart } from "components/cart/add-to-cart";
import Prose from "components/prose";
import { Product } from "lib/vadmin/types";
import { ProductPrice } from "./product-price";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({
  product,
  isAuthenticated,
}: {
  product: Product;
  isAuthenticated: boolean;
}) {
  return (
    <section className="mx-auto max-w-[430px] lg:mx-0">
      <div className="mb-10">
        <h1 className="mb-2 text-base font-medium leading-snug text-black">
          {product.title}
        </h1>

        <div className="text-xl font-medium tracking-tight text-black">
          <ProductPrice product={product} size="detail" />
        </div>
      </div>

      {product.descriptionHtml ? (
        <Prose
          className="mx-0 mb-14 w-full max-w-none px-0 text-[15px] leading-7 text-neutral-600 prose-p:my-3 prose-p:px-0 prose-strong:font-semibold prose-strong:text-black prose-a:text-black prose-ul:mt-4 prose-ul:pl-4 prose-ol:mt-4 prose-ol:pl-4"
          html={product.descriptionHtml}
        />
      ) : null}

      <div className="border-t border-neutral-200 pt-6">
        <VariantSelector
          options={product.options}
          variants={product.variants}
        />
      </div>

      <div className="border-t border-neutral-200 pt-8">
        <AddToCart product={product} />
      </div>
    </section>
  );
}
