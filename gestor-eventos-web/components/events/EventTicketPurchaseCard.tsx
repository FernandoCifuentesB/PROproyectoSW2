"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getEventTicketsPublic, createTicketPurchase } from "@/lib/ticket-api";
import { EventTicket } from "@/lib/types";
import { formatCop } from "@/lib/tickets";
import { useAuth } from "@/lib/auth";
import { CardBrand, isValidCardForBrand } from "@/lib/payment-api";

type Props = {
  eventId: string;
  canBuy: boolean;
};

type PaymentSocketStatus =
  | "PAYMENT_REQUEST_SENT"
  | "PAYMENT_GATEWAY_RESPONSE_RECEIVED"
  | "PAYMENT_AI_ANALYSIS_COMPLETED";

type PaymentSocketEvent = {
  purchaseId?: string;
  status: PaymentSocketStatus;
  message: string;
  data?: unknown;
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
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentSocketEvent[]>(
    [],
  );

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [eventId]);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

    const socket: Socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socket.on("payment-status", (event: PaymentSocketEvent) => {
      setPaymentStatuses((currentStatuses) => [...currentStatuses, event]);

      if (event.status === "PAYMENT_AI_ANALYSIS_COMPLETED") {
        setMessage(event.message);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
    setPaymentStatuses([]);

    try {
      const result = await createTicketPurchase({
        eventTicketId: selectedId,
        quantity,
        provider: cardBrand,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cvv: cardBrand === "NU" ? cvv : undefined,
      });

      if (!result.purchase) {
        setMessage(
          result.message ||
          "Compra rechazada por la pasarela de pagos. Estamos generando una respuesta personalizada...",
        );
        return;
      }

      setMessage(
        result.message ||
        "Compra aceptada. Estamos generando tu confirmación inteligente...",
      );

      setQuantity(1);
      setCardNumber("");
      setCvv("");

      await loadTickets();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No fue posible completar el pago";

      const safeMessage = errorMessage.includes("<!DOCTYPE html>")
        ? "No se pudo conectar correctamente con el backend o la pasarela de pagos."
        : errorMessage;

      setMessage(safeMessage);
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

          {paymentStatuses.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-950">
                Estado del proceso
              </h3>

              <ul className="mt-2 space-y-2">
                {paymentStatuses.map((statusEvent, index) => {
                  const isAiResult =
                    statusEvent.status === "PAYMENT_AI_ANALYSIS_COMPLETED";

                  return (
                    <li
                      key={`${statusEvent.status}-${index}`}
                      className={
                        isAiResult
                          ? "rounded-lg bg-white px-3 py-2 shadow-sm"
                          : ""
                      }
                    >
                      <p
                        className={
                          isAiResult
                            ? "text-sm font-semibold text-blue-950"
                            : "text-sm text-blue-900"
                        }
                      >
                        {isAiResult ? "Resultado inteligente: " : ""}
                        {statusEvent.message}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {message && (
            <p
              className={`rounded-xl px-4 py-3 text-sm ${message.toLowerCase().includes("rechazada") ||
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("no fue posible") ||
                message.toLowerCase().includes("no se pudo")
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
                }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Procesando pago..." : "Pagar y comprar"}
          </button>
        </form>
      )}
    </section>
  );
}