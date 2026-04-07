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

type FavRow = { eventId: string };

export default function HomePage() {
  const { token } = useAuth();
  const router = useRouter();

  const [cats, setCats] = useState<Category[]>([]);
  const [data, setData] = useState<Paged<EventItem> | null>(null);
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
    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    return params.toString();
  }, [page, pageSize, search, categoryId]);

  useEffect(() => {
    apiGet<Category[]>("/categories").then(setCats).catch(console.error);
  }, []);

  useEffect(() => {
    apiGet<Paged<EventItem>>(`/events/public?${query}`).then(setData).catch(console.error);
  }, [query]);

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
    <div className="space-y-6">
      {/* Filtros */}
      <section className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-white/10 to-white/0 p-6">
        <h1 className="text-2xl font-extrabold">Encuentra tu próximo plan</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Filtra por categoría o nombre y revisa el detalle de cada evento con sus entradas disponibles.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Buscar eventos..."
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

      {/* Listado de eventos */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.items?.map((event) => {
          const minPrice = getMinTicketPrice(event);
          const isInterested = favSet.has(event.id);

          return (
            <Card key={event.id} className="flex h-full flex-col justify-between">
              <div className="space-y-3">
                {event.imageUrl ? (
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-500">
                    Sin imagen
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{event.name}</h2>
                  {isInterested && (
                    <span className="rounded-full border px-2 py-1 text-xs font-medium">
                      Guardado
                    </span>
                  )}
                </div>

                <p className="text-sm text-[var(--muted)]">
                  {event.category?.name || "Sin categoría"}
                </p>

                <p className="line-clamp-3 text-sm text-[var(--muted)]">
                  {event.description}
                </p>

                <div className="space-y-1 text-sm">
                  <p className="text-[var(--muted)]">
                    {new Date(event.date).toLocaleString("es-CO")}
                  </p>
                    <p className="font-semibold">
                      {minPrice !== null ? `Desde ${formatCop(minPrice)}` : "Precio por definir"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {event.isActive ? "Disponible" : "Evento inactivo"}
                    </p>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-4 flex flex-col gap-2">
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
                <Button
                  variant="primary"
                  onClick={() => handleBuy(event.id)}
                  className="w-full"
                >
                  Comprar
                </Button>
              </div>
            </Card>
          );
        })}

        {!data?.items?.length && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-[var(--muted)]">
              No se encontraron eventos con los filtros seleccionados.
            </p>
          </Card>
        )}
      </section>

      {/* Paginación */}
      <Card className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">
          Página {page} de {totalPages}
        </span>
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
      </Card>
    </div>
  );
}