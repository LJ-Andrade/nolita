"use server";

import { checkout } from "lib/vadmin/cart";

export type CheckoutState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function completeOrder(
  _previousState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const localityName = getRequiredString(formData, "locality_name");
  const lines: { merchandiseId: string; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^lines\[(\d+)\]\[(merchandiseId|quantity)\]$/);
    if (!match || typeof value !== "string") continue;
    const index = Number(match[1]);
    lines[index] = lines[index] ?? { merchandiseId: "", quantity: 0 };
    if (match[2] === "quantity") {
      lines[index].quantity = Number(value);
    } else {
      lines[index].merchandiseId = value;
    }
  }

  const data = {
    name: getRequiredString(formData, "name"),
    email: getRequiredString(formData, "email"),
    phone: getRequiredString(formData, "phone"),
    whatsapp: getRequiredString(formData, "whatsapp"),
    cuit: getRequiredString(formData, "cuit"),
    address: getRequiredString(formData, "address"),
    city: getRequiredString(formData, "city") || localityName,
    postal_code: getRequiredString(formData, "postal_code"),
    province_id: getRequiredString(formData, "province_id"),
    locality_id: getRequiredString(formData, "locality_id"),
    delivery_method_id: getRequiredString(formData, "delivery_method_id"),
    payment_method_id: getRequiredString(formData, "payment_method_id"),
    coupon_code: getRequiredString(formData, "coupon_code") || undefined,
    price_mode: getRequiredString(formData, "price_mode") || "retail",
    lines: lines.filter((line) => line.merchandiseId && line.quantity > 0),
  };

  const requiredFields = [
    data.name,
    data.email,
    data.phone,
    data.whatsapp,
    data.cuit,
    data.address,
    data.postal_code,
    data.province_id,
    data.locality_id,
    data.delivery_method_id,
    data.payment_method_id,
  ];

  if (requiredFields.some((value) => !value)) {
    return {
      status: "error",
      message: "Completá todos los campos obligatorios.",
    };
  }

  const result = await checkout(data);

  if (result.success) {
    return {
      status: "success",
      message: result.message || "Checkout successful",
    };
  }

  return {
    status: "error",
    message: result.message || "No pudimos finalizar el pedido.",
  };
}

