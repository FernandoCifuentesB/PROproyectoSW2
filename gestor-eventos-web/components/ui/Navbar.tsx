"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const role = user?.role;
  const displayName = user?.name ?? "Usuario";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chipClasses = isAdmin
    ? "border-purple-500/40 bg-purple-500/15 text-purple-700"
    : "border-blue-500/40 bg-blue-500/15 text-blue-700";

  function linkClass(path: string) {
    const active =
      pathname === path || (path !== "/" && pathname.startsWith(path));

    return [
      "relative pb-2 text-sm transition-all duration-200",
      active
        ? "text-[var(--fg)] font-semibold text-base after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:rounded-full after:bg-[var(--primary)]"
        : "text-[var(--muted)] hover:text-[var(--fg)]",
    ].join(" ");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          QUE-BOLETA 🎫
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Link className={linkClass("/")} href="/">
              Eventos
            </Link>

            {token && role === "USER" ? (
              <Link className={linkClass("/me/favorites")} href="/me/favorites">
                Mis favoritos
              </Link>
            ) : null}

            {token && role === "ADMIN" ? (
              <>
                <Link
                  className={linkClass("/admin/events")}
                  href="/admin/events"
                >
                  Admin Eventos
                </Link>
                <Link
                  className={linkClass("/admin/categories")}
                  href="/admin/categories"
                >
                  Admin Categorías
                </Link>
                <Link
                  className={linkClass("/reports/top")}
                  href="/reports/top"
                >
                  Top
                </Link>
                <Link
                  className={linkClass("/admin/users")}
                  href="/admin/users"
                >
                  Usuarios
                </Link>
              </>
            ) : null}
          </nav>

          <div className="relative" ref={menuRef}>
            {!token ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button>Regístrate</Button>
                </Link>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setOpen((prev) => !prev)}
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-2 text-sm font-semibold transition hover:brightness-95",
                    chipClasses,
                  ].join(" ")}
                >
                  <span className="max-w-[110px] truncate">{displayName}</span>
                </button>

                {open ? (
                  <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-xl">
                    <div
                      className={[
                        "px-5 py-5",
                        isAdmin ? "bg-purple-50" : "bg-blue-50",
                      ].join(" ")}
                    >
                      <div className="mb-3 flex justify-center">
                        <div
                          className={[
                            "flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold",
                            isAdmin
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700",
                          ].join(" ")}
                        >
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="font-bold text-[var(--fg)]">
                          {displayName}
                        </div>
                        <div className="mt-1 break-all text-sm text-[var(--muted)]">
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/"
                        className="block rounded-2xl px-4 py-3 text-sm text-[var(--fg)] hover:bg-slate-50"
                        onClick={() => setOpen(false)}
                      >
                        Eventos
                      </Link>

                      {role === "USER" ? (
                        <Link
                          href="/me/favorites"
                          className="block rounded-2xl px-4 py-3 text-sm text-[var(--fg)] hover:bg-slate-50"
                          onClick={() => setOpen(false)}
                        >
                          Mis favoritos
                        </Link>
                      ) : null}

                      {role === "ADMIN" ? (
                        <>
                          <Link
                            href="/admin/events"
                            className="block rounded-2xl px-4 py-3 text-sm text-[var(--fg)] hover:bg-slate-50"
                            onClick={() => setOpen(false)}
                          >
                            Admin Eventos
                          </Link>
                          <Link
                            href="/admin/categories"
                            className="block rounded-2xl px-4 py-3 text-sm text-[var(--fg)] hover:bg-slate-50"
                            onClick={() => setOpen(false)}
                          >
                            Admin Categorías
                          </Link>
                          <Link
                            href="/reports/top"
                            className="block rounded-2xl px-4 py-3 text-sm text-[var(--fg)] hover:bg-slate-50"
                            onClick={() => setOpen(false)}
                          >
                            Top
                          </Link>
                          <Link
                            href="/admin/users"
                            className="block rounded-2xl px-4 py-3 text-sm text-[var(--fg)] hover:bg-slate-50"
                            onClick={() => setOpen(false)}
                          >
                            Usuarios
                          </Link>
                        </>
                      ) : null}

                      <div className="my-2 border-t border-[var(--border)]" />

                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          logout();
                          window.location.href = "/";
                        }}
                        className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}