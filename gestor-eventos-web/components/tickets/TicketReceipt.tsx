"use client";

import { QRCodeSVG } from "qrcode.react";
import { TicketPurchase } from "@/lib/types";
import { formatCop } from "@/lib/tickets";

type Props = {
  purchase: TicketPurchase;
  index?: number;
  showDivider?: boolean;
};

export default function TicketReceipt({
  purchase,
  index,
  showDivider = false,
}: Props) {
  const eventName = purchase.event?.name || "Evento";
  const eventDate = purchase.event?.date
    ? new Date(purchase.event.date).toLocaleString("es-CO")
    : "Fecha no disponible";

  const ticketType = purchase.eventTicket?.ticketType?.name || "Entrada";
  const buyerName = purchase.user?.name || "Cliente";
  const buyerEmail = purchase.user?.email || "Correo no disponible";

  const qrValue = JSON.stringify({
    purchaseId: purchase.id,
    eventId: purchase.eventId,
    eventTicketId: purchase.eventTicketId,
    quantity: purchase.quantity,
    status: purchase.status,
  });

  return (
    <article
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:break-inside-avoid print:shadow-none ${
        showDivider ? "mb-6" : ""
      }`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {index ? `Boleta ${index}` : "Boleta"}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">{eventName}</h2>
          </div>

          <div className="grid gap-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Compra:</span> {purchase.id}
            </p>
            <p>
              <span className="font-semibold">Tipo de entrada:</span>{" "}
              {ticketType}
            </p>
            <p>
              <span className="font-semibold">Cantidad:</span> {purchase.quantity}
            </p>
            <p>
              <span className="font-semibold">Precio unitario:</span>{" "}
              {formatCop(purchase.unitPrice)}
            </p>
            <p>
              <span className="font-semibold">Total:</span>{" "}
              {formatCop(purchase.totalPrice)}
            </p>
            <p>
              <span className="font-semibold">Estado:</span> {purchase.status}
            </p>
            <p>
              <span className="font-semibold">Fecha del evento:</span>{" "}
              {eventDate}
            </p>
            <p>
              <span className="font-semibold">Comprador:</span> {buyerName}
            </p>
            <p>
              <span className="font-semibold">Correo:</span> {buyerEmail}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-4">
          <QRCodeSVG value={qrValue} size={170} />
          <p className="mt-3 text-center text-xs text-gray-500">
            Presentar este código QR en el ingreso
          </p>
        </div>
      </div>
    </article>
  );
}
