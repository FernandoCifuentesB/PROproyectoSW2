"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Category, EventItem, Paged } from "@/lib/types";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
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

  const [cats, setCats] = useState<Category[]>([]);
  const [data, setData] = useState<Paged<EventItem> | null>(null);
  const [topSold, setTopSold] = useState<TopSoldEvent[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

    return params.toString();
  }, [page, pageSize, search, categoryId]);

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

  const toggleInterest = async (eventId: string) => {
    if (!token) {
      router.push("/login");
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
      router.push("/login");
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
          Encuentra tu próximo plan
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
              Top 3 más vendidos
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Se muestran únicamente eventos activos.
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
                    src={event.imageUrl}
                    alt={event.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-blue-50 text-sm text-blue-900">
                    Sin imagen
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-blue-950">
                      #{index + 1} más vendido
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
              Aún no hay eventos vendidos para mostrar en el top.
            </div>
          )}
        </div>
      </section>

      <section className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-blue-950">Filtrar eventos</h2>
          <p className="mt-1 text-sm text-gray-600">
            Filtra por categoría o nombre y revisa el detalle de cada evento con
            sus entradas disponibles.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_280px_auto]">
          <Input
            placeholder="Buscar por nombre o descripción"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las categorías</option>
            {cats
              .filter((c) => c.isActive)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategoryId("");
              setPage(1);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data?.items?.map((event) => {
          const minPrice = getMinTicketPrice(event);
          const isInterested = favSet.has(event.id);

          return (
            <Card
              key={event.id}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 text-sm text-gray-500">
                  Sin imagen
                </div>
              )}

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                    {event.category?.name || "Sin categoría"}
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

                <p
                  className={`mt-2 text-sm font-medium ${
                    event.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {event.isActive ? "Disponible" : "Evento inactivo"}
                </p>

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
                      ? "✓ Me interesa"
                      : "Me interesa"}
                  </Button>

                  <Button onClick={() => handleBuy(event.id)} className="w-full">
                    Comprar
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
          Página {page} de {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ←
          </Button>

          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            →
          </Button>
        </div>
      </section>
    </main>
  );
}