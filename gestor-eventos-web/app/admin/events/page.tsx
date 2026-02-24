"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { Category, EventItem } from "@/lib/types";

export default function AdminEventsPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // form
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(""); // input datetime-local
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    const [c, e] = await Promise.all([apiGet<any[]>("/categories"), apiGet<EventItem[]>("/events")]);
    setCats(c);
    setEvents(e);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function create() {
    await apiPost("/events", {
      name,
      categoryId,
      date: new Date(date).toISOString(),
      price: Number(price),
      imageUrl,
      description,
    });
    setName("");
    setCategoryId("");
    setDate("");
    setPrice(0);
    setImageUrl("");
    setDescription("");
    await load();
  }

  async function editEvent(ev: EventItem) {
    const newName = prompt("Nombre:", ev.name) ?? ev.name;
    const newPrice = Number(prompt("Precio:", String(ev.price)) ?? ev.price);
    await apiPatch(`/events/${ev.id}`, { name: newName, price: newPrice });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar evento?")) return; // RF-07 recomienda confirmación :contentReference[oaicite:8]{index=8}
    await apiDelete(`/events/${id}`);
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Admin · Eventos</h1>

      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Seleccione categoría</option>
            {cats.filter((c) => c.isActive).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="number" placeholder="Precio" value={price} onChange={(e) => setPrice(Number(e.target.value))} />

          <Input placeholder="URL Imagen (por ahora)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Input placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <Button
          onClick={create}
          disabled={!name.trim() || !categoryId || !date || !description.trim()}
          title="RF-05: nombre, categoría, fecha, valor, descripción e imagen (aquí por URL)"
        >
          Crear evento
        </Button>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {events.map((ev) => (
          <Card key={ev.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{ev.name}</div>
                <div className="text-sm text-[var(--muted)]">{new Date(ev.date).toLocaleString()}</div>
                <div className="text-sm text-[var(--muted)]">${ev.price.toLocaleString("es-CO")}</div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => editEvent(ev)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => remove(ev.id)}>
                  Eliminar
                </Button>
              </div>
            </div>

            <div className="text-sm text-[var(--muted)] line-clamp-2">{ev.description}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}