"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
};

type UsersReport = {
  admins: UserRow[];
  users: UserRow[];
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [data, setData] = useState<UsersReport>({ admins: [], users: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [token, user, router]);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;

    apiGet<UsersReport>("/users/report")
      .then(setData)
      .catch((e: any) => {
        console.error(e);
        setError(e?.message ?? "Error cargando reporte de usuarios");
      });
  }, [token, user]);

  if (!token || user?.role !== "ADMIN") {
    return (
      <div className="p-6 text-sm text-[var(--muted)]">
        Verificando acceso...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)]">
          Reporte de usuarios registrados
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Consulta de administradores y usuarios registrados en la plataforma
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <h2 className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-500">
            Administradores
          </h2>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-12 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <div className="col-span-3">Nombre</div>
            <div className="col-span-5">Correo</div>
            <div className="col-span-2">Rol</div>
            <div className="col-span-2">Registro</div>
          </div>

          {data.admins.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">
              No hay administradores registrados.
            </div>
          ) : (
            data.admins.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-slate-50"
              >
                <div className="col-span-3 font-semibold">{u.name}</div>
                <div className="col-span-5 text-[var(--muted)]">{u.email}</div>
                <div className="col-span-2">
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-700">
                    ADMIN
                  </span>
                </div>
                <div className="col-span-2 text-[var(--muted)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <h2 className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-500">
            Usuarios
          </h2>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-12 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <div className="col-span-3">Nombre</div>
            <div className="col-span-5">Correo</div>
            <div className="col-span-2">Rol</div>
            <div className="col-span-2">Registro</div>
          </div>

          {data.users.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">
              No hay usuarios registrados.
            </div>
          ) : (
            data.users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-slate-50"
              >
                <div className="col-span-3 font-semibold">{u.name}</div>
                <div className="col-span-5 text-[var(--muted)]">{u.email}</div>
                <div className="col-span-2">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-700">
                    USER
                  </span>
                </div>
                <div className="col-span-2 text-[var(--muted)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}