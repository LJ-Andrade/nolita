"use server";

import { updateProfile, type CustomerSession } from "lib/vadmin/auth";
import { revalidatePath } from "next/cache";

export type ProfileFormState = {
  status: "idle" | "success" | "error";
  message: string;
  customer: CustomerSession | null;
};

export async function updateProfileAction(
  previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const result = await updateProfile(formData);

  if (!result.success) {
    return {
      ...previousState,
      status: "error",
      message: result.error || "No pudimos actualizar tu perfil.",
    };
  }

  revalidatePath("/perfil");

  return {
    status: "success",
    message: "Perfil actualizado correctamente.",
    customer: result.customer || previousState.customer,
  };
}
