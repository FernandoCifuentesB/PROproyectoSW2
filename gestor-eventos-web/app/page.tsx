"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { Category, EventItem, Paged } from "@/lib/types";
import EventCard from "@/components/events/EventCard";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [data, setData] = useState<Paged<EventItem> | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

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

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-white/10 to-white/0 p-6">
        <h1 className="text-2xl font-extrabold">Encuentra tu próximo plan </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Filtra por tipo de evento por categoría o nombre, según los que te interesan.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input placeholder="Buscar eventos..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.items?.map((ev) => (
          <EventCard key={ev.id} ev={ev} />
        ))}
      </section>

      <Card className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">
          Página {page} de {totalPages}
        </span>

        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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