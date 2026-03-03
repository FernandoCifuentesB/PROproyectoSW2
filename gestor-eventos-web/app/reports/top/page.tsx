"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { apiGet } from "@/lib/api";

type TopRow = {
  eventId: string;
  name: string;
  category: string;
  interestCount: number;
  date: string;
  price: number;
};

export default function TopPage() {
  const [rows, setRows] = useState<TopRow[]>([]);

  useEffect(() => {
    apiGet<TopRow[]>("/interests/report/top")
      .then(setRows)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">EVENTOS CON MÁS INTERÉS</h1>
      <p className="text-sm text-[var(--muted)]">Ranking automático según la cantidad de usuarios interesados.</p>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-12 border-b border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
          <div className="col-span-5">Evento</div>
          <div className="col-span-3">Categoría</div>
          <div className="col-span-2 text-right">Interesados</div>
          <div className="col-span-2 text-right">Precio</div>
        </div>

        {rows.map((r, idx) => (
          <div key={r.eventId} className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-white/5">
            <div className="col-span-5 font-semibold">
              #{idx + 1} {r.name}
              <div className="text-xs text-[var(--muted)]">{new Date(r.date).toLocaleString()}</div>
            </div>
            <div className="col-span-3 text-[var(--muted)]">{r.category}</div>
            <div className="col-span-2 text-right font-semibold">{r.interestCount}</div>
            <div className="col-span-2 text-right">${r.price.toLocaleString("es-CO")}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}