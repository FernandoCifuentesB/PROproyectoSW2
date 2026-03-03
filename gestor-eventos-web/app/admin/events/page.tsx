"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { Category, EventItem } from "@/lib/types";
import { useAuth } from "@/lib/auth";

type Field =
  | "name"
  | "categoryId"
  | "date"
  | "price"
  | "imageUrl"
  | "description";

type Errors = Partial<Record<Field | "server", string>>;

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [cats, setCats] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [serverError, setServerError] = useState("");

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    categoryId: false,
    date: false,
    price: false,
    imageUrl: false,
    description: false,
  });

  // ----------------------------
  // 🔐 GUARD ADMIN
  // ----------------------------
  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [token, user, router]);

  async function load() {
    const [c, e] = await Promise.all([
      apiGet<Category[]>("/categories"),
      apiGet<EventItem[]>("/events"),
    ]);
    setCats(c);
    setEvents(e);
  }

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    load().catch(console.error);
  }, [token, user]);

  const errors: Errors = useMemo(() => {
    const e: Errors = {};

    const n = name.trim();
    if (!n) e.name = "El nombre es obligatorio.";
    else if (n.length < 3) e.name = "Mínimo 3 caracteres.";
    else if (n.length > 60) e.name = "Máximo 60 caracteres.";

    if (!categoryId) e.categoryId = "Seleccione una categoría.";

    if (!date) e.date = "La fecha es obligatoria.";
    else {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) e.date = "Fecha inválida.";
    }

    if (!price.trim()) e.price = "El precio es obligatorio.";
    else {
      const p = Number(price);
      if (Number.isNaN(p)) e.price = "Debe ser un número.";
      else if (p < 0) e.price = "No puede ser negativo.";
    }

    const img = imageUrl.trim();
    if (img && !isValidUrl(img))
      e.imageUrl = "Debe ser una URL válida (http/https).";

    const desc = description.trim();
    if (!desc) e.description = "La descripción es obligatoria.";
    else if (desc.length < 10) e.description = "Mínimo 10 caracteres.";
    else if (desc.length > 240) e.description = "Máximo 240 caracteres.";

    return e;
  }, [name, categoryId, date, price, imageUrl, description]);

  const canSubmit = Object.keys(errors).length === 0;

  function touchAll() {
    setTouched({
      name: true,
      categoryId: true,
      date: true,
      price: true,
      imageUrl: true,
      description: true,
    });
  }

  async function create() {
    setServerError("");
    touchAll();
    if (!canSubmit) return;

    const iso = new Date(date).toISOString();

    try {
      await apiPost("/events", {
        name: name.trim(),
        categoryId,
        date: iso,
        price: Number(price),
        imageUrl: imageUrl.trim() || null,
        description: description.trim(),
      });

      setName("");
      setCategoryId("");
      setDate("");
      setPrice("");
      setImageUrl("");
      setDescription("");

      await load();
    } catch (e: any) {
      setServerError(e?.message ?? "Error creando evento");
    }
  }

  async function editEvent(ev: EventItem) {
    const newName = prompt("Nombre:", ev.name) ?? ev.name;
    const newPrice = Number(prompt("Precio:", String(ev.price)) ?? ev.price);

    try {
      await apiPatch(`/events/${ev.id}`, {
        name: newName.trim(),
        price: newPrice,
      });
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Error editando evento");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar evento?")) return;
    try {
      await apiDelete(`/events/${id}`);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Error eliminando evento");
    }
  }

  if (!token || user?.role !== "ADMIN") {
    return (
      <div className="p-6 text-sm text-[var(--muted)]">
        Verificando acceso...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Admin · Eventos</h1>

      <Card className="space-y-3">
        {serverError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Seleccione categoría</option>
            {cats
              .filter((c) => c.isActive)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>

          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Input
            placeholder="URL Imagen (opcional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <Input
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button onClick={create} disabled={!canSubmit}>
          Crear evento
        </Button>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {events.map((ev) => (
          <Card key={ev.id} className="space-y-2">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{ev.name}</div>
                <div className="text-sm text-[var(--muted)]">
                  {new Date(ev.date).toLocaleString()}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  ${ev.price.toLocaleString("es-CO")}
                </div>
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

            <div className="text-sm text-[var(--muted)]">
              {ev.description}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}