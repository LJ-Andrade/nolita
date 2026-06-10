import type { Metadata } from "next";

import Prose from "components/prose";
import { getSiteContent } from "lib/vadmin";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de Nolita",
};

export default async function TermsAndConditionsPage() {
  const content = await getSiteContent("home");
  const html = content.home_terms_and_conditions || "";

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-12 md:px-10 lg:px-16">
      <h1 className="mb-8 text-5xl font-bold">Términos y Condiciones</h1>
      <Prose className="mb-8" html={html} />
    </div>
  );
}
