"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Props = {
  ev: any;
  initialInterested?: boolean;
  onInterestChange?: (payload: {
    eventId: string;
    interested: boolean;
  }) => void;
};

export default function EventCard({
  ev,
  initialInterested = false,
  onInterestChange,
}: Props) {
  const { token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [interested, setInterested] = useState(initialInterested);

  useEffect(() => {
    setInterested(initialInterested);
  }, [initialInterested]);

  async function toggleInterest() {
    if (!token) {
      router.push("/login");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const data = await apiPost<{
        interested: boolean;
      }>("/interests/toggle", {
        eventId: ev.id,
      });

      setInterested(data.interested);

      onInterestChange?.({
        eventId: ev.id,
        interested: data.interested,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="group overflow-hidden p-0 transition hover:shadow-lg">
      {/* Imagen */}
      <div className="relative">
        <img
          src={ev.imageUrl || "https://picsum.photos/seed/event/900/540"}
          alt={ev.name}
          className="h-44 w-full object-cover"
        />

        {/* Categoría */}
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          {ev.category?.name ?? "Evento"}
        </div>

        {/* Overlay descripción */}
        <div className="absolute inset-0 flex items-end bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="p-4 text-sm text-white">
            {ev.description}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold">{ev.name}</h3>
            <p className="text-xs text-[var(--muted)]">
              {new Date(ev.date).toLocaleString()}
            </p>
          </div>

          <div className="text-sm font-semibold">
            ${ev.price.toLocaleString("es-CO")}
          </div>
        </div>

        {/* Botón */}
        <div className="mt-3">
          <Button
            onClick={toggleInterest}
            disabled={loading}
            variant={interested ? "primary" : "outline"}
            className="w-full"
          >
            {loading
              ? "Actualizando..."
              : interested
              ? "✓ Me interesa"
              : "Me interesa"}
          </Button>
        </div>
      </div>
    </Card>
  );
}