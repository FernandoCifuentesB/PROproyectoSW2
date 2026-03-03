"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiGet } from "@/lib/api";

type TopRow = {
  eventId: string;
  name: string;
  category: string;
  interestCount: number;
  date: string;
  price: number;
};

type UserRow = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  interestedAt: string;
};

type EventDetail = {
  eventId: string;
  name: string;
  category: string;
  interestCount: number;
  users: UserRow[];
};

export default function TopPage() {
  const [rows, setRows] = useState<TopRow[]>([]);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    apiGet<TopRow[]>("/interests/report/top")
      .then(setRows)
      .catch((e: any) => {
        console.error(e);
        setError(e?.message ?? "Error cargando top");
      });
  }, []);

  async function loadUsers(eventId: string) {
    setLoadingDetail(true);
    setEventDetail(null);

    try {
      const data = await apiGet<EventDetail>(
        `/interests/event/${eventId}`
      );
      setEventDetail(data);
      setOpen(true);
    } catch (e: any) {
      console.error(e);
      alert("Error cargando usuarios interesados");
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold">
          EVENTOS CON MÁS INTERÉS
        </h1>

        <p className="text-sm text-[var(--muted)]">
          Ranking automático según la cantidad de usuarios interesados.
        </p>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-12 border-b border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
            <div className="col-span-5">Evento</div>
            <div className="col-span-3">Categoría</div>
            <div className="col-span-2 text-right">
              Interesados
            </div>
            <div className="col-span-2 text-right">Precio</div>
          </div>

          {rows.map((r, idx) => (
            <div
              key={r.eventId}
              className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-white/5"
            >
              <div className="col-span-5 font-semibold">
                #{idx + 1} {r.name}
                <div className="text-xs text-[var(--muted)]">
                  {new Date(r.date).toLocaleString()}
                </div>
              </div>

              <div className="col-span-3 text-[var(--muted)]">
                {r.category}
              </div>

              <div className="col-span-2 text-right font-semibold">
                <button
                  className="underline underline-offset-4 hover:opacity-80"
                  onClick={() => loadUsers(r.eventId)}
                  disabled={loadingDetail}
                >
                  {r.interestCount}
                </button>
              </div>

              <div className="col-span-2 text-right">
                ${r.price.toLocaleString("es-CO")}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* MODAL */}
      {open && eventDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-extrabold">
                  {eventDetail.name}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {eventDetail.category} ·{" "}
                  {eventDetail.interestCount} interesados
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEventDetail(null);
                }}
              >
                Cerrar
              </Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-12 border-b border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)]">
                <div className="col-span-6">Email</div>
                <div className="col-span-2">Rol</div>
                <div className="col-span-4">Fecha</div>
              </div>

              {eventDetail.users.length === 0 ? (
                <div className="px-4 py-4 text-sm text-[var(--muted)]">
                  Nadie ha marcado interés todavía.
                </div>
              ) : (
                eventDetail.users.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-12 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    <div className="col-span-6 font-semibold">
                      {u.email}
                    </div>
                    <div className="col-span-2 text-[var(--muted)]">
                      {u.role}
                    </div>
                    <div className="col-span-4 text-[var(--muted)]">
                      {new Date(
                        u.interestedAt
                      ).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}