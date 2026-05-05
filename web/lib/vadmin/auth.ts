import { cookies } from "next/headers";
import { vadminFetch } from "./index";

export type CustomerSession = {
  id: number;
  name: string;
  dni: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  province_id: number | null;
  locality_id: number | null;
  avatar_url?: string | null;
};

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  try {
    const res = await vadminFetch<{ token: string; customer: any; expires_at: string; remember: boolean }>({
      path: "customer/login",
      method: "POST",
      body: { email, password, remember },
    });

    if (res.body.token) {
      const maxAge = remember ? 60 * 60 * 24 * 365 : undefined; // 1 year or session

      (await cookies()).set("auth_token", res.body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  } catch (e: any) {
    const errorMsg = e.message || e.error?.message || "Login failed";
    return { success: false, error: errorMsg };
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const dni = formData.get("dni") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;

  try {
    const res = await vadminFetch<{ token: string; customer: any }>({
      path: "customer/register",
      method: "POST",
      body: { name, dni, email, password, password_confirmation },
    });

    if (res.body.token) {
      (await cookies()).set("auth_token", res.body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      return { success: true };
    }
    return { success: false, error: "Registration failed" };
  } catch (e: any) {
    const errorMsg = e.message || e.error?.message || "Registration failed";
    return { success: false, error: errorMsg };
  }
}

export async function logout() {
  (await cookies()).delete("auth_token");
}

export async function getSession(): Promise<CustomerSession | null> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const res = await vadminFetch<CustomerSession>({
      path: "customer/me",
      method: "GET",
      cache: "no-store",
      silentStatuses: [401, 403, 404],
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.body;
  } catch (e) {
    return null;
  }
}

export async function updateProfile(formData: FormData) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { success: false, error: "Debes iniciar sesion." };

  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("password_confirmation") as string;

  const body: Record<string, string> = {
    name: formData.get("name") as string,
    dni: formData.get("dni") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    postal_code: formData.get("postal_code") as string,
    province_id: formData.get("province_id") as string,
    locality_id: formData.get("locality_id") as string,
  };

  if (password || passwordConfirmation) {
    body.password = password;
    body.password_confirmation = passwordConfirmation;
  }

  try {
    const res = await vadminFetch<CustomerSession>({
      path: "customer/me",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    return { success: true, customer: res.body };
  } catch (e: any) {
    const errorMsg = e.message || e.error?.message || "No pudimos actualizar tu perfil.";
    return { success: false, error: errorMsg };
  }
}
