"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TicketReceipt from "@/components/tickets/TicketReceipt";
import { getMyTicketPurchases } from "@/lib/ticket-api";
import { TicketPurchase } from "@/lib/types";
import { formatCop } from "@/lib/tickets";

export default function MyPurchasesPage() {
  const [items, setItems] = useState<TicketPurchase[]>([]);
  const [message, setMessage] = useState("");
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    getMyTicketPurchases()
      .then(setItems)
      .catch((error: any) =>
        setMessage(error.message || "No fue posible cargar las compras"),
      );
  }, []);

  const handlePrintAll = () => {
    setPrintMode(true);

    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 150);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis compras</h1>
          <p className="mt-2 text-gray-600">
            Historial de entradas compradas.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handlePrintAll}
            className="rounded-xl bg-black px-4 py-2 font-medium text-white"
          >
            Imprimir todas
          </button>
        )}
      </div>

      {message && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 print:hidden">
          {message}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p>No hay compras registradas.</p>
        </div>
      ) : printMode ? (
        <section className="space-y-6">
          {items.map((item, index) => (
            <TicketReceipt
              key={item.id}
              purchase={item}
              index={index + 1}
              showDivider
            />
          ))}
        </section>
      ) : (
        <section className="grid gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {item.event?.name || "Evento"}
                  </h2>

                  <p className="text-sm text-gray-600">
                    Tipo: {item.eventTicket?.ticketType?.name || "Entrada"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Cantidad: {item.quantity}
                  </p>

                  <p className="text-sm text-gray-600">
                    Unitario: {formatCop(item.unitPrice)}
                  </p>

                  <p className="text-sm text-gray-600">
                    Total: {formatCop(item.totalPrice)}
                  </p>

                  <p className="text-sm text-gray-600">
                    Estado: {item.status}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/me/purchases/${item.id}`}
                    className="rounded-xl border border-gray-300 px-4 py-2 font-medium"
                  >
                    Ver boleta
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}