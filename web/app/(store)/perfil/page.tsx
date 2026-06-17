import ProfileForm from "components/profile/profile-form";
import { getSession } from "lib/vadmin/auth";
import { getProvinces } from "lib/vadmin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Mi perfil",
  description: "Datos de cliente y cuenta.",
};

export default async function PerfilPage() {
  const session = await getSession();

  if (!session) {
    redirect("/ingreso?redirect=/perfil");
  }

  const provinces = await getProvinces();

  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-3 border-b border-bone pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-brown">
          Cuenta
        </p>
        <h1 className="font-serif text-4xl font-medium text-graphite">
          Mi perfil
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-brown">
          Revisa y actualiza tus datos personales para agilizar tus compras.
        </p>
      </div>

      <ProfileForm customer={session} provinces={provinces} />
    </div>
  );
}
