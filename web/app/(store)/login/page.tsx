import { PasswordInput } from "components/auth/password-input";
import { login } from "lib/vadmin/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const searchParams = await searchParamsPromise;

  async function action(formData: FormData) {
    "use server";
    const result = await login(formData);
    if (result.success) {
      redirect(searchParams.redirect || "/");
    }
    redirect(`/ingreso?error=${encodeURIComponent(result.error || "Error de inicio de sesión")}`);
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 
          className="mb-8 text-center text-4xl font-medium" 
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Bienvenido
        </h1>
        <form action={action} className="space-y-6">
          {searchParams.error && (
            <p className="text-center text-sm text-red-500">{searchParams.error}</p>
          )}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-500">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-500">
              Contraseña
            </label>
            <PasswordInput />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-black focus:ring-black"
              />
              <label htmlFor="remember" className="ml-2 block text-xs font-medium text-neutral-500 uppercase tracking-widest cursor-pointer">
                Recordarme
              </label>
            </div>
            {/* Future: Forgot password link */}
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-[12px] bg-black py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-neutral-500">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-bold text-black underline underline-offset-4">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
