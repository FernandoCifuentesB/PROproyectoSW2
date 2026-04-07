"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventTicketManager from "@/components/admin/EventTicketManager";
import { apiGet } from "@/lib/api";
import { EventItem } from "@/lib/types";

export default function AdminEventTicketsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setMessage("No se recibió el id del evento");
        setLoading(false);
        return;
      }

      try {
        const data = await apiGet<EventItem>(`/events/${eventId}`);
        setEvent(data);
      } catch (error: any) {
        setMessage(error.message || "No fue posible cargar el evento");
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
        No se encontró el parámetro eventId.
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