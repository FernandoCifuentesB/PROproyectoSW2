"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEventTicketsPublic, createTicketPurchase } from "@/lib/ticket-api";
import { EventTicket } from "@/lib/types";
import { formatCop } from "@/lib/tickets";
import { useAuth } from "@/lib/auth";

type Props = {
  eventId: string;
  canBuy: boolean;
};

export default function EventTicketPurchaseCard({ eventId, canBuy }: Props) {
  const router = useRouter();
  const { token } = useAuth();

  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [eventId]);

  async function loadTickets() {
    try {
      const data = await getEventTicketsPublic(eventId);
      setTickets(data || []);
    } catch {
      setTickets([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedId) {
      setMessage("Seleccione un tipo de entrada");
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const result = await createTicketPurchase({
        eventTicketId: selectedId,
        quantity,
      });

      setMessage(result.message || "Compra realizada correctamente");
      setQuantity(1);

      await loadTickets();

      // 🔥 REDIRECCIÓN A LA BOLETA
      router.push(`/me/purchases/${result.purchase.id}`);
    } catch (error: any) {
      setMessage(error.message || "No fue posible completar la compra");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Comprar entradas</h2>

      {!canBuy && (
        <p className="mt-4 text-sm text-red-600">
          Este evento no está disponible para compra.
        </p>
      )}

      {canBuy && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Selección de tipo de ticket */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Tipo de entrada
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
            >
              <option value="">Seleccione</option>
              {tickets
                .filter((t) => t.isActive)
                .map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.ticketType?.name} -{" "}
                    {formatCop(ticket.price)} (Disponibles:{" "}
                    {ticket.stock - ticket.sold})
                  </option>
                ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-black px-4 py-2 font-medium text-white"
          >
            {submitting ? "Procesando..." : "Comprar"}
          </button>

          {/* Mensaje */}
          {message && (
            <p className="text-sm text-center text-neutral-600">{message}</p>
          )}
        </form>
      )}
    </aside>
  );
}