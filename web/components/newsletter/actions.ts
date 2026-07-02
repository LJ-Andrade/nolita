"use server";

import { vadminFetch } from "lib/vadmin";

type SubscribeInput = {
  name: string;
  email: string;
  mode?: "minorista" | "mayorista" | "";
};

export async function subscribeToNewsletter({
  name,
  email,
  mode,
}: SubscribeInput): Promise<{ success: boolean; error?: string }> {
  try {
    await vadminFetch({
      path: "public/newsletter/subscribe",
      method: "POST",
      body: {
        name,
        email,
        customer_type: mode || null,
      },
      cache: "no-store",
      redirectOnServerError: false,
    });
    return { success: true };
  } catch (e: any) {
    console.error("Error subscribing to newsletter:", e);
    return {
      success: false,
      error: "No pudimos completar tu suscripción. Intentá nuevamente.",
    };
  }
}
