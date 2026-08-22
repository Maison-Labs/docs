import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Maison API Docs",
  description:
    "API reference and developer guides for the Maison standalone apps — every API follows the OpenAPI spec, grouped by app.",
};

/**
 * Applies the persisted theme before first paint — same mechanism and shared
 * "maison-theme" key as the portal and the monorepo login app.
 */
const themeBootstrap = `(function () {
  try {
    var cookie = document.cookie.match(/(?:^|;\\s*)maison-theme=([^;]*)/);
    var t = cookie ? decodeURIComponent(cookie[1]) : null;
    if (t !== "light" && t !== "dark") t = localStorage.getItem("maison-theme");
    if (t !== "light" && t !== "dark") {
      t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", t);
  } catch (_) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <TopBar />
        {children}
      </body>
    </html>
  );
}
