import { ProductCard } from "components/catalog/product-card";
import type { Product } from "lib/vadmin/types";
import Link from "next/link";

type HomeProductSectionProps = {
	products: Product[];
	title?: string;
	viewAllHref?: string;
	priorityCount?: number;
};

export function HomeProductSection({
	products,
	title,
	viewAllHref,
	priorityCount = 2,
}: HomeProductSectionProps) {
	if (!products.length) return null;

	return (
		<section className="py-16" style={{ backgroundColor: "var(--pb-bg)" }}>
			<div className="mx-auto max-w-screen-2xl px-4 lg:px-8">
				{(title || viewAllHref) && (
					<div className="mb-10 flex items-end justify-between">
						{title && (
							<h2
								className="text-2xl font-medium"
								style={{
									fontFamily: "var(--font-serif)",
									color: "var(--pb-text)",
								}}
							>
								{title}
							</h2>
						)}
						{viewAllHref && (
							<Link
								href={viewAllHref}
								className="text-xs font-medium uppercase tracking-widest underline underline-offset-4 transition-opacity hover:opacity-60"
								style={{ color: "var(--pb-text-secondary)" }}
							>
								Ver todo →
							</Link>
						)}
					</div>
				)}
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{products.map((product, index) => (
						<ProductCard
							key={product.id}
							product={product}
							priority={index < priorityCount}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
