"use server";

import { checkout } from "lib/vadmin/cart";

export type CheckoutState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function completeOrder(
  _previousState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postal_code: formData.get("postal_code"),
    delivery_method_id: formData.get("delivery_method_id"),
    payment_method_id: formData.get("payment_method_id"),
  };

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
