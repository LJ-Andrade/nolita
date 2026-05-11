import Link from "next/link";
import Image from "next/image";

import { getSiteContent } from "lib/vadmin";

const { COMPANY_NAME, SITE_NAME, COPYRIGHT_YEAR } = process.env;

export default async function Footer() {
	const businessInfo = await getSiteContent('business');
	const copyrightDate = COPYRIGHT_YEAR || "2026";
	const copyrightName = COMPANY_NAME || SITE_NAME || "Plan B";

	const socialLinks = [
		{
			key: 'business_instagram',
			label: 'Instagram',
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
				</svg>
			)
		},
		{
			key: 'business_facebook',
			label: 'Facebook',
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
			)
		},
		{
			key: 'business_tiktok',
			label: 'TikTok',
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12.525.02c1.31 0 2.591.214 3.751.585.056 3.058 2.023 5.575 4.683 6.707v4.211c-1.303-.43-2.523-1.102-3.587-1.985v6.233c0 4.032-3.27 7.302-7.302 7.302s-7.302-3.27-7.302-7.302 3.27-7.302 7.302-7.302c.419 0 .83.035 1.228.101V12.7c-.397-.066-.801-.1-1.211-.1-2.929 0-5.302 2.373-5.302 5.302s2.373 5.302 5.302 5.302 5.302-2.373 5.302-5.302V0h2.445z" />
				</svg>
			)
		},
		{
			key: 'business_youtube',
			label: 'YouTube',
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
				</svg>
			)
		},
		{
			key: 'business_linkedin',
			label: 'LinkedIn',
			icon: (
				<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
				</svg>
			)
		},
	].filter(social => businessInfo[social.key]);

	return (
		<footer className="bg-graphite text-sm text-bone/80">
			<div className="mx-auto flex w-full max-w-screen-2xl flex-col px-6 py-20 md:flex-row md:items-start md:gap-24">

				{/* Left side: Circular Logo */}
				<div className="mb-12 md:mb-0">
					<Link href="/" className="group relative block">
						<div className="animate-spin-slow">
							<Image
								src="/circ-black.svg"
								alt={SITE_NAME || "Plan B"}
								width={240}
								height={240}
								className="h-40 w-40 invert brightness-0 no-radius md:h-56 md:w-56 transition-opacity group-hover:opacity-80"
							/>
						</div>
					</Link>
				</div>

				{/* Right Side Container */}
				<div className="flex flex-1 flex-col gap-16 pt-8">
					
					{/* Row 1: Social Media (Horizontal) */}
					{socialLinks.length > 0 && (
						<div className="flex flex-col gap-6">
							<h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-bone/30">Redes</h3>
							<ul className="flex flex-row flex-wrap gap-6">
								{socialLinks.map((social) => (
									<li key={social.key}>
										<a 
											href={businessInfo[social.key]} 
											target="_blank" 
											rel="noopener noreferrer"
											title={social.label}
											className="group/link flex h-10 w-10 items-center justify-center rounded-full border border-bone/10 transition-all hover:border-white hover:bg-white hover:text-black"
										>
											{social.icon}
										</a>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Row 2: Information (3 Columns) */}
					<div className="grid grid-cols-1 gap-12 sm:grid-cols-3 md:gap-16">
						{/* Offices */}
						<div className="flex flex-col gap-1">
							<h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-bone/30">Oficinas</h3>
							{businessInfo.business_address && (
								<p className="text-xs font-medium uppercase tracking-wider text-bone">{businessInfo.business_address}</p>
							)}
						</div>

						{/* Consultations */}
						<div className="flex flex-col gap-1">
							<h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-bone/30">Consultas</h3>
							<div className="flex flex-col gap-1">
								{businessInfo.business_phone && (
									<p className="text-xs font-medium uppercase tracking-wider text-bone">{businessInfo.business_phone}</p>
								)}
								{businessInfo.business_email && (
									<a href={`mailto:${businessInfo.business_email}`} className="text-xs font-medium uppercase tracking-wider text-bone transition-colors hover:text-white">
										{businessInfo.business_email}
									</a>
								)}
							</div>
						</div>

						{/* Hours */}
						{businessInfo.business_hours && (
							<div className="flex flex-col gap-1">
								<h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-bone/30">Horarios</h3>
								<p className="text-xs font-medium uppercase tracking-wider text-bone">{businessInfo.business_hours}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Copyright Bar */}
			<div className="border-t border-bone/5 py-8">
				<div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-4 px-6 md:flex-row md:justify-between">
					<p className="text-[10px] uppercase tracking-widest text-bone/30">
						&copy; {copyrightDate} {copyrightName} — Todos los derechos reservados.
					</p>
					<p className="text-[10px] uppercase tracking-widest text-bone/30">
						<a href="https://studiovimana.com.ar" target="_blank" className="hover:text-bone/60 transition-colors">
							Diseño & Desarrollo por Studio Vimana
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
