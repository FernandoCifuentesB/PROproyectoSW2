"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/auth/AuthModal";

export default function Navbar() {
  const { token, user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const menuRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = user?.role === "ADMIN";

  function handleOpenLogin() {
    setAuthTab("login");
    setAuthOpen(true);
  }

  function handleOpenRegister() {
    setAuthTab("register");
    setAuthOpen(true);
  }

  function handleCloseAuth() {
    setAuthOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-blue-900 bg-blue-950 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow">
              <Image
                src="/favicon.ico"
                alt="Que Boleta"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold text-white">
                Que Boleta
              </span>
              <span className="text-xs text-yellow-300">
                Vive los mejores eventos
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 md:gap-3">
            <Link
              href="/"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Eventos
            </Link>

            {token && isAdmin && (
              <>
                <Link
                  href="/admin/ganancias"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Ganancias
                </Link>

                <Link
                  href="/admin/events"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Admin Eventos
                </Link>

                <Link
                  href="/admin/categories"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Admin Categorias
                </Link>

                <Link
                  href="/admin/reports/event-sales"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Reporte de entradas
                </Link>

                <Link
                  href="/reports/top"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Top
                </Link>

                <Link
                  href="/admin/users"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Usuarios
                </Link>
              </>
            )}

            {!token && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="rounded-full border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Iniciar sesion
                </button>

                <button
                  type="button"
                  onClick={handleOpenRegister}
                  className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-blue-900 shadow transition hover:bg-yellow-300"
                >
                  Registrarse
                </button>
              </div>
            )}

            {token && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full bg-blue-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 font-bold text-blue-900 shadow-sm">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </span>

                  <span className="max-w-[140px] truncate text-sm font-semibold">
                    {user?.name || "Usuario"}
                  </span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                    <div className="bg-blue-950 px-5 py-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
                        Bienvenido
                      </p>
                      <p className="mt-1 truncate text-xl font-bold">
                        {user?.name || "Usuario"}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/me"
                        className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                        onClick={() => setOpen(false)}
                      >
                        Mi cuenta
                      </Link>

                      <Link
                        href="/me/favorites"
                        className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                        onClick={() => setOpen(false)}
                      >
                        Mis favoritos
                      </Link>

                      <Link
                        href="/me/purchases"
                        className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                        onClick={() => setOpen(false)}
                      >
                        Mis compras
                      </Link>

                      {isAdmin && (
                        <>
                          <div className="my-2 border-t border-gray-200" />

                          <Link
                            href="/admin/ganancias"
                            className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                            onClick={() => setOpen(false)}
                          >
                            Ganancias
                          </Link>

                          <Link
                            href="/admin/events"
                            className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                            onClick={() => setOpen(false)}
                          >
                            Admin Eventos
                          </Link>

                          <Link
                            href="/admin/categories"
                            className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                            onClick={() => setOpen(false)}
                          >
                            Admin Categorias
                          </Link>

                          <Link
                            href="/admin/reports/event-sales"
                            className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                            onClick={() => setOpen(false)}
                          >
                            Reporte de entradas
                          </Link>

                          <Link
                            href="/reports/top"
                            className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                            onClick={() => setOpen(false)}
                          >
                            Top
                          </Link>

                          <Link
                            href="/admin/users"
                            className="block px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                            onClick={() => setOpen(false)}
                          >
                            Usuarios
                          </Link>
                        </>
                      )}

                      <div className="my-2 border-t border-gray-200" />

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        className="block w-full px-5 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Cerrar sesion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        defaultTab={authTab}
        onClose={handleCloseAuth}
      />
    </>
  );
}