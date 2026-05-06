import { cookies } from "next/headers";
import { vadminFetch } from "./index";
import { Product } from "./types";

export async function getFavorites(): Promise<Product[]> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return [];

  try {
    const res = await vadminFetch<{ data: Product[] }>({
      path: "customer/favorites",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      silentStatuses: [401, 403, 404],
    });
    return res.body.data;
  } catch (e) {
    return [];
  }
}

export async function addFavorite(productId: string): Promise<boolean> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return false;

  try {
    await vadminFetch({
      path: "customer/favorites",
      method: "POST",
      body: { product_id: productId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function removeFavorite(productId: string): Promise<boolean> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return false;

  try {
    await vadminFetch({
      path: `customer/favorites/${productId}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return true;
  } catch (e) {
    return false;
  }
}
