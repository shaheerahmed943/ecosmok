import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoSmok | Premium Vapes & E-Liquids",
  description: "Shop premium disposable vapes, pod kits, e-liquids and accessories in the UK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
