"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TicketReceipt from "@/components/tickets/TicketReceipt";
import { getTicketPurchaseById } from "@/lib/ticket-api";
import { TicketPurchase } from "@/lib/types";

export default function PurchaseReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<TicketPurchase | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPurchase() {
      try {
        const data = await getTicketPurchaseById(params.id);
        setItem(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar la boleta",
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadPurchase();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p>Cargando boleta...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {message}
        </p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p>No se encontró la boleta.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 print:px-0 print:py-0">
      <div className="mb-6 flex flex-wrap gap-3 print:hidden">
        <button
          onClick={() => router.push("/me/purchases")}
          className="rounded-xl border border-gray-300 px-4 py-2 font-medium"
        >
          Volver
        </button>

        <button
          onClick={handlePrint}
          className="rounded-xl bg-black px-4 py-2 font-medium text-white"
        >
          Imprimir boleta
        </button>
      </div>

      <TicketReceipt purchase={item} />
    </main>
  );
}
