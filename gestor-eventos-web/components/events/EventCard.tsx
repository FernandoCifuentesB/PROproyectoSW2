"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCop, getMinTicketPrice } from "@/lib/tickets";

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
      const data = await apiPost<{ interested: boolean }>("/interests/toggle", {
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

  function goToBuy() {
    if (!token) {
      router.push("/login");
      return;
    }

    router.push(`/event-detail?eventId=${ev.id}`);
  }

  const minPrice = getMinTicketPrice(ev);

  return (
    <Card className="group overflow-hidden p-0 transition hover:shadow-lg">
      <div className="relative">
        <img
          src={ev.imageUrl || "https://picsum.photos/seed/event/900/540"}
          alt={ev.name}
          className="h-44 w-full object-cover"
        />

        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          {ev.category?.name ?? "Evento"}
        </div>

        <div className="absolute inset-0 flex items-end bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="p-4 text-sm text-white">{ev.description}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold">{ev.name}</h3>
            <p className="text-xs text-[var(--muted)]">
              {new Date(ev.date).toLocaleString()}
            </p>
          </div>

          <div className="text-sm font-semibold">
            {minPrice !== null
              ? `Desde ${formatCop(minPrice)}`
              : ev.price !== null && ev.price !== undefined
              ? formatCop(ev.price)
              : "Precio por definir"}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          
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

          <Button onClick={goToBuy} className="w-full">
            Comprar entrada
          </Button>
        </div>
      </div>
    </Card>
  );
}