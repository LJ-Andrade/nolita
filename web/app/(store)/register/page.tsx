import { register } from "lib/vadmin/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await searchParamsPromise;

  async function action(formData: FormData) {
    "use server";
    const result = await register(formData);
    if (result.success) {
      redirect("/");
    }
    redirect(`/registro?error=${encodeURIComponent(result.error || "Error al crear cuenta")}`);
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 
          className="mb-8 text-center text-4xl font-medium" 
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Crear Cuenta
        </h1>
        <form action={action} className="space-y-6">
          {searchParams.error && (
            <p className="text-center text-sm text-red-500">{searchParams.error}</p>
          )}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-500">
              Nombre Completo
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-500">
              DNI
            </label>
            <input
              name="dni"
              type="text"
              required
              pattern="[0-9]{8}"
              maxLength={8}
              title="El DNI debe tener exactamente 8 dígitos numéricos"
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              placeholder="12345678"
            />
          </div>
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
            <input
              name="password"
              type="password"
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-500">
              Confirmar Contraseña
            </label>
            <input
              name="password_confirmation"
              type="password"
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-[12px] bg-black py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/ingreso" className="font-bold text-black underline underline-offset-4">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
