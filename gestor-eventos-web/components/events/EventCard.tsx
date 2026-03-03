"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { EventItem } from "@/lib/types";
import { apiPost } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function EventCard({
  ev,
  initialInterested,
  onInterestChanged,
}: {
  ev: EventItem;
  initialInterested: boolean;
  onInterestChanged?: (next: boolean) => void;
}) {
  const { token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(ev.interestCount ?? 0);
  const [interested, setInterested] = useState(initialInterested);

  // ✅ sincroniza cuando cambie la página o el set de favoritos
  useEffect(() => {
    setInterested(initialInterested);
  }, [initialInterested]);

  async function toggleInterest() {
    if (!token) {
      alert("Debes iniciar sesión para marcar interés.");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost<{ interested: boolean; interestCount: number }>("/interests/toggle", {
        eventId: ev.id,
      });

      setInterested(data.interested);
      setCount(data.interestCount);
      onInterestChanged?.(data.interested);
    } catch (e) {
      console.error(e);
      alert("Error al marcar interés");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative">
        <img
          src={ev.imageUrl || "https://picsum.photos/seed/event/900/540"}
          alt={ev.name}
          className="h-44 w-full object-cover"
        />
        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          {ev.category?.name ?? "Evento"}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold">{ev.name}</h3>
            <p className="text-xs text-[var(--muted)]">{new Date(ev.date).toLocaleString()}</p>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold">${ev.price.toLocaleString("es-CO")}</div>
            <div className="text-xs text-[var(--muted)]">{count} interesados</div>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{ev.description}</p>

        <div className="mt-3">
          <Button
            onClick={toggleInterest}
            disabled={loading}
            variant={interested ? "primary" : "outline"}
            className="w-full"
          >
            {!token ? "Inicia sesión para interesarte" : interested ? "✓ Me interesa" : "Me interesa"}
          </Button>
        </div>
      </div>
    </Card>
  );
}