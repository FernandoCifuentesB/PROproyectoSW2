"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import EventTicketPurchaseCard from "@/components/events/EventTicketPurchaseCard";
import { formatCop, getMinTicketPrice } from "@/lib/tickets";
import { EventItem } from "@/lib/types";
import Button from "@/components/ui/Button";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl p-6">Cargando...</main>}>
      <EventDetailContent />
    </Suspense>
  );
}

function EventDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId") ?? "";
  const { token } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interested, setInterested] = useState<boolean | null>(null);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setError("No se recibio el id del evento");
        setLoading(false);
        return;
      }
      try {
        const data = await apiGet<EventItem>(`/events/public/${eventId}`);
        setEvent(data);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "No fue posible cargar el evento"));
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    async function loadInterest() {
      if (!eventId || !token) {
        setInterested(null);
        return;
      }
      try {
        const list = await apiGet<{ eventId: string }[]>(`/interests/me`);
        const isFav = list.some((row) => row.eventId === eventId);
        setInterested(isFav);
      } catch {
        setInterested(null);
      }
    }
    loadInterest();
  }, [eventId, token]);

  const handleToggleInterest = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setInterestLoading(true);
    try {
      await apiPost("/interests/toggle", { eventId });
      setInterested((prev) => !prev);
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-6xl p-6">Cargando...</main>;
  }

  if (error) {
    return <main className="mx-auto max-w-6xl p-6">{error}</main>;
  }

  if (!event) {
    return <main className="mx-auto max-w-6xl p-6">Evento no encontrado</main>;
  }

  const minPrice = getMinTicketPrice(event);
  const isExpired = new Date(event.date) <= new Date();
  const hasAvailableTickets =
    event.eventTickets?.some(
      (ticket) => ticket.isActive && ticket.stock - ticket.sold > 0,
    ) ?? false;

  const canBuy = event.isActive && !isExpired && hasAvailableTickets;
  const unavailableReason = isExpired
    ? "Este evento ya finalizó y no está disponible para compra."
    : !event.isActive
      ? "Este evento se encuentra inactivo."
      : !hasAvailableTickets
        ? "Este evento no tiene boletas disponibles."
        : "";

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {event.imageUrl && (
          <div className="overflow-hidden rounded-2xl">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-64 w-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-semibold">{event.name}</h1>
        <p className="text-neutral-600">{event.description}</p>
        <p className="text-sm text-neutral-500">
          Fecha: {new Date(event.date).toLocaleString("es-CO")}
        </p>
        <p className="text-base font-medium">
          {minPrice !== null ? `Desde ${formatCop(minPrice)}` : "Precio por definir"}
        </p>

        <div className="flex flex-col gap-2 pt-4">
          <Button
            variant={interested ? "primary" : "outline"}
            onClick={handleToggleInterest}
            disabled={interestLoading || interested === null}
          >
            {interestLoading
              ? "Actualizando..."
              : interested
                ? "Ya me interesa"
                : "Me interesa"}
          </Button>
        </div>
      </section>

      <div className="space-y-3">
        {!canBuy && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-bold text-red-700">No disponible</p>
            <p className="mt-1 text-sm text-red-600">{unavailableReason}</p>
          </div>
        )}

        {canBuy && <EventTicketPurchaseCard eventId={event.id} canBuy={canBuy} />}
      </div>
    </main>
  );
}