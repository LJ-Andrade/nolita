import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ order?: string }>;
}) {
  const orderId = (await searchParams)?.order;

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
        <svg
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1
        className="mb-4 text-4xl font-medium"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        ¡Pedido Recibido!
      </h1>
      <p className="mb-8 max-w-md text-neutral-500">
        Muchas gracias por tu compra. Estamos procesando tu pedido y te
        contactaremos pronto.
      </p>
      {orderId ? (
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
          Número de pedido #{orderId}
        </p>
      ) : null}
      <Link
        href="/"
        className="rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
