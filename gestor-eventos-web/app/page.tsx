"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import { apiGet, apiPost, resolveApiAssetUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Category, EventItem, Paged } from "@/lib/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCop, getMinTicketPrice } from "@/lib/tickets";

type FavRow = {
  eventId: string;
};

type TopSoldEvent = EventItem & {
  soldCount: number;
};

export default function HomePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [data, setData] = useState<Paged<EventItem> | null>(null);
  const [topSold, setTopSold] = useState<TopSoldEvent[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const filterTypes: {
    id: "nombre" | "tipo" | "precio" | "fecha";
    label: string;
    icon: string;
  }[] = [
      { id: "nombre", label: "Nombre", icon: "🔎" },
      { id: "tipo", label: "Tipo", icon: "🏷️" },
      { id: "precio", label: "Precio", icon: "💰" },
      { id: "fecha", label: "Fecha", icon: "📅" },
    ];

  const pageSize = 6;

  const query = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    if (minPrice) {
      params.set("minPrice", minPrice);
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    }

    if (fromDate) {
      params.set("fromDate", fromDate);
    }

    if (toDate) {
      params.set("toDate", toDate);
    }

    return params.toString();
  }, [page, pageSize, search, categoryId, minPrice, maxPrice, fromDate, toDate]);

  useEffect(() => {
    apiGet<Category[]>("/categories").then(setCats).catch(console.error);
  }, []);

  useEffect(() => {
    apiGet<Paged<EventItem>>(`/events/public?${query}`)
      .then(setData)
      .catch(console.error);
  }, [query]);

  useEffect(() => {
    apiGet<TopSoldEvent[]>("/events/public/top-sold")
      .then(setTopSold)
      .catch(() => setTopSold([]));
  }, []);

  useEffect(() => {
    if (!token) {
      setFavSet(new Set());
      return;
    }

    apiGet<FavRow[]>("/interests/me")
      .then((rows) => setFavSet(new Set(rows.map((r) => r.eventId))))
      .catch(() => setFavSet(new Set()));
  }, [token]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setFromDate("");
    setToDate("");
    setPage(1);
    setActiveFilter(null);
  };
  const toggleInterest = async (eventId: string) => {
    if (!token) {
      setAuthTab("login");
      setAuthOpen(true);
      return;
    }

    setTogglingId(eventId);

    try {
      await apiPost("/interests/toggle", { eventId });
      setFavSet((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleBuy = (eventId: string) => {
    if (!token) {
      setAuthTab("login");
      setAuthOpen(true);
      return;
    }

    router.push(`/event-detail?eventId=${eventId}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-10 rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-6 py-8 text-white shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-300">
          Que Boleta
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">
          Encuentra tu proximo plan
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
          Descubre eventos activos, marca tus favoritos y compra tus entradas
          desde un solo lugar.
        </p>
      </section>

      <section className="mb-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-950">
              Top 3 mas vendidos
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Se muestran unicamente eventos activos.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {topSold.map((event, index) => {
            const minPrice = getMinTicketPrice(event);
            return (
              <Card
                key={event.id}
                className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm"
              >
                {event.imageUrl ? (
                  <img
                    src={resolveApiAssetUrl(event.imageUrl) || ""}
                    alt={event.name}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-event.svg";
                    }}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-neutral-100 text-sm text-neutral-500">
                    Sin imagen
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-blue-950">
                      #{index + 1} mas vendido
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {event.soldCount} entradas
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-blue-950">
                    {event.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {event.description}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    {new Date(event.date).toLocaleString("es-CO")}
                  </p>

                  <p className="mt-2 text-base font-semibold text-blue-900">
                    {minPrice !== null
                      ? `Desde ${formatCop(minPrice)}`
                      : "Precio por definir"}
                  </p>

                  <div className="mt-4">
                    <Button
                      onClick={() => handleBuy(event.id)}
                      className="w-full bg-blue-950 text-white hover:bg-blue-900"
                    >
                      Ver evento
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {!topSold.length && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600 md:col-span-3">
              Aun no hay eventos vendidos para mostrar en el top.
            </div>
          )}
        </div>
      </section>

      <Card className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-6 md:px-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-500">
            Buscar eventos
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-950">
                ¿Cómo quieres filtrar?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Selecciona un tipo de filtro y encuentra más rápido el evento que buscas.
              </p>
            </div>

            {activeFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Selector de tipo de filtro */}
        <div className="px-6 pt-6 md:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {filterTypes.map((filter) => {
              const isActive = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(isActive ? null : filter.id)}
                  className={`flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                    ? "border-blue-900 bg-blue-950 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
                    }`}
                >
                  <span className="text-base">{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área dinámica */}
        <div className="px-6 py-6 md:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">
            {!activeFilter && (
              <div className="flex min-h-[110px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 px-6 text-center">
                <p className="text-sm text-slate-400">
                  Selecciona un tipo de filtro para comenzar.
                </p>
              </div>
            )}

            {activeFilter === "nombre" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Buscar por nombre
                </label>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Ej: Festival de verano..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}

            {activeFilter === "tipo" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Categoría del evento
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Todos los tipos</option>
                  {cats.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeFilter === "precio" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rango de precio
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Precio mínimo
                    </label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Ej: 30000"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Precio máximo
                    </label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Ej: 150000"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeFilter === "fecha" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rango de fechas
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data?.items?.map((event) => {
          const minPrice = getMinTicketPrice(event);
          const isInterested = favSet.has(event.id);
          const isExpired = new Date(event.date).getTime() <= new Date().getTime();
          const isAvailable = event.isActive && !isExpired;

          return (
            <Card
              key={event.id}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              {event.imageUrl ? (
                <img
                  src={resolveApiAssetUrl(event.imageUrl) || ""}
                  alt={event.name}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-event.svg";
                  }}
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-neutral-100 text-sm text-neutral-500">
                  Sin imagen
                </div>
              )}

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                    {event.category?.name || "Sin categoria"}
                  </span>

                  {isInterested && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Guardado
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-blue-950">{event.name}</h3>

                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {event.description}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {new Date(event.date).toLocaleString("es-CO")}
                </p>

                <p className="mt-2 text-base font-semibold text-blue-900">
                  {minPrice !== null
                    ? `Desde ${formatCop(minPrice)}`
                    : "Precio por definir"}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {isAvailable ? "Disponible" : "No disponible"}
                </span>

                <div className="mt-5 grid gap-2">
                  <Button
                    variant={isInterested ? "primary" : "outline"}
                    onClick={() => toggleInterest(event.id)}
                    disabled={togglingId === event.id}
                    className="w-full"
                  >
                    {togglingId === event.id
                      ? "Actualizando..."
                      : isInterested
                        ? "Ya me interesa"
                        : "Me interesa"}
                  </Button>

                  <Button
                    onClick={() => handleBuy(event.id)}
                    disabled={!isAvailable}
                    className="w-full"
                  >
                    {isAvailable ? "Comprar" : "No disponible"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {!data?.items?.length && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600 md:col-span-2 xl:col-span-3">
            No se encontraron eventos con los filtros seleccionados.
          </div>
        )}
      </section>

      <section className="mt-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-gray-600">
          Pagina {page} de {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>

          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </section>

      <AuthModal
        open={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
      />
    </main>
  );
}
