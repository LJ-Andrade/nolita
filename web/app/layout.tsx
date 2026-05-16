import { baseUrl } from "lib/utils";
import { ReactNode } from "react";
import "./globals.css";

const SITE_NAME = process.env.SITE_NAME || "Nolita";

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
    icon: "/favicon.png",
    apple: "/favicon180x180.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        style={{ backgroundColor: "var(--pb-bg)", color: "var(--pb-text)" }}
      >
        {children}
      </body>
    </html>
  );
}
