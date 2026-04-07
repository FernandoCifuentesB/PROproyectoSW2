"use client";

import { useEffect, useState } from "react";
import { createTicketPurchase, getEventTicketsPublic } from "@/lib/ticket-api";
import { EventTicket } from "@/lib/types";
import { formatCop, getAvailableStock, isTicketSoldOut } from "@/lib/tickets";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type Props = {
  eventId: string;
  canBuy?: boolean;
};

export default function EventTicketPurchaseCard({ eventId, canBuy = true }: Props) {
  const { token } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadTickets() {
    setLoading(true);
    setMessage("");
    try {
      const data = await getEventTicketsPublic(eventId);
      setTickets(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (error: any) {
      setMessage(error.message || "No fue posible cargar las entradas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [eventId]);

  const selected = tickets.find((item) => item.id === selectedId);
  const available = selected ? getAvailableStock(selected) : 0;

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
    } catch (error: any) {
      setMessage(error.message || "No fue posible completar la compra");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold">Entradas disponibles</h3>
        <p className="text-sm text-neutral-600">
          Seleccione el tipo de entrada y la cantidad.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando entradas...</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay entradas disponibles para este evento.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const soldOut = isTicketSoldOut(ticket);
              return (
                <label
                  key={ticket.id}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4 ${
                    selectedId === ticket.id ? "border-black" : "border-neutral-200"
                  } ${soldOut ? "opacity-60" : ""}`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="eventTicket"
                      checked={selectedId === ticket.id}
                      onChange={() => setSelectedId(ticket.id)}
                      disabled={soldOut}
                    />
                    <div>
                      <div className="font-medium">
                        {ticket.ticketType?.name || "Entrada"}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {formatCop(ticket.price)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    {soldOut ? (
                      <span className="font-medium text-red-600">Agotado</span>
                    ) : (
                      <span>{getAvailableStock(ticket)} disponibles</span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="space-y-1">
              <span className="text-sm font-medium">Cantidad</span>
              <input
                type="number"
                min={1}
                max={available || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border px-3 py-2"
                disabled={!canBuy || !selected || available <= 0}
              />
            </label>

            {selected && (
              <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm">
                Total estimado:{" "}
                <strong>{formatCop(selected.price * quantity)}</strong>
              </div>
            )}

            <Button
              type="submit"
              disabled={!canBuy || !selected || available <= 0 || submitting}
              className="w-full"
            >
              {submitting ? "Procesando..." : "Comprar entradas"}
            </Button>
          </form>
        </>
      )}

      {message && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
          {message}
        </div>
      )}
    </section>
  );
}