import { HomeProductSection } from "components/home/product-section";
import { getCollections, getProducts, getSiteContent, getVadminImageUrl } from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import { getFavorites } from "lib/vadmin/favorites";
import Link from "next/link";

export const metadata = {
	title: "Plan B Store — Moda Mayorista",
	description:
		"Descubrí la nueva colección de moda mayorista. Envíos a todo el país.",
	openGraph: { type: "website" },
};

// Category card component
function CategoryCard({
	title,
	handle,
}: {
	title: string;
	handle: string;
}) {
	return (
		<Link
			href={`/catalogo?categoria=${handle}`}
			className="group relative flex items-end overflow-hidden"
			style={{
				aspectRatio: "3/4",
				backgroundColor: "var(--pb-surface)",
			}}
		>
			{/* Gradient overlay */}
			<div
				className="absolute inset-0 z-10 transition-opacity duration-300 group-hover:opacity-80"
				style={{
					background:
						"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
				}}
			/>
			<span
				className="relative z-20 w-full p-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white"
			>
				{title}
			</span>
		</Link>
	);
}

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
				className="relative flex min-h-screen flex-col items-center justify-center text-center overflow-hidden"
				style={{ backgroundColor: "var(--pb-surface)" }}
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
						{/* Subtle overlay to ensure text readability */}
						<div className="absolute inset-0 bg-black/10" />
					</>
				) : (
					<div
						className="absolute inset-0"
						style={{
							background:
								"radial-gradient(ellipse at 50% 120%, #EEECEA 0%, #F7F7F5 70%)",
						}}
					/>
				)}

				<div className="relative z-10 px-6">
					<p
						className="mb-4 text-xs font-medium uppercase tracking-[0.4em]"
						style={{ color: "var(--pb-text-muted)" }}
					>
						Nueva Temporada
					</p>
					<h1
						className="mb-6 text-5xl font-medium leading-tight md:text-7xl"
						style={{
							fontFamily: "var(--font-serif)",
							color: "var(--pb-text)",
						}}
					>
						Otoño–Invierno
						<br />
						<em className="font-normal italic">2025</em>
					</h1>
					<p
						className="mx-auto mb-10 max-w-md text-sm leading-relaxed"
						style={{ color: "var(--pb-text-secondary)" }}
					>
						Colecciones diseñadas para el comercio mayorista. Estilo, calidad y
						precio para tu negocio.
					</p>
					<Link
						href="/catalogo"
						className="inline-block border px-10 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-200 hover:opacity-70 rounded-[var(--pb-radius)]"
						style={{
							borderColor: "var(--pb-accent)",
							color: "var(--pb-accent)",
						}}
					>
						Ver catálogo
					</Link>
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
