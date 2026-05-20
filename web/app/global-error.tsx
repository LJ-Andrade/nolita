"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          alignItems: "center",
          background: "#f7f3ef",
          color: "#111111",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "24px",
          textAlign: "center",
        }}
      >
        <main>
          <p style={{ fontSize: "12px", letterSpacing: "0.12em" }}>NOLITA</p>
          <h1 style={{ fontSize: "24px", fontWeight: 500 }}>
            Algo salio mal.
          </h1>
          <p style={{ color: "#555555", fontSize: "14px" }}>
            Estamos revisando el problema. Volve a intentar en unos minutos.
          </p>
        </main>
      </body>
    </html>
  );
}
