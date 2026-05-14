import CartModal from "components/cart/modal";
import CartTrigger from "components/cart/trigger";
import { getMenu } from "lib/vadmin";
import { getSession } from "lib/vadmin/auth";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");
  const session = await getSession();

  return (
    <header
      style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff" }}
      className="sticky top-0 z-50 w-full"
    >
      {/* ── Desktop Navbar ─────────────────────────────────────────────── */}
      <nav className="mx-auto hidden h-[76px] max-w-screen-2xl items-center px-8 md:grid md:grid-cols-3">

        <div aria-hidden="true" />

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link
            href="/"
            prefetch={true}
            className="text-[46px] font-normal uppercase leading-none tracking-[0.18em] text-black"
            aria-label={SITE_NAME || "Nolita"}
          >
            NOLITA
          </Link>
        </div>

        {/* Right: User + Cart */}
        <div className="flex items-center justify-end gap-5">
          <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em]">
            <Link href="/catalogo" className="text-black transition-opacity hover:opacity-60">
              Retail
            </Link>
            <Link
              href={session ? "/perfil" : "/ingreso"}
              className="relative h-5 w-9 rounded-full bg-[#dbc4bd] transition-opacity hover:opacity-80"
              aria-label="Wholesale access"
            >
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
            </Link>
            <Link
              href={session ? "/perfil" : "/ingreso"}
              className="text-stone-brown/55 transition-colors hover:text-black"
            >
              Wholesale
            </Link>
          </div>
          <CartTrigger />
        </div>
      </nav>

      {/* ── Mobile Navbar ──────────────────────────────────────────────── */}
      <div className="flex h-[64px] items-center justify-between bg-white px-4 md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} customer={session} />
        </Suspense>
        <Link
          href="/"
          prefetch={true}
          className="text-3xl font-normal uppercase leading-none tracking-[0.18em] text-black"
          aria-label={SITE_NAME || "Nolita"}
        >
          NOLITA
        </Link>
        <CartTrigger />
      </div>
      <CartModal />
    </header>
  );
}
