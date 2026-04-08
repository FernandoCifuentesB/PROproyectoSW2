"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  return (
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
              <Link
                href="/login"
                className="rounded-full border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Iniciar sesion
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-blue-900 shadow transition hover:bg-yellow-300"
              >
                Registrarse
              </Link>
            </div>
          )}

          {token && (
            <div className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 font-bold text-blue-900">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </span>

                <span className="max-w-[120px] truncate">
                  {user?.name || "Usuario"}
                </span>

                {isAdmin && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-yellow-300">
                    Admin
                  </span>
                )}

                <span>v</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="bg-blue-950 px-4 py-4 text-white">
                    <p className="text-xs text-yellow-300">Bienvenido</p>
                    <p className="truncate text-base font-bold">
                      {user?.name || "Usuario"}
                    </p>
                    {isAdmin && (
                      <p className="mt-1 text-xs text-blue-100">
                        Administrador
                      </p>
                    )}
                  </div>

                  <div className="py-2">
                    <Link
                      href="/me"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => setOpen(false)}
                    >
                      Mi cuenta
                    </Link>

                    <Link
                      href="/me/favorites"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => setOpen(false)}
                    >
                      Mis favoritos
                    </Link>

                    <Link
                      href="/me/purchases"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => setOpen(false)}
                    >
                      Mis compras
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="my-2 border-t border-gray-200" />

                        <Link
                          href="/admin/ganancias"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                          onClick={() => setOpen(false)}
                        >
                          Ganancias
                        </Link>

                        <Link
                          href="/admin/events"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                          onClick={() => setOpen(false)}
                        >
                          Admin Eventos
                        </Link>

                        <Link
                          href="/admin/categories"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                          onClick={() => setOpen(false)}
                        >
                          Admin Categorias
                        </Link>

                        <Link
                          href="/reports/top"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                          onClick={() => setOpen(false)}
                        >
                          Top
                        </Link>

                        <Link
                          href="/admin/users"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                          onClick={() => setOpen(false)}
                        >
                          Usuarios
                        </Link>
                      </>
                    )}

                    <div className="my-2 border-t border-gray-200" />

                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
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
  );
}
