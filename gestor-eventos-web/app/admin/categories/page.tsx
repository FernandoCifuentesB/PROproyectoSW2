"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    const data = await apiGet<any[]>("/categories");
    setItems(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function create() {
    await apiPost("/categories", { name, description });
    setName("");
    setDescription("");
    await load();
  }

  async function save(id: string, payload: Partial<Category>) {
    try {
      await apiPatch(`/categories/${id}`, payload);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Error actualizando categoría");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar categoría?")) return;
    await apiDelete(`/categories/${id}`);
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Admin · Categorías</h1>

      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Nombre (único)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={create} disabled={!name.trim()}>
            Crear
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((c) => (
          <Card key={c.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-[var(--muted)]">{c.description ?? "—"}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  Estado: <span className="font-semibold">{c.isActive ? "Activa" : "Inactiva"}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newName = prompt("Nuevo nombre:", c.name);
                    if (newName) save(c.id, { name: newName });
                  }}
                >
                  Editar
                </Button>

                <Button
                  variant="outline"
                  onClick={() => save(c.id, { isActive: !c.isActive })}
                  title="Si tiene eventos activos, el backend debe rechazarlo"
                >
                  {c.isActive ? "Desactivar" : "Activar"}
                </Button>

                <Button variant="danger" onClick={() => remove(c.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}