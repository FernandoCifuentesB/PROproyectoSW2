import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/ui/Navbar";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QUE-BOLETA 🎫 - Gestor de Eventos",
  description: "Explora eventos y marca tus favoritos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}