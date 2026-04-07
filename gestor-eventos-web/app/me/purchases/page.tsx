"use client";

import { useEffect, useState } from "react";
import { getMyTicketPurchases } from "@/lib/ticket-api";
import { TicketPurchase } from "@/lib/types";
import { formatCop } from "@/lib/tickets";

export default function MyPurchasesPage() {
  const [items, setItems] = useState<TicketPurchase[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMyTicketPurchases()
      .then(setItems)
      .catch((error: any) =>
        setMessage(error.message || "No fue posible cargar las compras"),
      );
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Mis compras</h1>
          <p className="text-sm text-neutral-600">
            Historial de entradas compradas.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">No hay compras registradas.</p>
          ) : (
            items.map((item) => (
              <article key={item.id} className="rounded-2xl border p-4">
                <h2 className="text-lg font-semibold">
                  {item.event?.name || "Evento"}
                </h2>
                <p className="text-sm text-neutral-600">
                  Tipo: {item.eventTicket?.ticketType?.name || "Entrada"}
                </p>
                <p className="text-sm text-neutral-600">
                  Cantidad: {item.quantity}
                </p>
                <p className="text-sm text-neutral-600">
                  Unitario: {formatCop(item.unitPrice)}
                </p>
                <p className="text-sm font-medium">
                  Total: {formatCop(item.totalPrice)}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(item.createdAt).toLocaleString("es-CO")}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}