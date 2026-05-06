import Link from "next/link";
import Image from "next/image";

import FooterMenu from "components/layout/footer-menu";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/vadmin";
import { Suspense } from "react";

const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
	const currentYear = new Date().getFullYear();
	const copyrightDate = `${currentYear}`;
	const skeleton =
		"w-full h-6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700";
	const menu = await getMenu("next-js-frontend-footer-menu");
	const copyrightName = COMPANY_NAME || SITE_NAME || "";

	return (
		<footer className="bg-graphite text-sm text-bone/80">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center border-b border-stone-brown/20 px-6 py-12 text-sm">
				<Link
					className="flex items-center gap-3 text-bone"
					href="/"
				>
					<Image
						src="/iso-black.svg"
						alt={SITE_NAME || "Plan B"}
						width={36}
						height={32}
						className="h-8 w-auto invert brightness-0 no-radius"
					/>
					<Image
						src="/logo-black.svg"
						alt={SITE_NAME || "Plan B"}
						width={180}
						height={24}
						className="h-6 w-auto invert brightness-0 no-radius"
					/>
				</Link>
			</div>
			<div className="py-6 text-sm">
				<div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-1 px-4 md:flex-row md:gap-0 md:px-4 min-[1320px]:px-0">
					<p>
						&copy; {copyrightDate} {copyrightName}
						{copyrightName.length && !copyrightName.endsWith(".")
							? "."
							: ""}
					</p>
					<p className="md:ml-auto">
						<a href="https://studiovimana.com.ar" className="text-bone hover:opacity-80 transition-opacity">
							Creado por Studio Vimana
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
