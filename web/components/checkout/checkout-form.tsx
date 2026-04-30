"use client";

import type { CustomerSession } from "lib/vadmin/auth";

type CheckoutFormData = Partial<CustomerSession> & {
  city?: string | null;
  postal_code?: string | null;
};

export default function CheckoutForm({
  initialData = {},
}: {
  initialData?: CheckoutFormData | null;
}) {
  return (
    <div className="space-y-6">
      <h2 className="border-b border-bone pb-2 font-serif text-xl font-medium">
        Informacion de envio
      </h2>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="name"
          className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
        >
          Nombre y apellido
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
          defaultValue={initialData?.name || ""}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
          defaultValue={initialData?.email || ""}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="phone"
          className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
        >
          Telefono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
          defaultValue={initialData?.phone || ""}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="address"
          className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
        >
          Direccion completa
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          placeholder="Calle, numero, piso, depto"
          className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
          defaultValue={initialData?.address || ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="city"
            className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
          >
            Ciudad
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
            defaultValue={initialData?.city || ""}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="postal_code"
            className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
          >
            Codigo postal
          </label>
          <input
            id="postal_code"
            name="postal_code"
            type="text"
            required
            className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite"
            defaultValue={initialData?.postal_code || ""}
          />
        </div>
      </div>
    </div>
  );
}
