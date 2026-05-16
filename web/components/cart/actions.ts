"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  checkout,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/vadmin/cart";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function isAuthFailure(error: any) {
  return (
    error?.status === 401 ||
    error?.status === 403 ||
    error?.message?.toLowerCase() === "unauthenticated."
  );
}

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined,
  quantity: number = 1
) {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  const token = (await cookies()).get("auth_token")?.value;
  const priceMode = (await cookies()).get("nolita_price_mode")?.value === "wholesale" ? "wholesale" : "retail";
  if (!token) {
    return;
  }


  try {
    await addToCart([{ merchandiseId: selectedVariantId, quantity }], priceMode);
    updateTag(TAGS.cart);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT" || (e.digest && e.digest.startsWith("NEXT_REDIRECT"))) throw e;
    if (isAuthFailure(e)) return;
    return e.message || "Error al agregar el producto al carrito";
  }
}

export async function addMultipleItems(
  prevState: any,
  variantIds: string[]
) {
  if (!variantIds || variantIds.length === 0) {
    return "Error adding items to cart: No variants provided";
  }

  const token = (await cookies()).get("auth_token")?.value;
  const priceMode = (await cookies()).get("nolita_price_mode")?.value === "wholesale" ? "wholesale" : "retail";
  if (!token) {
    return;
  }

  try {
    const items = variantIds.map((id) => ({ merchandiseId: id, quantity: 1 }));
    await addToCart(items, priceMode);
    updateTag(TAGS.cart);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT" || (e.digest && e.digest.startsWith("NEXT_REDIRECT"))) throw e;
    if (isAuthFailure(e)) return;
    return e.message || "Error al agregar los productos al carrito";
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const priceMode = (await cookies()).get("nolita_price_mode")?.value === "wholesale" ? "wholesale" : "retail";
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId
    );

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id]);
      updateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT" || (e.digest && e.digest.startsWith("NEXT_REDIRECT"))) throw e;
    if (isAuthFailure(e)) return;
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  }
) {
  const { merchandiseId, quantity } = payload;
  const priceMode = (await cookies()).get("nolita_price_mode")?.value === "wholesale" ? "wholesale" : "retail";

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ], priceMode);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }], priceMode);
    }

    updateTag(TAGS.cart);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT" || (e.digest && e.digest.startsWith("NEXT_REDIRECT"))) throw e;
    if (isAuthFailure(e)) return;
    return e.message || "Error al actualizar la cantidad";
  }
}

export async function redirectToCheckout() {
  redirect("/finalizar-compra");
}

