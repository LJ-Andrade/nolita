import { ActiveFilters } from "components/catalog/active-filters";
import { EditorialFilterControls } from "components/catalog/editorial-filter-controls";
import { ProductGrid } from "components/catalog/product-grid";
import { getCollections, getProducts, getSiteContent, getVadminImageUrl } from "lib/vadmin";
import { getServerPriceMode } from "lib/price-mode";
import { getSession } from "lib/vadmin/auth";
import { getFavorites } from "lib/vadmin/favorites";
import type { Product } from "lib/vadmin/types";
import { Suspense } from "react";

export const metadata = {
	title: "Nolita — Moda Mayorista",
	description:
		"Descubrí la nueva colección de Nolita. Envíos a todo el país.",
	openGraph: { type: "website" },
};

type SearchParams = {
	category?: string;
	categoria?: string;
	size?: string | string[];
	sort?: string;
};

function sortProducts(products: Product[], sort: string): Product[] {
	const copy = [...products];

	switch (sort) {
		case "featured":
			return copy;
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
		case "discount_desc":
			return copy.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
		case "newest":
		default:
			return copy.sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			);
	}
}

function filterProducts(products: Product[], sizes: string[]): Product[] {
	if (sizes.length === 0) {
		return products;
	}

	return products.filter((product) =>
		product.options
			.find((option) => option.name === "Talle")
			?.values.some((value) => sizes.includes(value)),
	);
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

			const size = variant.selectedOptions.find((option) => option.name === "Talle")?.value;

			if (size) {
				sizes.add(size);
			}
		});
	});

	return Array.from(sizes);
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
	const sort = searchParams.sort ?? "featured";
	const mode = await getServerPriceMode();
	const [products, collections, content, session, categoryFilterProducts] = await Promise.all([
		getProducts({ category, mode }),
		getCollections(),
		getSiteContent('home'),
		getSession(),
		category ? getProducts({ mode }) : Promise.resolve(null),
	]);

	const favorites = session ? await getFavorites() : [];
	const favoriteIds = new Set(favorites.map((product) => product.id));
	const allSizes = getAvailableProductSizes(products);
	const filteredProducts = filterProducts(products, sizes);
	const sortedProducts = sortProducts(filteredProducts, sort);
	const categoryProductHandles = new Set(
		(categoryFilterProducts ?? products)
			.filter(hasAvailableVariant)
			.map((product) => product.category?.handle)
			.filter(Boolean),
	);
	const filterCategories = collections.filter(
		(collection) => collection.handle && categoryProductHandles.has(collection.handle),
	);
	const heroImage = getVadminImageUrl(content.home_hero_banner || "/storage/web/hero_1.jpg");
	const heroMobileImage = getVadminImageUrl(
		content.home_hero_banner_mobile || content.home_hero_banner || "/storage/web/hero_1.jpg",
	);
	const heroBarText =
		content.home_top_text ||
		"Envios bonificados en pedidos mayoristas · Nueva coleccion disponible";

	return (
		<>
			{/* ── Announcement Bar ─────────────────────────────────────────── */}
			<div
				className="flex h-10 items-center justify-center px-6 text-center text-[10px] font-medium uppercase tracking-[0.28em]"
				style={{ backgroundColor: "var(--pb-announce-bg)", color: "var(--pb-announce-text)" }}
			>
				{heroBarText}
			</div>

			{/* ── Hero ─────────────────────────────────────────────────────── */}
			<section
				className="relative flex min-h-[calc(100svh-76px)] overflow-hidden bg-[#eee8e3]"
			>
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
						<div className="absolute inset-0 bg-[#f4eee9]/20" />
						<div className="absolute inset-0 bg-gradient-to-r from-black/36 via-black/10 to-white/12" />
					</>
				) : (
					<div
						className="absolute inset-0"
						style={{
							background: "linear-gradient(120deg, #d7cbc3 0%, #f8f1ec 100%)",
						}}
					/>
				)}

				<div className="relative z-10 flex w-full items-end px-6 pb-24 pt-20 md:px-28 md:pb-28">
					<div className="max-w-2xl">
					<p
						className="mb-5 text-[11px] font-medium uppercase tracking-[0.42em] text-[#f3deaf]"
					>
						SS 2026 Collection
					</p>
					<h1
						className="text-6xl font-normal leading-[0.98] text-white md:text-8xl"
						style={{
							fontFamily: "var(--font-serif)",
						}}
					>
						La Elegancia
						<br />
						<em className="font-normal italic">que no caduca</em>
					</h1>
					</div>
				</div>

			</section>

			<Suspense fallback={null}>
				<EditorialFilterControls
					categories={filterCategories}
					sizes={allSizes}
					total={sortedProducts.length}
				/>
			</Suspense>

			<section className="bg-white px-4 py-10 pb-24 lg:px-8 lg:py-14">
				<div className="mx-auto max-w-screen-2xl">
					<div className="sticky top-[64px] z-30 mb-6 flex flex-wrap items-center justify-between gap-3 border-b bg-white/90 py-3 backdrop-blur-md md:top-[76px]">
						<p className="text-sm text-[#d85a3f]">
							{sortedProducts.length}{" "}
							{sortedProducts.length === 1 ? "producto" : "productos"}
						</p>
						<Suspense fallback={null}>
							<ActiveFilters categories={filterCategories} />
						</Suspense>
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
