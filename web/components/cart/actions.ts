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

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined,
  quantity: number = 1
) {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    redirect("/login");
  }


  try {
    await addToCart([{ merchandiseId: selectedVariantId, quantity }]);
    updateTag(TAGS.cart);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT" || (e.digest && e.digest.startsWith("NEXT_REDIRECT"))) throw e;
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
  if (!token) {
    redirect("/login");
  }

  try {
    const items = variantIds.map((id) => ({ merchandiseId: id, quantity: 1 }));
    await addToCart(items);
    updateTag(TAGS.cart);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT" || (e.digest && e.digest.startsWith("NEXT_REDIRECT"))) throw e;
    return e.message || "Error al agregar los productos al carrito";
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
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
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }]);
    }

    updateTag(TAGS.cart);
  } catch (e: any) {
    if (e.message === "NEXT_REDIRECT" || (e.digest && e.digest.startsWith("NEXT_REDIRECT"))) throw e;
    return e.message || "Error al actualizar la cantidad";
  }
}

export async function redirectToCheckout() {
  redirect("/checkout");
}

