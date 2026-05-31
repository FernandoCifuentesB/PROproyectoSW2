"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  description: string;
}[] = [
    {
      key: "PAYMENT_REQUEST_SENT",
      label: "Enviando solicitud segura a la pasarela",
      description:
        "Estamos preparando los datos de la compra y enviando la petición al servicio de pagos.",
    },
    {
      key: "PAYMENT_GATEWAY_RESPONSE_RECEIVED",
      label: "Validando respuesta del proveedor de pago",
      description:
        "La pasarela ya respondió y estamos revisando si el pago fue aprobado, rechazado o requiere análisis adicional.",
    },
    {
      key: "PAYMENT_AI_ANALYSIS_COMPLETED",
      label: "Generando respuesta inteligente personalizada",
      description:
        "El agente de IA está interpretando el resultado para mostrarte una respuesta clara y útil.",
    },
  ];
const STEP_ANIMATION_DELAY = 700;
export default function EventTicketPurchaseCard({ eventId, canBuy }: Props) {
  const router = useRouter();
  const { token } = useAuth();

  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [cardBrand, setCardBrand] = useState<CardBrand>("VISA");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");

  const [visibleStepIndex, setVisibleStepIndex] = useState(-1);
  const [completedStepIndex, setCompletedStepIndex] = useState(-1);
  const [failedStepIndex, setFailedStepIndex] = useState<number | null>(null);

  const [paymentFinalMessage, setPaymentFinalMessage] = useState("");
  const [paymentResult, setPaymentResult] = useState<PaymentFlowResult>(null);
  const [formMessage, setFormMessage] = useState("");

  const animationTimeoutsRef = useRef<number[]>([]);
  const finalAnimationStartedRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [eventId]);
  useEffect(() => {
    return () => {
      clearPaymentAnimationTimeouts();
    };
  }, []);
  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    const socket: Socket = io(socketUrl, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("payment-status", (event: PaymentSocketEvent) => {
      if (event.status === "PAYMENT_REQUEST_SENT") {
        showRequestStep();
        return;
      }

      if (event.status === "PAYMENT_GATEWAY_RESPONSE_RECEIVED") {
        showGatewayStep();
        return;
      }

      if (event.status === "PAYMENT_AI_ANALYSIS_COMPLETED") {
        showFinalAnimatedResult(event);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = socket;
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
  function clearPaymentAnimationTimeouts() {
    animationTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    animationTimeoutsRef.current = [];
  }

  function schedulePaymentAnimation(callback: () => void, delay: number) {
    const timeoutId = window.setTimeout(callback, delay);
    animationTimeoutsRef.current.push(timeoutId);
  }

  function showRequestStep() {
    if (finalAnimationStartedRef.current) return;

    setFormMessage("");
    setVisibleStepIndex(0);
    setCompletedStepIndex(-1);
    setFailedStepIndex(null);
    setPaymentFinalMessage("");
    setPaymentResult(null);
  }

  function showGatewayStep() {
    if (finalAnimationStartedRef.current) return;

    schedulePaymentAnimation(() => {
      setCompletedStepIndex(0);
      setVisibleStepIndex(1);
    }, STEP_ANIMATION_DELAY);
  }

  function showFinalAnimatedResult(event: PaymentSocketEvent) {
    clearPaymentAnimationTimeouts();

    finalAnimationStartedRef.current = true;

    const aiStatus = (event.data as { status?: string } | undefined)?.status;
    const result: PaymentFlowResult = aiStatus === "SUCCESS" ? "success" : "error";

    setFormMessage("");
    setPaymentFinalMessage("");
    setPaymentResult(null);
    setFailedStepIndex(null);

    setVisibleStepIndex(0);
    setCompletedStepIndex(-1);

    schedulePaymentAnimation(() => {
      setCompletedStepIndex(0);
      setVisibleStepIndex(1);
    }, STEP_ANIMATION_DELAY);

    schedulePaymentAnimation(() => {
      setCompletedStepIndex(1);
      setVisibleStepIndex(2);
    }, STEP_ANIMATION_DELAY * 2);

    schedulePaymentAnimation(() => {
      setPaymentResult(result);

      if (result === "success") {
        setCompletedStepIndex(2);
        setFailedStepIndex(null);
      } else {
        setFailedStepIndex(2);
      }

      setPaymentFinalMessage(event.message);
    }, STEP_ANIMATION_DELAY * 3);
  }

  function resetPaymentFlow() {
    clearPaymentAnimationTimeouts();

    finalAnimationStartedRef.current = false;

    setVisibleStepIndex(-1);
    setCompletedStepIndex(-1);
    setFailedStepIndex(null);

    setPaymentFinalMessage("");
    setPaymentResult(null);
    setFormMessage("");
  }

  function showFormError(message: string) {
    clearPaymentAnimationTimeouts();

    finalAnimationStartedRef.current = true;

    setVisibleStepIndex(0);
    setCompletedStepIndex(-1);
    setFailedStepIndex(0);

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
      const paymentTrackingId = crypto.randomUUID();

      socketRef.current?.emit("join-payment-room", {
        paymentTrackingId,
      });

      const result = await createTicketPurchase({
        eventTicketId: selectedId,
        quantity,
        provider: cardBrand,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cvv: cardBrand === "NU" ? cvv : undefined,
        paymentTrackingId,
      });

      /*
       * No se muestra mensaje intermedio.
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
    visibleStepIndex >= 0 || paymentFinalMessage || formMessage;

  const visiblePaymentSteps =
    visibleStepIndex >= 0
      ? PAYMENT_FLOW_STEPS.slice(0, visibleStepIndex + 1)
      : [];

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
              className={`rounded-xl border p-4 transition-all duration-500 ${paymentResult === "success"
                ? "border-green-100 bg-green-50"
                : paymentResult === "error"
                  ? "border-red-100 bg-red-50"
                  : "border-neutral-200 bg-neutral-50"
                }`}
            >
              <h3
                className={`text-sm font-semibold ${paymentResult === "success"
                  ? "text-green-950"
                  : paymentResult === "error"
                    ? "text-red-950"
                    : "text-neutral-800"
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
                  <div className="mt-4 space-y-4">
                    {visiblePaymentSteps.map((step, index) => {
                      const isFinalStep = step.key === "PAYMENT_AI_ANALYSIS_COMPLETED";
                      const isFailed = failedStepIndex === index;
                      const isCompleted = completedStepIndex >= index && !isFailed;
                      const isLoading = visibleStepIndex === index && !isCompleted && !isFailed;

                      return (
                        <div key={step.key} className="flex items-start gap-3">
                          <span
                            className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${isFailed
                              ? "bg-red-600 text-white"
                              : isCompleted
                                ? isFinalStep && paymentResult === "success"
                                  ? "bg-green-600 text-white"
                                  : "bg-blue-700 text-white"
                                : "bg-neutral-300 text-neutral-700"
                              }`}
                          >
                            {isFailed ? (
                              "X"
                            ) : isCompleted ? (
                              "✓"
                            ) : (
                              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-neutral-600" />
                            )}
                          </span>

                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold transition-all duration-300 ${isFailed
                                ? "text-red-900"
                                : isCompleted
                                  ? isFinalStep && paymentResult === "success"
                                    ? "text-green-900"
                                    : "text-blue-900"
                                  : "text-neutral-700"
                                }`}
                            >
                              {step.label}
                            </p>

                            <p
                              className={`mt-1 text-xs leading-relaxed transition-all duration-300 ${isFailed
                                ? "text-red-700"
                                : isCompleted
                                  ? isFinalStep && paymentResult === "success"
                                    ? "text-green-700"
                                    : "text-blue-700"
                                  : "text-neutral-500"
                                }`}
                            >
                              {isLoading
                                ? `${step.description} Procesando...`
                                : isFailed
                                  ? "Este paso no pudo completarse correctamente."
                                  : step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {paymentFinalMessage && (
                    <div
                      className={`mt-4 rounded-lg bg-white px-4 py-3 text-sm font-medium leading-relaxed transition-all duration-500 ${paymentResult === "success"
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