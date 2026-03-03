"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const role = user?.role;

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          QUE-BOLETA 🎫
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex gap-4 text-sm text-[var(--muted)]">
            <Link className="hover:text-white" href="/">
              Eventos
            </Link>

            {/* USER */}
            {token && role === "USER" ? (
              <Link className="hover:text-white" href="/me/favorites">
                Mis favoritos
              </Link>
            ) : null}

            {/* ADMIN */}
            {token && role === "ADMIN" ? (
              <>
                <Link className="hover:text-white" href="/admin/events">
                  Admin Eventos
                </Link>
                <Link className="hover:text-white" href="/admin/categories">
                  Admin Categorías
                </Link>
                <Link className="hover:text-white" href="/reports/top">
                  Top
                </Link>
              </>
            ) : null}
          </nav>

          {/* Derecha: invitado -> login/register | logueado -> rol + logout */}
          <div className="flex items-center gap-2">
            {!token ? (
              <>
                <Link href="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrate</Button>
                </Link>
              </>
            ) : (
              <>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold">
                  {role === "ADMIN" ? "ADMIN" : "USUARIO"}
                </span>

                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                >
                  Log out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}