"use client";

import { useEffect, useState } from "react";
import {
  createTicketType,
  deleteTicketType,
  getTicketTypes,
  updateTicketType,
} from "@/lib/ticket-api";
import { TicketType } from "@/lib/types";

type FormState = {
  name: string;
  description: string;
  isActive: boolean;
};

const INITIAL_FORM: FormState = {
  name: "",
  description: "",
  isActive: true,
};

export default function TicketTypeManager() {
  const [items, setItems] = useState<TicketType[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      const data = await getTicketTypes();
      setItems(data);
    } catch (error: any) {
      setMessage(error.message || "No fue posible cargar los tipos de entrada");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
  }

  function startEdit(item: TicketType) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      isActive: item.isActive,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await updateTicketType(editingId, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        });
        setMessage("Tipo de entrada actualizado");
      } else {
        await createTicketType({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        });
        setMessage("Tipo de entrada creado");
      }

      resetForm();
      await loadData();
    } catch (error: any) {
      setMessage(error.message || "No fue posible guardar el tipo de entrada");
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("¿Desea eliminar este tipo de entrada?");
    if (!ok) return;

    try {
      await deleteTicketType(id);
      setMessage("Tipo de entrada eliminado");
      await loadData();
    } catch (error: any) {
      setMessage(error.message || "No fue posible eliminar el tipo de entrada");
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold">Tipos de entrada</h2>
        <p className="text-sm text-neutral-600">
          Catálogo global reutilizable entre eventos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Nombre</span>
          <input
            className="w-full rounded-xl border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Descripción</span>
          <input
            className="w-full rounded-xl border px-3 py-2"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          <span className="text-sm font-medium">Activo</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            {editingId ? "Actualizar" : "Crear"}
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
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3" colSpan={4}>
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-3" colSpan={4}>
                  No hay tipos de entrada registrados.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-3 py-3 font-medium">{item.name}</td>
                  <td className="px-3 py-3">{item.description || "Sin descripción"}</td>
                  <td className="px-3 py-3">
                    {item.isActive ? "Activo" : "Inactivo"}
                  </td>
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