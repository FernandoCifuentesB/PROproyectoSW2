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

type PaymentFlowStep =
  | "PAYMENT_REQUEST_SENT"
  | "PAYMENT_GATEWAY_RESPONSE_RECEIVED"
  | "PAYMENT_AI_ANALYSIS_COMPLETED";

type PaymentFlowResult = "success" | "error" | null;

const PAYMENT_FLOW_STEPS: {
  key: PaymentFlowStep;
  label: string;
}[] = [
  {
    key: "PAYMENT_REQUEST_SENT",
    label: "Enviando petición a la pasarela de pagos",
  },
  {
    key: "PAYMENT_GATEWAY_RESPONSE_RECEIVED",
    label: "Respuesta recibida desde la pasarela de pagos",
  },
  {
    key: "PAYMENT_AI_ANALYSIS_COMPLETED",
    label: "Análisis inteligente completado",
  },
];

export default function EventTicketPurchaseCard({ eventId, canBuy }: Props) {
  const router = useRouter();
  const { token } = useAuth();

  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [cardBrand, setCardBrand] = useState<CardBrand>("VISA");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");

  const [paymentFlowStep, setPaymentFlowStep] =
    useState<PaymentFlowStep | null>(null);

  const [paymentFinalMessage, setPaymentFinalMessage] = useState("");
  const [paymentResult, setPaymentResult] = useState<PaymentFlowResult>(null);
  const [formMessage, setFormMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [eventId]);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    const socket: Socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socket.on("payment-status", (event: PaymentSocketEvent) => {
      setFormMessage("");
      setPaymentFlowStep(event.status);

      if (event.status === "PAYMENT_AI_ANALYSIS_COMPLETED") {
        setPaymentFinalMessage(event.message);

        const aiStatus = (event.data as { status?: string } | undefined)
          ?.status;

        setPaymentResult(aiStatus === "SUCCESS" ? "success" : "error");
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

  const currentStepIndex = useMemo(() => {
    if (!paymentFlowStep) return -1;

    return PAYMENT_FLOW_STEPS.findIndex(
      (step) => step.key === paymentFlowStep,
    );
  }, [paymentFlowStep]);

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

  function resetPaymentFlow() {
    setPaymentFlowStep(null);
    setPaymentFinalMessage("");
    setPaymentResult(null);
    setFormMessage("");
  }

  function showFormError(message: string) {
    setPaymentFlowStep(null);
    setPaymentFinalMessage("");
    setPaymentResult("error");
    setFormMessage(message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    resetPaymentFlow();

    if (!selectedId || !selectedTicket) {
      showFormError("Seleccione un tipo de entrada");
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    if (!cardNumber.trim()) {
      showFormError("Ingrese el número de tarjeta");
      return;
    }

    if (cardBrand !== "NU" && !isValidCardForBrand(cardNumber, cardBrand)) {
      showFormError(getBrandValidationMessage());
      return;
    }

    if (cardBrand === "NU" && !cvv.trim()) {
      showFormError("Ingrese el CVV para pagar con Nu");
      return;
    }

    if (cardBrand === "NU" && !/^\d{3,4}$/.test(cvv)) {
      showFormError("El CVV debe tener 3 o 4 dígitos");
      return;
    }

    setSubmitting(true);

    try {
      const result = await createTicketPurchase({
        eventTicketId: selectedId,
        quantity,
        provider: cardBrand,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cvv: cardBrand === "NU" ? cvv : undefined,
      });

      /*
       * No se muestra un mensaje intermedio aquí.
       * El resultado final se muestra únicamente cuando llega
       * PAYMENT_AI_ANALYSIS_COMPLETED por WebSocket.
       */
      if (result.purchase) {
        setQuantity(1);
        setCardNumber("");
        setCvv("");
        await loadTickets();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No fue posible completar el pago";

      const safeMessage = errorMessage.includes("<!DOCTYPE html>")
        ? "No se pudo conectar correctamente con el backend o la pasarela de pagos."
        : errorMessage;

      showFormError(safeMessage);
    } finally {
      setSubmitting(false);
    }
  }

  const shouldShowPaymentFlow =
    paymentFlowStep !== null || paymentFinalMessage || formMessage;

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

          {shouldShowPaymentFlow && (
            <div
              className={`rounded-xl border p-4 transition-all duration-500 ${
                paymentResult === "success"
                  ? "border-green-100 bg-green-50"
                  : paymentResult === "error"
                    ? "border-red-100 bg-red-50"
                    : "border-blue-100 bg-blue-50"
              }`}
            >
              <h3
                className={`text-sm font-semibold ${
                  paymentResult === "success"
                    ? "text-green-950"
                    : paymentResult === "error"
                      ? "text-red-950"
                      : "text-blue-950"
                }`}
              >
                Estado del proceso
              </h3>

              {formMessage ? (
                <div className="mt-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-red-700">
                  {formMessage}
                </div>
              ) : (
                <>
                  <div className="mt-3 space-y-3">
                    {PAYMENT_FLOW_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.key} className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                              isCompleted
                                ? paymentResult === "success" &&
                                  step.key === "PAYMENT_AI_ANALYSIS_COMPLETED"
                                  ? "bg-green-600 text-white"
                                  : paymentResult === "error" &&
                                      step.key ===
                                        "PAYMENT_AI_ANALYSIS_COMPLETED"
                                    ? "bg-red-600 text-white"
                                    : "bg-blue-700 text-white"
                                : "bg-neutral-200 text-neutral-500"
                            }`}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </span>

                          <p
                            className={`text-sm transition-all duration-300 ${
                              isCompleted
                                ? paymentResult === "success"
                                  ? "text-green-900"
                                  : paymentResult === "error"
                                    ? "text-red-900"
                                    : "text-blue-900"
                                : "text-neutral-400"
                            } ${isCurrent ? "font-semibold" : ""}`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {paymentFinalMessage && (
                    <div
                      className={`mt-4 rounded-lg bg-white px-4 py-3 text-sm font-medium transition-all duration-500 ${
                        paymentResult === "success"
                          ? "text-green-800"
                          : "text-red-700"
                      }`}
                    >
                      {paymentFinalMessage}
                    </div>
                  )}
                </>
              )}
            </div>
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