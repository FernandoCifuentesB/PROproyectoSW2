"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiGet } from "@/lib/api";

type Row = { id: string; email: string; role: "ADMIN" | "USER"; interestedAt: string };

type Payload = {
    eventId: string;
    name: string;
    category: string;
    interestCount: number;
    users: Row[];
};

export default function InterestedUsersModal({
    open,
    eventId,
    onClose,
}: {
    open: boolean;
    eventId: string | null;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Payload | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !eventId) return;

        setLoading(true);
        setError("");
        setData(null);

        apiGet<Payload>(`/interests/event/${eventId}`)
            .then(setData)
            .catch((e: any) => setError(e?.message ?? "Error cargando interesados"))
            .finally(() => setLoading(false));
    }, [open, eventId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-3xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-extrabold">Interesados</div>
                        {data ? (
                            <div className="text-sm text-[var(--muted)]">
                                {data.name} · {data.category} · {data.interestCount} interesados
                            </div>
                        ) : (
                            <div className="text-sm text-[var(--muted)]">Cargando info del evento…</div>
                        )}
                    </div>

                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>

                {loading ? <div className="text-sm text-[var(--muted)]">Cargando…</div> : null}
                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                ) : null}

                {data ? (
                    <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                        <div className="grid grid-cols-12 border-b border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)]">
                            <div className="col-span-5">Email</div>
                            <div className="col-span-2">Rol</div>
                            <div className="col-span-5">Fecha</div>
                        </div>

                        {data.users.length === 0 ? (
                            <div className="px-4 py-4 text-sm text-[var(--muted)]">Nadie ha marcado interés todavía.</div>
                        ) : (
                            data.users.map((u) => (
                                <div key={u.id} className="grid grid-cols-12 px-4 py-2 text-sm hover:bg-white/5">
                                    <div className="col-span-5 font-semibold">{u.email}</div>
                                    <div className="col-span-2 text-[var(--muted)]">{u.role}</div>
                                    <div className="col-span-5 text-[var(--muted)]">{new Date(u.interestedAt).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                ) : null}
            </Card>
        </div>
    );
}