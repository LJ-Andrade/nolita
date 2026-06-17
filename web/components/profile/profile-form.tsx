"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import LoadingDots from "components/loading-dots";
import type { CustomerSession } from "lib/vadmin/auth";
import {
  updateProfileAction,
  type ProfileFormState,
} from "app/(store)/perfil/actions";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[12px] bg-graphite px-5 py-4 text-sm font-bold uppercase tracking-widest text-parchment transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <LoadingDots className="bg-parchment" /> : "Guardar cambios"}
    </button>
  );
}

type Province = { id: number; name: string };
type Locality = { id: number; name: string; province_id: number };

export default function ProfileForm({
  customer,
  provinces,
}: {
  customer: CustomerSession;
  provinces: Province[];
}) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    {
      status: "idle",
      message: "",
      customer,
    },
  );
  const currentCustomer = state.customer || customer;

  const [selectedProvince, setSelectedProvince] = useState<string>(
    customer.province_id ? String(customer.province_id) : "",
  );
  const [selectedLocality, setSelectedLocality] = useState<string>(
    customer.locality_id ? String(customer.locality_id) : "",
  );

  // Localities are loaded per province on demand. Preloading the full country
  // (~4000 localities) hit the API page size cap and silently truncated the
  // list (e.g. Buenos Aires cut off around "C").
  const [provinceLocalities, setProvinceLocalities] = useState<Locality[]>([]);
  const [localitiesLoading, setLocalitiesLoading] = useState(false);

  useEffect(() => {
    if (!selectedProvince) {
      setProvinceLocalities([]);
      return;
    }

    let cancelled = false;
    setLocalitiesLoading(true);
    fetch(`/api/localities?province_id=${selectedProvince}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Locality[]) => {
        if (!cancelled) setProvinceLocalities(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setProvinceLocalities([]);
      })
      .finally(() => {
        if (!cancelled) setLocalitiesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProvince]);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state.status, state.message]);

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedLocality("");
  };

  return (
    <form action={formAction} className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section className="space-y-6">
          <h2 className="border-b border-bone pb-2 font-serif text-xl font-medium text-graphite">
            Datos personales
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                htmlFor="name"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={currentCustomer.name}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="dni"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                DNI
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                pattern="[0-9]{8}"
                maxLength={8}
                defaultValue={currentCustomer.dni || ""}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>

            <div className="flex flex-col gap-2">
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
                defaultValue={currentCustomer.email || ""}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
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
                defaultValue={currentCustomer.phone || ""}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                htmlFor="address"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                Direccion
              </label>
              <textarea
                id="address"
                name="address"
                rows={4}
                defaultValue={currentCustomer.address || ""}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="postal_code"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                CP
              </label>
              <input
                id="postal_code"
                name="postal_code"
                type="text"
                maxLength={20}
                defaultValue={currentCustomer.postal_code || ""}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="province_id"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                Provincia
              </label>
              <select
                id="province_id"
                name="province_id"
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              >
                <option value="">Seleccionar provincia</option>
                {provinces.map((prov) => (
                  <option key={prov.id} value={String(prov.id)}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="locality_id"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                Localidad
              </label>
              <select
                id="locality_id"
                name="locality_id"
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                disabled={!selectedProvince || localitiesLoading}
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite disabled:opacity-50"
              >
                <option value="">
                  {localitiesLoading
                    ? "Cargando localidades..."
                    : "Seleccionar localidad"}
                </option>
                {provinceLocalities.map((loc) => (
                  <option key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="border-b border-bone pb-2 font-serif text-xl font-medium text-graphite">
            Seguridad
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                Nueva contrasena
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password_confirmation"
                className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
              >
                Confirmar contrasena
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className="rounded-[12px] border border-bone bg-parchment/50 px-4 py-3 text-sm outline-none transition-colors focus:border-graphite focus:ring-1 focus:ring-graphite"
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="h-fit border border-bone bg-parchment/60 p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-brown">
            Cliente
          </p>
          <p className="mt-2 text-lg font-medium text-graphite">
            {currentCustomer.name}
          </p>
          <p className="mt-1 text-sm text-stone-brown">
            {currentCustomer.email}
          </p>
        </div>

        <SaveButton />
      </aside>
    </form>
  );
}
