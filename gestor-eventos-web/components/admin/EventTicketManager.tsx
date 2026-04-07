"use client";

import { useEffect, useState } from "react";
import {
  createEventTicket,
  deleteEventTicket,
  getEventTicketsAdmin,
  getTicketTypes,
  updateEventTicket,
} from "@/lib/ticket-api";
import { EventTicket, TicketType } from "@/lib/types";
import { formatCop, getAvailableStock } from "@/lib/tickets";

type Props = {
  eventId: string;
  eventName?: string;
};

type FormState = {
  ticketTypeId: string;
  price: string;
  stock: string;
  isActive: boolean;
};

const INITIAL_FORM: FormState = {
  ticketTypeId: "",
  price: "",
  stock: "",
  isActive: true,
};

export default function EventTicketManager({ eventId, eventName }: Props) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [items, setItems] = useState<EventTicket[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAll() {
    setLoading(true);
    setMessage("");
    try {
      const [types, eventTickets] = await Promise.all([
        getTicketTypes(),
        getEventTicketsAdmin(eventId),
      ]);

      setTicketTypes(types);
      setItems(eventTickets);
    } catch (error: any) {
      setMessage(error.message || "No fue posible cargar las entradas del evento");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [eventId]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
  }

  function startEdit(item: EventTicket) {
    setEditingId(item.id);
    setForm({
      ticketTypeId: item.ticketTypeId,
      price: String(item.price),
      stock: String(item.stock),
      isActive: item.isActive,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await updateEventTicket(eventId, editingId, {
          price: Number(form.price),
          stock: Number(form.stock),
          isActive: form.isActive,
        });
        setMessage("Entrada del evento actualizada");
      } else {
        await createEventTicket(eventId, {
          ticketTypeId: form.ticketTypeId,
          price: Number(form.price),
          stock: Number(form.stock),
          isActive: form.isActive,
        });
        setMessage("Entrada del evento creada");
      }

      resetForm();
      await loadAll();
    } catch (error: any) {
      setMessage(error.message || "No fue posible guardar la entrada del evento");
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("¿Desea eliminar esta entrada del evento?");
    if (!ok) return;

    try {
      await deleteEventTicket(eventId, id);
      setMessage("Entrada del evento eliminada");
      await loadAll();
    } catch (error: any) {
      setMessage(error.message || "No fue posible eliminar la entrada");
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold">Entradas del evento</h2>
        <p className="text-sm text-neutral-600">
          {eventName ? `Configuración de entradas para ${eventName}` : "Asigne tipos, precio y stock al evento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-sm font-medium">Tipo de entrada</span>
         <select
  className="w-full rounded-xl border px-3 py-2"
  value={form.ticketTypeId}
  onChange={(e) => setForm((prev) => ({ ...prev, ticketTypeId: e.target.value }))}
  disabled={!!editingId}
  required
>
  <option value="">Seleccione</option>
  {ticketTypes.map((type) => (
    <option
      key={type.id}
      value={type.id}
      disabled={!type.isActive}
    >
      {type.name} {type.isActive ? "" : "(inactivo)"}
    </option>
  ))}
</select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Precio</span>
          <input
            type="number"
            min={1}
            className="w-full rounded-xl border px-3 py-2"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Stock</span>
          <input
            type="number"
            min={0}
            className="w-full rounded-xl border px-3 py-2"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            required
          />
        </label>

        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          <span className="text-sm font-medium">Activo</span>
        </label>

        <div className="flex gap-2 md:col-span-2 xl:col-span-4">
          <button type="submit" className="rounded-xl bg-black px-4 py-2 text-white">
            {editingId ? "Actualizar" : "Agregar"}
          </button>

          {editingId && (
            <button
              type="button"
              className="rounded-xl border px-4 py-2"
              onClick={resetForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Vendidas</th>
              <th className="px-3 py-2">Disponibles</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3" colSpan={7}>
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-3" colSpan={7}>
                  Este evento aún no tiene entradas configuradas.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-3 py-3 font-medium">
                    {item.ticketType?.name || "Sin tipo"}
                  </td>
                  <td className="px-3 py-3">{formatCop(item.price)}</td>
                  <td className="px-3 py-3">{item.stock}</td>
                  <td className="px-3 py-3">{item.sold}</td>
                  <td className="px-3 py-3">{getAvailableStock(item)}</td>
                  <td className="px-3 py-3">{item.isActive ? "Activa" : "Inactiva"}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border px-3 py-1"
                        onClick={() => startEdit(item)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg border px-3 py-1"
                        onClick={() => handleDelete(item.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}