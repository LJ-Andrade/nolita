import { ProductGrid } from "components/catalog/product-grid";
import { defaultSort, sorting } from "lib/constants";
import { getProducts } from "lib/vadmin";
import { getFavorites } from "lib/vadmin/favorites";
import { getSession } from "lib/vadmin/auth";

export const metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const [products, session] = await Promise.all([
    getProducts({ sortKey, reverse, query: searchValue }),
    getSession(),
  ]);

  const favorites = session ? await getFavorites() : [];
  const favoriteIds = new Set(favorites.map((p) => p.id));
  const isAuthenticated = !!session;
  const resultsText = products.length > 1 ? "resultados" : "resultado";

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 lg:px-8">
      {searchValue ? (
        <p className="mb-4 text-sm text-stone-brown">
          {products.length === 0
            ? "No hay productos que coincidan con "
            : `${products.length} ${resultsText} para `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}
      {products.length > 0 ? (
        <ProductGrid
          products={products}
          favoriteIds={favoriteIds}
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-20">
          <p className="text-sm uppercase tracking-widest text-stone-brown">
            No se encontraron productos
          </p>
        </div>
      )}
    </div>
  );
}
