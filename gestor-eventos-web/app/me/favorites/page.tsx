"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import EventCard from "@/components/events/EventCard";

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

  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "USER" && user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [token, user, router]);

  useEffect(() => {
    if (!token) return;

    apiGet<FavEvent[]>("/interests/me")
      .then(setItems)
      .catch((e: any) => {
        console.error(e);
        setError(e?.message ?? "Error cargando favoritos");
      });
  }, [token]);

  function handleInterestChange(payload: {
    eventId: string;
    interested: boolean;
  }) {
    if (!payload.interested) {
      setItems((prev) =>
        prev.filter((item) => item.eventId !== payload.eventId)
      );
    }
  }

  const mappedEvents = items.map((item) => ({
    id: item.eventId,
    name: item.name,
    description: item.description,
    date: item.date,
    price: item.price,
    imageUrl: item.imageUrl ?? null,
    category: item.category,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Mis favoritos</h1>
      <p className="text-sm text-[var(--muted)]">
        Eventos que marcaste como “Me interesa”.
      </p>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {mappedEvents.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          Aún no has marcado interés en ningún evento.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mappedEvents.map((ev) => (
            <EventCard
              key={ev.id}
              ev={ev}
              initialInterested={true}
              onInterestChange={handleInterestChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}