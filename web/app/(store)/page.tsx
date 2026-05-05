import { ProductCard } from "components/catalog/product-card";
import { getCollections, getProducts, getSiteContent, getVadminImageUrl } from "lib/vadmin";
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
			href={`/catalog?category=${handle}`}
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
	const [products, collections, content] = await Promise.all([
		getProducts(),
		getCollections(),
		getSiteContent('home'),
	]);

	const featuredProducts = products.slice(0, 4);
	const categories = collections.filter((c) => c.handle !== "");
	const heroImage = getVadminImageUrl(content.home_hero_banner || "/storage/web/hero_1.jpg");

	return (
		<>
			{/* ── Hero ─────────────────────────────────────────────────────── */}
			<section
				className="relative flex min-h-screen flex-col items-center justify-center text-center overflow-hidden"
				style={{ backgroundColor: "var(--pb-surface)" }}
			>
				{/* Hero background */}
				{heroImage ? (
					<div 
						className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
						style={{ 
							backgroundImage: `url(${heroImage})`,
						}}
					>
						{/* Subtle overlay to ensure text readability */}
						<div className="absolute inset-0 bg-black/10" />
					</div>
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
						href="/catalog"
						className="inline-block border px-10 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-200 hover:opacity-70"
						style={{
							borderColor: "var(--pb-accent)",
							color: "var(--pb-accent)",
						}}
					>
						Ver catálogo
					</Link>
				</div>
			</section>


			{/* ── Featured Products ─────────────────────────────────────────── */}
			{featuredProducts.length > 0 && (
				<section
					className="py-16"
					style={{ backgroundColor: "var(--pb-surface)" }}
				>
					<div className="mx-auto max-w-screen-2xl px-4 lg:px-8">
						<div className="mb-10 flex items-end justify-between">
							<h2
								className="text-2xl font-medium"
								style={{
									fontFamily: "var(--font-serif)",
									color: "var(--pb-text)",
								}}
							>
								Nuevos ingresos
							</h2>
							<Link
								href="/catalog"
								className="text-xs font-medium uppercase tracking-widest underline underline-offset-4 transition-opacity hover:opacity-60"
								style={{ color: "var(--pb-text-secondary)" }}
							>
								Ver todo →
							</Link>
						</div>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
							{featuredProducts.map((product, i) => (
								<ProductCard
									key={product.id}
									product={product}
									priority={i < 2}
								/>
							))}
						</div>
					</div>
				</section>
			)}

		</>
	);
}
