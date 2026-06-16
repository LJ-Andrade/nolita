"use client";

import { useEffect, useState } from "react";
import type { CustomerSession } from "lib/vadmin/auth";
import type { DeliveryMethod, PaymentMethod } from "lib/vadmin/types";

type Province = { id: number; name: string };
type Locality = { id: number; name: string; province_id: number };

type CheckoutFormData = Partial<CustomerSession> & {
  city?: string | null;
  postal_code?: string | null;
  whatsapp?: string | null;
  cuit?: string | null;
};

function CheckoutCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-bone bg-parchment/40 p-5 md:p-6">
      <h2 className="mb-5 font-serif text-xl font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-stone-brown"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldClassName =
  "border border-bone bg-parchment px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-graphite disabled:opacity-50";

export default function CheckoutForm({
  initialData = {},
  provinces,
  localities,
  deliveryMethods,
  paymentMethods,
  onDeliveryChange,
  onPaymentChange,
}: {
  initialData?: CheckoutFormData | null;
  provinces: Province[];
  localities: Locality[];
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
  onDeliveryChange?: (methodId: string) => void;
  onPaymentChange?: (methodId: string) => void;
}) {
  const [selectedProvince, setSelectedProvince] = useState(
    initialData?.province_id ? String(initialData.province_id) : "",
  );
  const [selectedLocality, setSelectedLocality] = useState(
    initialData?.locality_id ? String(initialData.locality_id) : "",
  );
  const [selectedDelivery, setSelectedDelivery] = useState(
    deliveryMethods[0]?.id ?? "",
  );
  const [selectedPayment, setSelectedPayment] = useState(
    paymentMethods[0]?.id ?? "",
  );

  const provinceLocalities = selectedProvince
    ? localities.filter(
        (locality) => locality.province_id === Number(selectedProvince),
      )
    : [];
  const selectedLocalityName =
    provinceLocalities.find(
      (locality) => String(locality.id) === selectedLocality,
    )?.name ?? "";

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedLocality("");
  };

  const handleDeliveryChange = (methodId: string) => {
    setSelectedDelivery(methodId);
    onDeliveryChange?.(methodId);
  };

  const handlePaymentChange = (methodId: string) => {
    setSelectedPayment(methodId);
    onPaymentChange?.(methodId);
  };

  useEffect(() => {
    if (deliveryMethods.some((method) => method.id === selectedDelivery)) {
      return;
    }

    const nextDelivery = deliveryMethods[0]?.id ?? "";
    setSelectedDelivery(nextDelivery);
    if (nextDelivery) onDeliveryChange?.(nextDelivery);
  }, [deliveryMethods, onDeliveryChange, selectedDelivery]);

  useEffect(() => {
    if (paymentMethods.some((method) => method.id === selectedPayment)) {
      return;
    }

    const nextPayment = paymentMethods[0]?.id ?? "";
    setSelectedPayment(nextPayment);
    if (nextPayment) onPaymentChange?.(nextPayment);
  }, [onPaymentChange, paymentMethods, selectedPayment]);

  return (
    <div className="space-y-6">
      <CheckoutCard title="Método de pago">
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods.map((method) => {
            const feePercent = parseFloat(method.fee || "0");
            const hasPaymentAdjustment = feePercent !== 0;

            return (
              <label
                key={method.id}
                className={`flex cursor-pointer items-center justify-between gap-3 border p-4 transition-all ${
                  selectedPayment === method.id
                    ? "border-graphite bg-graphite/5 ring-1 ring-graphite"
                    : "border-bone bg-parchment hover:bg-bone/20"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method_id"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={() => handlePaymentChange(method.id)}
                    className="h-4 w-4 shrink-0 text-graphite focus:ring-graphite"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {method.name}
                    </span>
                    {method.description && (
                      <span
                        className="block text-xs text-stone-brown"
                        dangerouslySetInnerHTML={{ __html: method.description }}
                      />
                    )}
                  </span>
                </span>
                {hasPaymentAdjustment && (
                  <span className="shrink-0 border border-bone bg-bone/30 px-2 py-1 text-xs font-semibold text-stone-brown">
                    {feePercent > 0
                      ? `Recargo: ${method.fee}%`
                      : `Descuento: ${Math.abs(feePercent)}%`}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </CheckoutCard>

      <CheckoutCard title="Envío">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3">
            {deliveryMethods.map((method) => (
              <label
                key={method.id}
                className={`flex cursor-pointer items-center justify-between gap-3 border p-4 transition-all ${
                  selectedDelivery === method.id
                    ? "border-graphite bg-graphite/5 ring-1 ring-graphite"
                    : "border-bone bg-parchment hover:bg-bone/20"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <input
                    type="radio"
                    name="delivery_method_id"
                    value={method.id}
                    checked={selectedDelivery === method.id}
                    onChange={() => handleDeliveryChange(method.id)}
                    className="h-4 w-4 shrink-0 text-graphite focus:ring-graphite"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {method.name}
                    </span>
                    {method.description && (
                      <span
                        className="block text-xs text-stone-brown"
                        dangerouslySetInnerHTML={{ __html: method.description }}
                      />
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold">
                  {parseFloat(method.fee) === 0 ? "" : `$ ${method.fee}`}
                </span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
            <Field id="address" label="Dirección completa">
              <input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Calle, número, piso, depto"
                className={fieldClassName}
                defaultValue={initialData?.address || ""}
              />
            </Field>

            <Field id="postal_code" label="Código postal">
              <input
                id="postal_code"
                name="postal_code"
                type="text"
                required
                className={fieldClassName}
                defaultValue={initialData?.postal_code || ""}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field id="province_id" label="Provincia">
              <select
                id="province_id"
                name="province_id"
                required
                value={selectedProvince}
                onChange={(event) => handleProvinceChange(event.target.value)}
                className={fieldClassName}
              >
                <option value="">Seleccionar provincia</option>
                {provinces.map((province) => (
                  <option key={province.id} value={String(province.id)}>
                    {province.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="locality_id" label="Localidad">
              <select
                id="locality_id"
                name="locality_id"
                required
                value={selectedLocality}
                onChange={(event) => setSelectedLocality(event.target.value)}
                disabled={!selectedProvince}
                className={fieldClassName}
              >
                <option value="">Seleccionar localidad</option>
                {provinceLocalities.map((locality) => (
                  <option key={locality.id} value={String(locality.id)}>
                    {locality.name}
                  </option>
                ))}
              </select>
              <input type="hidden" name="city" value={selectedLocalityName} />
              <input
                type="hidden"
                name="locality_name"
                value={selectedLocalityName}
              />
            </Field>
          </div>
        </div>
      </CheckoutCard>

      <CheckoutCard title="Datos de contacto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field id="name" label="Nombre y apellido">
            <input
              id="name"
              name="name"
              type="text"
              required
              className={fieldClassName}
              defaultValue={initialData?.name || ""}
            />
          </Field>

          <Field id="email" label="Email">
            <input
              id="email"
              name="email"
              type="email"
              required
              className={fieldClassName}
              defaultValue={initialData?.email || ""}
            />
          </Field>

          <Field id="whatsapp" label="WhatsApp">
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              className={fieldClassName}
              defaultValue={initialData?.whatsapp || initialData?.phone || ""}
            />
          </Field>

          <Field id="cuit" label="Cuit o DNI">
            <input
              id="cuit"
              name="cuit"
              type="text"
              required
              className={fieldClassName}
              defaultValue={initialData?.cuit || ""}
            />
          </Field>
        </div>
      </CheckoutCard>
    </div>
  );
}
