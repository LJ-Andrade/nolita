import Link from "next/link";
import Image from "next/image";

import { getCollections, getProducts, getSiteContent } from "lib/vadmin";

const { COMPANY_NAME, SITE_NAME, COPYRIGHT_YEAR } = process.env;

export default async function Footer() {
	const businessInfo = await getSiteContent("business");
	const [collections, products] = await Promise.all([
		getCollections(),
		getProducts(),
	]);
	const copyrightDate = COPYRIGHT_YEAR || "2026";
	const copyrightName = getSiteValue(businessInfo, [
		"business_name",
		"company_name",
		"site_name",
	]) || COMPANY_NAME || SITE_NAME || "Plan B";
	const developerLabel = getSiteValue(businessInfo, [
		"footer_developer_label",
		"business_developer_label",
	]) || "Diseño & Desarrollo por Studio Vimana";
	const developerUrl = getSiteValue(businessInfo, [
		"footer_developer_url",
		"business_developer_url",
	]) || "https://studiovimana.com.ar";
	const businessEmail = getSiteValue(businessInfo, ["business_email"]);
	const businessPhone = getSiteValue(businessInfo, ["business_phone"]);
	const businessWhatsapp = getSiteValue(businessInfo, ["business_whatsapp"]);

	const socialLinks = [
		{
			key: "business_instagram",
			label: "Instagram",
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
				</svg>
			)
		},
		{
			key: "business_facebook",
			label: "Facebook",
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
			)
		},
		{
			key: "business_tiktok",
			label: "TikTok",
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M16.6 5.82c1.05 1.2 2.32 1.9 3.9 2.04v3.3c-1.46-.03-2.78-.43-3.86-1.12v5.95c0 3.45-2.35 5.73-5.82 5.73-3.13 0-5.32-2.1-5.32-5.1 0-3.14 2.38-5.25 5.7-5.25.33 0 .64.02.93.08v3.34a3.5 3.5 0 0 0-.98-.14c-1.32 0-2.2.75-2.2 1.88 0 1.07.78 1.8 1.95 1.8 1.34 0 2.16-.8 2.16-2.4V2.28h3.22c.08 1.38.18 2.32.32 3.54Z" />
				</svg>
			)
		},
		{
			key: "business_youtube",
			label: "YouTube",
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
				</svg>
			)
		},
		{
			key: "business_linkedin",
			label: "LinkedIn",
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
				</svg>
			)
		},
	]
		.map((social) => ({
			...social,
			url: getSiteValue(businessInfo, [social.key]),
		}))
		.filter((social) => social.url);

	const contactLinks = [
		businessEmail
			? {
				key: "business_email",
				label: businessEmail,
				href: `mailto:${businessEmail}`,
			}
			: null,
		businessPhone
			? {
				key: "business_phone",
				label: businessPhone,
				href: `tel:${businessPhone.replace(/\s/g, "")}`,
			}
			: null,
		!businessPhone && businessWhatsapp
			? {
				key: "business_whatsapp",
				label: businessWhatsapp,
				href: `https://wa.me/${businessWhatsapp.replace(/\D/g, "")}`,
			}
			: null,
	].filter(isDefined);

	const wholesaleLinks = [
		{ label: "Registrarse", href: "/registro" },
		{ label: "Acceso clientes", href: "/ingreso" },
	];
	const categoriesWithProducts = new Set(
		products
			.map((product) => product.category?.handle)
			.filter(Boolean),
	);
	const categoryLinks = collections
		.filter((collection) => collection.handle && categoriesWithProducts.has(collection.handle))
		.map((collection) => ({
			label: collection.title,
			href: `/catalogo?categoria=${collection.handle}`,
		}));
	const categorySplitIndex = Math.ceil(categoryLinks.length / 2);
	const primaryCategoryLinks = categoryLinks.slice(0, categorySplitIndex);
	const secondaryCategoryLinks = categoryLinks.slice(categorySplitIndex);

	return (
		<footer className="bg-bone text-stone-brown">
			<div className="mx-auto w-full max-w-screen-2xl px-6 pt-14 pb-12 md:px-10 md:pt-16 lg:px-12">
				<div className="flex items-center justify-between gap-12 md:gap-16">
					<Link
						href="/"
						aria-label={SITE_NAME || "Plan B"}
						className="relative mr-0 block aspect-[5.45/1] min-w-0 flex-1 pr-4 transition-opacity hover:opacity-80 md:mr-12 md:pr-8 lg:mr-24 xl:mr-32"
					>
						<Image
							src="/logo-white.png"
							alt={SITE_NAME || "Plan B"}
							fill
							className="no-radius object-contain object-left opacity-35"
						/>
					</Link>

					{socialLinks.length > 0 && (
						<ul className="hidden shrink-0 items-center gap-3 md:flex">
							{socialLinks.slice(0, 3).map((social) => (
								<li key={social.key}>
									<a
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										title={social.label}
										aria-label={social.label}
										className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-brown/20 text-stone-brown/70 transition-colors hover:border-stone-brown/45 hover:text-graphite"
									>
										{social.icon}
									</a>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="mt-10 border-t border-stone-brown/25 pt-10 md:mt-12 md:pt-11">
					<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-20">
						<FooterColumn title="Mayoristas" links={wholesaleLinks} />
						<FooterColumn title="Categorías" links={primaryCategoryLinks} />
						<FooterColumn title="" links={secondaryCategoryLinks} />

						<div className="flex flex-col gap-5">
							<h3 className="text-[11px] font-bold uppercase tracking-[0.35em] text-stone-brown/45">Contacto</h3>
							<div className="flex flex-col gap-4 text-sm text-stone-brown/80">
								{contactLinks.map((contact) => (
									<a
										key={contact.key}
										href={contact.href}
										className="transition-colors hover:text-graphite"
									>
										{contact.label}
									</a>
								))}
							</div>
						</div>
					</div>

					{socialLinks.length > 0 && (
						<ul className="mt-10 flex items-center gap-3 md:hidden">
							{socialLinks.slice(0, 3).map((social) => (
								<li key={social.key}>
									<a
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										title={social.label}
										aria-label={social.label}
										className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-brown/20 text-stone-brown/70 transition-colors hover:border-stone-brown/45 hover:text-graphite"
									>
										{social.icon}
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<div className="border-t border-stone-brown/15 py-8">
				<div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-6 text-[10px] uppercase tracking-[0.18em] text-stone-brown/65 md:flex-row md:justify-between md:px-10 lg:px-12">
					<p>&copy; {copyrightDate} {copyrightName} — Todos los derechos reservados.</p>
					<p>
						<a
							href={developerUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors hover:text-graphite"
						>
							{developerLabel}
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}

function getSiteValue(content: Record<string, string>, keys: string[]) {
	for (const key of keys) {
		const value = content[key]?.trim();

		if (value) {
			return value;
		}
	}

	return "";
}

function isDefined<T>(value: T | null): value is T {
	return value !== null;
}

function FooterColumn({
	title,
	links,
}: {
	title: string;
	links: Array<{ label: string; href: string }>;
}) {
	return (
		<div className="flex flex-col gap-5">
			<h3
				aria-hidden={!title}
				className={`text-[11px] font-bold uppercase tracking-[0.35em] text-stone-brown/45 ${title ? "" : "invisible"}`}
			>
				{title || "Categorías"}
			</h3>
			<ul className="flex flex-col gap-4 text-sm text-stone-brown/80">
				{links.map((link) => (
					<li key={`${title}-${link.href}-${link.label}`}>
						<Link href={link.href} className="transition-colors hover:text-graphite">
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
