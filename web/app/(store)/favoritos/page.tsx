import { ProductGrid } from "components/catalog/product-grid";
import { getFavorites } from "lib/vadmin/favorites";
import { getSession } from "lib/vadmin/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Tus productos favoritos.",
};

export default async function FavoritesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/ingreso?redirect=/favoritos");
  }

  const favorites = await getFavorites();
  const favoriteIds = new Set(favorites.map((p) => p.id));

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8">
      <div className="mb-10 flex flex-col gap-3 border-b border-bone pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-brown">Cuenta</p>
        <h1 className="font-serif text-4xl font-medium text-graphite">Mis Favoritos</h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-brown">
          {favorites.length > 0
            ? `Tenés ${favorites.length} producto${favorites.length !== 1 ? 's' : ''} en tu lista de favoritos.`
            : "Todavía no tenés productos favoritos. Explorá el catálogo y agregá los que te gusten."}
        </p>
      </div>

      <ProductGrid products={favorites} favoriteIds={favoriteIds} isAuthenticated={true} />
    </div>
  );
}
