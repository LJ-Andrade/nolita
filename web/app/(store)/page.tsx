import { HomeProductSection } from "components/home/product-section";
import { getCollections, getProducts, getSiteContent, getVadminImageUrl } from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import { getFavorites } from "lib/vadmin/favorites";
import Link from "next/link";

export const metadata = {
	title: "Nolita — Moda Mayorista",
	description:
		"Descubrí la nueva colección de Nolita. Envíos a todo el país.",
	openGraph: { type: "website" },
};

export default async function HomePage() {
	const [products, featuredProducts, listedCategories, content, session] = await Promise.all([
		getProducts(),
		getProducts({ featured: true }),
		getCollections({ listed: true }),
		getSiteContent('home'),
		getSession(),
	]);

	const favorites = session ? await getFavorites() : [];
	const favoriteIds = new Set(favorites.map((product) => product.id));
	const newArrivalProducts = products.slice(0, 4);
	const heroImage = getVadminImageUrl(content.home_hero_banner || "/storage/web/hero_1.jpg");
	const heroMobileImage = getVadminImageUrl(
		content.home_hero_banner_mobile || content.home_hero_banner || "/storage/web/hero_1.jpg",
	);

	return (
		<>
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

				<div className="absolute bottom-0 left-0 right-0 z-20 flex h-12 items-center justify-center bg-[#f7f4f0]/95 px-6 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-stone-brown">
					Envíos bonificados en pedidos mayoristas · Nueva colección disponible
				</div>
			</section>

			{/* ── Categories Mosaic ─────────────────────────────────────────── */}
			{listedCategories.length > 0 && (
				<section className="bg-[var(--pb-bg)]">
					<div className="flex flex-wrap">
						{listedCategories.map((category) => (
							<Link
								key={category.handle}
								href={`/catalogo?categoria=${category.handle}`}
								className="group relative h-[80vw] grow basis-full overflow-hidden md:h-[60vh] md:basis-1/3"
							>
								{category.image ? (
									<img
										src={category.image}
										alt={category.title}
										className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 no-radius"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-neutral-200">
										<span className="text-xs uppercase tracking-widest text-neutral-400">Sin Imagen</span>
									</div>
								)}

								{/* Overlay */}
								<div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/30" />

								{/* Content at bottom left */}
								<div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
									<h3 className="mb-2 text-2xl font-medium uppercase tracking-[0.2em] text-white md:text-3xl">
										{category.title}
									</h3>
									<span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-white/90 underline underline-offset-4 transition-transform duration-300 group-hover:translate-x-1">
										ver más
									</span>
								</div>
							</Link>
						))}
					</div>
				</section>
			)}

			<HomeProductSection
				products={featuredProducts}
				favoriteIds={favoriteIds}
				isAuthenticated={Boolean(session)}
			/>

			<HomeProductSection
				products={newArrivalProducts}
				favoriteIds={favoriteIds}
				isAuthenticated={Boolean(session)}
				title="Nuevos ingresos"
				viewAllHref="/catalogo"
			/>

		</>
	);
}
