import { cookies } from "next/headers";
import { vadminFetch } from "./index";
import { Cart } from "./types";
import { TAGS } from "lib/constants";
import { unstable_cacheTag as cacheTag } from "next/cache";

/**
 * Get current cart.
 * In VADMIN, this requires authentication for now as we use Customers.
 * Later we can add guest support with a specific Cart ID.
 */
export async function getCart(): Promise<Cart | undefined> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return undefined;

  try {
    const res = await vadminFetch<Cart>({
      path: "customer/cart",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      silentStatuses: [401, 403, 404],
    });
    return res.body;
  } catch (e) {
    return undefined;
  }
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart | undefined> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    // Redirect to login or handle guest cart? 
    // For now, following "uses vadmin customers to login"
    return undefined;
  }

  // Next.js Commerce passes multiple lines potentially, 
  // but our VADMIN endpoint takes one at a time for now.
  // We'll process them.
  let lastCart: Cart | undefined;
  for (const line of lines) {
    const res = await vadminFetch<Cart>({
      path: "customer/cart",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        product_variant_id: line.merchandiseId,
        quantity: line.quantity,
      },
    });
    lastCart = res.body;
  }

  return lastCart;
}

export async function removeFromCart(lineIds: string[]): Promise<Cart | undefined> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return undefined;

  let lastCart: Cart | undefined;
  for (const id of lineIds) {
    const res = await vadminFetch<Cart>({
      path: `customer/cart/items/${id}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    lastCart = res.body;
  }
  return lastCart;
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart | undefined> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return undefined;

  let lastCart: Cart | undefined;
  for (const line of lines) {
    const res = await vadminFetch<Cart>({
      path: `customer/cart/items/${line.id}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        quantity: line.quantity,
      },
    });
    lastCart = res.body;
  }
  return lastCart;
}

export async function checkout(data?: any): Promise<{ success: boolean; message: string }> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    await vadminFetch({
      path: "customer/cart/checkout",
      method: "POST",
      redirectOnServerError: false,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });
    return { success: true, message: "Checkout successful" };
  } catch (e: any) {
    return { success: false, message: e.message || "Checkout failed" };
  }
}
