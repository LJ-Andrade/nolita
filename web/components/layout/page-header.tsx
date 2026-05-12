"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function PageHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Don't show header on some pages if needed, or adapt it
  const isHome = pathname === "/";
  const isCatalog = pathname === "/catalog" || pathname === "/catalogo";
  const isSearch = pathname.startsWith("/search") || pathname.startsWith("/buscar");
  
  let title = "Plan B";
  let subtitle = "";

  if (isHome || isCatalog) {
    title = "Catálogo";
    const category = searchParams.get("category");
    if (category) {
      title = category.charAt(0).toUpperCase() + category.slice(1);
    }
  } else if (isSearch) {
    title = "Búsqueda";
    const q = searchParams.get("q");
    if (q) subtitle = `Resultados para "${q}"`;
  } else if (pathname === "/login" || pathname === "/ingreso") {
    title = "Iniciar Sesión";
  } else if (pathname === "/register" || pathname === "/registro") {
    title = "Crear Cuenta";
  } else if (pathname === "/checkout" || pathname === "/finalizar-compra") {
    title = "Finalizar Pedido";
  } else if (pathname.startsWith("/product/") || pathname.startsWith("/producto/")) {
    title = "Producto"; // Could fetch product name if we use a provider, but for now simple
  }

  // Only show header on catalog/home/search for now as requested? 
  // User said "presente en todo el sitio", so we'll show it everywhere with adapted titles.

  return (
    <div className="w-full bg-white border-b border-neutral-100 py-8 text-center dark:bg-black dark:border-neutral-900">
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-8">
        <h1
          className="text-4xl font-medium uppercase tracking-widest"
          style={{ fontFamily: "var(--font-serif)", color: "var(--pb-text)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-2 text-sm italic"
            style={{ color: "var(--pb-text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
