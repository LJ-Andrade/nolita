"use server";

import { addFavorite, removeFavorite, getFavorites } from "./favorites";
import { revalidatePath } from "next/cache";

export async function toggleFavoriteAction(productId: string, isFavorited: boolean): Promise<boolean> {
  const success = isFavorited
    ? await removeFavorite(productId)
    : await addFavorite(productId);

  if (success) {
    revalidatePath("/", "layout");
  }

  return success;
}

export async function getFavoriteIds(): Promise<Set<string>> {
  const favorites = await getFavorites();
  return new Set(favorites.map((p) => p.id));
}
