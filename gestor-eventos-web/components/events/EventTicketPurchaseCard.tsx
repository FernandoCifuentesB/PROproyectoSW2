"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getEventTicketsPublic, createTicketPurchase } from "@/lib/ticket-api";
import { EventTicket } from "@/lib/types";
import { formatCop } from "@/lib/tickets";
import { useAuth } from "@/lib/auth";
import {
  CardBrand,
  createPayment,
  isValidCardForBrand,
} from "@/lib/payment-api";

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

  const [cardBrand, setCardBrand] = useState<CardBrand>("VISA");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");

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

  const selectedTicket = useMemo(() => {
    return tickets.find((ticket) => ticket.id === selectedId);
  }, [tickets, selectedId]);

  const totalAmount = useMemo(() => {
    if (!selectedTicket) return 0;
    return selectedTicket.price * quantity;
  }, [selectedTicket, quantity]);

  function formatCardNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatCvv(value: string) {
    return value.replace(/\D/g, "").slice(0, 4);
  }

  function getCardPlaceholder() {
    if (cardBrand === "VISA") return "4111 1111 1111 1111";
    if (cardBrand === "MASTERCARD") return "5111 1111 1111 1118";
    return "4111 1111 1111 1111";
  }

  function getBrandValidationMessage() {
    if (cardBrand === "VISA") {
      return "La tarjeta Visa debe iniciar por 4";
    }

    if (cardBrand === "MASTERCARD") {
      return "La tarjeta Mastercard debe iniciar entre 51-55 o 2221-2720";
    }

    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedId || !selectedTicket) {
      setMessage("Seleccione un tipo de entrada");
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    if (!cardNumber.trim()) {
      setMessage("Ingrese el número de tarjeta");
      return;
    }

    if (cardBrand !== "NU" && !isValidCardForBrand(cardNumber, cardBrand)) {
      setMessage(getBrandValidationMessage());
      return;
    }

    if (cardBrand === "NU" && !cvv.trim()) {
      setMessage("Ingrese el CVV para pagar con Nu");
      return;
    }

    if (cardBrand === "NU" && !/^\d{3,4}$/.test(cvv)) {
      setMessage("El CVV debe tener 3 o 4 dígitos");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      await createPayment({
        externalRef: `event-${eventId}-ticket-${selectedId}-${Date.now()}`,
        idempotencyKey,
        provider: cardBrand,
        cardNumber,
        cvv: cardBrand === "NU" ? cvv : undefined,
        amount: totalAmount,
      });

      const result = await createTicketPurchase({
        eventTicketId: selectedId,
        quantity,
      });

      setMessage("Pago aprobado y compra realizada correctamente");
      setQuantity(1);
      setCardNumber("");
      setCvv("");

      await loadTickets();

      router.push("/me/purchases");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No fue posible completar el pago",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-neutral-900">Comprar entradas</h2>

      {!canBuy && (
        <p className="mt-3 text-sm text-red-600">
          Este evento no está disponible para compra.
        </p>
      )}

      {canBuy && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-neutral-700">
            Tipo de entrada
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
            >
              <option value="">Seleccione</option>

              {tickets
                .filter((ticket) => ticket.isActive)
                .map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.ticketType?.name} - {formatCop(ticket.price)}{" "}
                    (Disponibles: {ticket.stock - ticket.sold})
                  </option>
                ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            Cantidad
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
            />
          </label>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="font-semibold text-neutral-900">Datos de pago</h3>

            <label className="mt-3 block text-sm font-medium text-neutral-700">
              Tipo de tarjeta
              <select
                value={cardBrand}
                onChange={(e) => {
                  setCardBrand(e.target.value as CardBrand);
                  setCvv("");
                }}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
              >
                <option value="VISA">Visa</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="NU">Nu</option>
              </select>
            </label>

            <label className="mt-3 block text-sm font-medium text-neutral-700">
              Número de tarjeta
              <input
                type="text"
                inputMode="numeric"
                placeholder={getCardPlaceholder()}
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
              />
            </label>

            {cardBrand === "NU" && (
              <label className="mt-3 block text-sm font-medium text-neutral-700">
                CVV
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="890"
                  value={cvv}
                  onChange={(e) => setCvv(formatCvv(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
                />
              </label>
            )}

            <p className="mt-3 text-sm text-neutral-600">
              Total a pagar:{" "}
              <span className="font-semibold text-neutral-900">
                {formatCop(totalAmount)}
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Procesando pago..." : "Pagar y comprar"}
          </button>

          {message && (
            <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
              {message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}