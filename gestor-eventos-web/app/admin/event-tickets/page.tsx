"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventTicketManager from "@/components/admin/EventTicketManager";
import { apiGet } from "@/lib/api";
import { EventItem } from "@/lib/types";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function AdminEventTicketsPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl p-6">Cargando...</main>}>
      <AdminEventTicketsContent />
    </Suspense>
  );
}

function AdminEventTicketsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setMessage("No se recibio el id del evento");
        setLoading(false);
        return;
      }

      try {
        const data = await apiGet<EventItem>(`/events/${eventId}`);
        setEvent(data);
      } catch (error: unknown) {
        setMessage(getErrorMessage(error, "No fue posible cargar el evento"));
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  if (loading) {
    return <main className="mx-auto max-w-6xl p-6">Cargando...</main>;
  }

  if (!eventId) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        No se encontro el parametro eventId.
      </main>
    );
  }

  if (message) {
    return <main className="mx-auto max-w-6xl p-6">{message}</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <EventTicketManager eventId={eventId} eventName={event?.name} />
    </main>
  );
}
