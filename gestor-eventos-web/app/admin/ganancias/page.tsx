"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { EventItem } from "@/lib/types";
import { formatCop } from "@/lib/tickets";

type AdminSummary = {
  totalRevenue: number;
  activeEvents: number;
  pastEvents: number;
  registeredUsers: number;
};

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

export default function AdminGananciasPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token === null) return;
    if (!token) return router.push("/login");
    if (user?.role !== "ADMIN") return router.push("/");
  }, [token, user, router]);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;

    Promise.all([
      apiGet<EventItem[]>("/events"),
      apiGet<UsersReport>("/users/report"),
    ])
      .then(([events, usersReport]) => {
        const now = new Date();
        const totalRevenue = events.reduce((acc, event) => {
          const eventRevenue =
            event.eventTickets?.reduce(
              (ticketAcc, ticket) => ticketAcc + ticket.price * ticket.sold,
              0,
            ) ?? 0;

          return acc + eventRevenue;
        }, 0);

        setSummary({
          totalRevenue,
          activeEvents: events.filter(
            (event) => event.isActive && new Date(event.date) >= now,
          ).length,
          pastEvents: events.filter((event) => new Date(event.date) < now)
            .length,
          registeredUsers: usersReport.users.length,
        });
      })
      .catch((e: { message?: string }) => {
        console.error(e);
        setError(e?.message ?? "Error cargando el resumen de ganancias");
      });
  }, [token, user]);

  if (!token || user?.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600">
        Verificando acceso...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 px-6 py-8 text-white shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Ganancias
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">
          Resumen administrativo
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
          Consulta las ganancias totales, los eventos activos y pasados, y la
          cantidad de usuarios registrados.
        </p>
      </section>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Ganancias totales"
          value={summary ? formatCop(summary.totalRevenue) : "Cargando..."}
          tone="emerald"
          description="Acumulado vendido por todos los tipos de entrada."
        />
        <SummaryCard
          title="Eventos activos"
          value={summary ? String(summary.activeEvents) : "Cargando..."}
          tone="blue"
          description="Eventos activos con fecha futura o actual."
        />
        <SummaryCard
          title="Eventos pasados"
          value={summary ? String(summary.pastEvents) : "Cargando..."}
          tone="amber"
          description="Eventos cuya fecha ya paso."
        />
        <SummaryCard
          title="Usuarios registrados"
          value={summary ? String(summary.registeredUsers) : "Cargando..."}
          tone="slate"
          description="Usuarios con rol USER, sin contar admins."
        />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">
            Accesos rapidos
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Entra a las otras herramientas administrativas desde este resumen.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <QuickLink href="/admin/events" title="Administrar eventos">
              Crea, edita y revisa eventos disponibles.
            </QuickLink>
            <QuickLink href="/admin/categories" title="Administrar categorias">
              Organiza la clasificacion de la plataforma.
            </QuickLink>
            <QuickLink href="/admin/users" title="Ver usuarios">
              Consulta administradores y usuarios registrados.
            </QuickLink>
            <QuickLink href="/reports/top" title="Reportes de interes">
              Revisa los eventos con mas interacciones.
            </QuickLink>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Lectura rapida</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Ganancias</p>
              <p>Se calculan con ticket `price * sold` en cada evento.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Eventos activos</p>
              <p>Solo cuentan si siguen activos y la fecha no ha pasado.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Usuarios registrados</p>
              <p>Este total excluye cuentas administrativas.</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  tone: "emerald" | "blue" | "amber" | "slate";
}) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };

  return (
    <Card className={`rounded-3xl border p-6 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] opacity-80">
        {title}
      </p>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{description}</p>
    </Card>
  );
}

function QuickLink({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
    >
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </Link>
  );
}
