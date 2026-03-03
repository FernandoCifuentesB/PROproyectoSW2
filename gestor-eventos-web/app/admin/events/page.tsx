"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { Category, EventItem } from "@/lib/types";
import { useAuth } from "@/lib/auth";

type Field = "name" | "categoryId" | "date" | "price" | "imageUrl" | "description";
type Errors = Partial<Record<Field | "server", string>>;

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

function toDatetimeLocalValue(iso: string) {
  // iso -> "YYYY-MM-DDTHH:mm"
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [cats, setCats] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [serverError, setServerError] = useState("");

  // create form
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(""); // datetime-local
  const [price, setPrice] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [eName, setEName] = useState("");
  const [eCategoryId, setECategoryId] = useState("");
  const [eDate, setEDate] = useState("");
  const [ePrice, setEPrice] = useState<string>("");
  const [eImageUrl, setEImageUrl] = useState("");
  const [eDescription, setEDescription] = useState("");

  // 🔐 guard admin
  useEffect(() => {
    if (token === null) return;
    if (!token) return router.push("/login");
    if (user?.role !== "ADMIN") return router.push("/");
  }, [token, user, router]);

  async function load() {
    const [c, e] = await Promise.all([apiGet<Category[]>("/categories"), apiGet<EventItem[]>("/events")]);
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
    else if (Number.isNaN(new Date(date).getTime())) e.date = "Fecha inválida.";

    if (!price.trim()) e.price = "El precio es obligatorio.";
    else {
      const p = Number(price);
      if (Number.isNaN(p)) e.price = "Debe ser un número.";
      else if (p < 0) e.price = "No puede ser negativo.";
    }

    const img = imageUrl.trim();
    if (img && !isValidUrl(img)) e.imageUrl = "Debe ser una URL válida (http/https).";

    const desc = description.trim();
    if (!desc) e.description = "La descripción es obligatoria.";
    else if (desc.length < 10) e.description = "Mínimo 10 caracteres.";
    else if (desc.length > 240) e.description = "Máximo 240 caracteres.";

    return e;
  }, [name, categoryId, date, price, imageUrl, description]);

  const canSubmit = Object.keys(errors).length === 0;

  const editErrors: Errors = useMemo(() => {
    const e: Errors = {};
    const n = eName.trim();
    if (!n) e.name = "El nombre es obligatorio.";
    else if (n.length < 3) e.name = "Mínimo 3 caracteres.";
    else if (n.length > 60) e.name = "Máximo 60 caracteres.";

    if (!eCategoryId) e.categoryId = "Seleccione una categoría.";

    if (!eDate) e.date = "La fecha es obligatoria.";
    else if (Number.isNaN(new Date(eDate).getTime())) e.date = "Fecha inválida.";

    if (!ePrice.trim()) e.price = "El precio es obligatorio.";
    else {
      const p = Number(ePrice);
      if (Number.isNaN(p)) e.price = "Debe ser un número.";
      else if (p < 0) e.price = "No puede ser negativo.";
    }

    const img = eImageUrl.trim();
    if (img && !isValidUrl(img)) e.imageUrl = "Debe ser una URL válida (http/https).";

    const desc = eDescription.trim();
    if (!desc) e.description = "La descripción es obligatoria.";
    else if (desc.length < 10) e.description = "Mínimo 10 caracteres.";
    else if (desc.length > 240) e.description = "Máximo 240 caracteres.";

    return e;
  }, [eName, eCategoryId, eDate, ePrice, eImageUrl, eDescription]);

  const canSaveEdit = Object.keys(editErrors).length === 0;

  async function create() {
    setServerError("");
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

  function openEdit(ev: EventItem) {
    setEditingId(ev.id);
    setEName(ev.name ?? "");
    setECategoryId(ev.categoryId ?? "");
    setEDate(toDatetimeLocalValue(ev.date));
    setEPrice(String(ev.price ?? 0));
    setEImageUrl(ev.imageUrl ?? "");
    setEDescription(ev.description ?? "");
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!canSaveEdit) return;

    try {
      await apiPatch(`/events/${editingId}`, {
        name: eName.trim(),
        categoryId: eCategoryId,
        date: new Date(eDate).toISOString(),
        price: Number(ePrice),
        imageUrl: eImageUrl.trim() || null,
        description: eDescription.trim(),
      });

      setEditOpen(false);
      setEditingId(null);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Error guardando cambios");
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
    return <div className="p-6 text-sm text-[var(--muted)]">Verificando acceso...</div>;
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
          <Input type="number" placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} />

          <Input placeholder="URL Imagen (opcional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Input placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <Button onClick={create} disabled={!canSubmit}>
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
                <Button variant="outline" onClick={() => openEdit(ev)}>
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

      {/* ✅ MODAL EDITAR */}
      <Modal
        open={editOpen}
        title="Editar evento"
        onClose={() => {
          setEditOpen(false);
          setEditingId(null);
        }}
      >
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Nombre" value={eName} onChange={(e) => setEName(e.target.value)} />
            <Select value={eCategoryId} onChange={(e) => setECategoryId(e.target.value)}>
              <option value="">Seleccione categoría</option>
              {cats.filter((c) => c.isActive).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Input type="datetime-local" value={eDate} onChange={(e) => setEDate(e.target.value)} />
            <Input type="number" placeholder="Precio" value={ePrice} onChange={(e) => setEPrice(e.target.value)} />

            <Input placeholder="URL Imagen (opcional)" value={eImageUrl} onChange={(e) => setEImageUrl(e.target.value)} />
            <Input placeholder="Descripción" value={eDescription} onChange={(e) => setEDescription(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={!canSaveEdit}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}