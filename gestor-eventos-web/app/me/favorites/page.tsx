"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type FavEvent = {
  eventId: string;
  name: string;
  description: string;
  date: string;
  price: number;
  imageUrl?: string | null;
  category?: { id: string; name: string };
  interestCount: number;
  interestedAt: string;
};

export default function FavoritesPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<FavEvent[]>([]);
  const [error, setError] = useState("");

  // Guard user
  useEffect(() => {
    if (token === null) return;
    if (!token) return router.push("/login");
    if (user?.role !== "USER" && user?.role !== "ADMIN") return router.push("/");
  }, [token, user, router]);

  useEffect(() => {
    if (!token) return;
    apiGet<FavEvent[]>("/interests/me")
      .then(setItems)
      .catch((e: any) => setError(e?.message ?? "Error cargando favoritos"));
  }, [token]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Mis favoritos</h1>
      <p className="text-sm text-[var(--muted)]">Eventos que marcaste como “Me interesa”.</p>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {items.length === 0 ? (
        <Card className="text-sm text-[var(--muted)]">Aún no has marcado interés en ningún evento.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((ev) => (
            <Card key={ev.eventId} className="space-y-2">
              <div className="font-bold">{ev.name}</div>
              <div className="text-xs text-[var(--muted)]">{new Date(ev.date).toLocaleString()}</div>
              <div className="text-sm text-[var(--muted)] line-clamp-2">{ev.description}</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">{ev.category?.name ?? "—"}</span>
                <span className="font-semibold">${ev.price.toLocaleString("es-CO")}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}