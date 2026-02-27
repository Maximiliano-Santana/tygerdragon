import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TygerDragon",
  description: "Gestión de membresías",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-zinc-950 text-zinc-100 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
