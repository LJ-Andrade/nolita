import { baseUrl } from "lib/utils";
import { ReactNode } from "react";
import "./globals.css";

const SITE_NAME = process.env.SITE_NAME || "PlanB";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  robots: {
    follow: true,
    index: true,
  },
  icons: {
    icon: "/iso-black.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Google Fonts — Playfair Display (serif) + Inter (sans) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
        />
      </head>
      <body style={{ backgroundColor: "var(--pb-bg)", color: "var(--pb-text)" }}>
        {children}
      </body>
    </html>
  );
}
