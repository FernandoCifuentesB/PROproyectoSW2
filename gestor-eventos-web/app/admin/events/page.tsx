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

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-[var(--fg)]">
      {children} <span className="text-red-500">*</span>
    </label>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        active
          ? "bg-green-100 text-green-700"
          : "bg-slate-200 text-slate-700",
      ].join(" ")}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [cats, setCats] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [serverError, setServerError] = useState("");

  const [createOpen, setCreateOpen] = useState(true);

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

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [eName, setEName] = useState("");
  const [eCategoryId, setECategoryId] = useState("");
  const [eDate, setEDate] = useState("");
  const [ePrice, setEPrice] = useState<string>("");
  const [eImageUrl, setEImageUrl] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eIsActive, setEIsActive] = useState(true);

  const [editTouched, setEditTouched] = useState<Record<Field, boolean>>({
    name: false,
    categoryId: false,
    date: false,
    price: false,
    imageUrl: false,
    description: false,
  });

  useEffect(() => {
    if (token === null) return;
    if (!token) return router.push("/login");
    if (user?.role !== "ADMIN") return router.push("/");
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

    if (!date) {
      e.date = "La fecha es obligatoria.";
    } else {
      const eventDate = new Date(date);

      if (Number.isNaN(eventDate.getTime())) {
        e.date = "Fecha inválida.";
      } else {
        const now = new Date();
        if (eventDate <= now) {
          e.date = "El evento debe programarse en una fecha futura.";
        }
      }
    }

    if (!price.trim()) e.price = "El precio es obligatorio.";
    else {
      const p = Number(price);
      if (Number.isNaN(p)) e.price = "Debe ser un número.";
      else if (p < 0) e.price = "No puede ser negativo.";
    }

    const img = imageUrl.trim();
    if (img && !isValidUrl(img)) {
      e.imageUrl = "Debe ser una URL válida (http/https).";
    }

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

    if (!eDate) {
      e.date = "La fecha es obligatoria.";
    } else {
      const eventDate = new Date(eDate);

      if (Number.isNaN(eventDate.getTime())) {
        e.date = "Fecha inválida.";
      } else {
        const now = new Date();
        if (eventDate <= now) {
          e.date = "El evento debe programarse en una fecha futura.";
        }
      }
    }

    if (!ePrice.trim()) e.price = "El precio es obligatorio.";
    else {
      const p = Number(ePrice);
      if (Number.isNaN(p)) e.price = "Debe ser un número.";
      else if (p < 0) e.price = "No puede ser negativo.";
    }

    const img = eImageUrl.trim();
    if (img && !isValidUrl(img)) {
      e.imageUrl = "Debe ser una URL válida (http/https).";
    }

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

    const eventDate = new Date(date);
    const now = new Date();

    if (eventDate <= now) {
      setServerError("El evento debe programarse en una fecha futura.");
      return;
    }

    try {
      await apiPost("/events", {
        name: name.trim(),
        categoryId,
        date: eventDate.toISOString(),
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
      setTouched({
        name: false,
        categoryId: false,
        date: false,
        price: false,
        imageUrl: false,
        description: false,
      });
      setCreateOpen(false);

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
    setEIsActive(ev.isActive ?? true);
    setEditTouched({
      name: false,
      categoryId: false,
      date: false,
      price: false,
      imageUrl: false,
      description: false,
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editingId || !canSaveEdit) return;

    const eventDate = new Date(eDate);
    const now = new Date();

    if (eventDate <= now) {
      alert("El evento debe programarse en una fecha futura.");
      return;
    }

    try {
      await apiPatch(`/events/${editingId}`, {
        name: eName.trim(),
        categoryId: eCategoryId,
        date: eventDate.toISOString(),
        price: Number(ePrice),
        imageUrl: eImageUrl.trim() || null,
        description: eDescription.trim(),
        isActive: eIsActive,
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
    return (
      <div className="p-6 text-sm text-[var(--muted)]">
        Verificando acceso...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2 pt-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Gestión de eventos
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Panel de administración para crear, editar y eliminar eventos.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Crear evento
          </h2>
          <button
            type="button"
            onClick={() => setCreateOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-semibold text-[var(--fg)] shadow-sm transition hover:bg-slate-50"
            aria-label={createOpen ? "Cerrar formulario" : "Abrir formulario"}
          >
            {createOpen ? "-" : "+"}
          </button>
        </div>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {createOpen ? (
        <Card className="space-y-5 rounded-3xl p-6 shadow-sm">
          {serverError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          ) : null}

          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="mb-1 text-lg font-bold text-[var(--fg)]">
              Nuevo evento
            </div>
            <p className="text-sm text-[var(--muted)]">
              Crea un nuevo evento para mostrar en la plataforma.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <RequiredLabel>Nombre del evento</RequiredLabel>
              <Input
                placeholder="Ej. Concierto en Tunja"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setTouched((prev) => ({ ...prev, name: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {touched.name ? errors.name ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <RequiredLabel>Categoría</RequiredLabel>
              <Select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setTouched((prev) => ({ ...prev, categoryId: true }));
                }}
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
              <p className="min-h-[20px] text-xs text-red-600">
                {touched.categoryId ? errors.categoryId ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <RequiredLabel>Fecha y hora</RequiredLabel>
              <Input
                type="datetime-local"
                value={date}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTouched((prev) => ({ ...prev, date: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {touched.date ? errors.date ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <RequiredLabel>Precio</RequiredLabel>
              <Input
                type="number"
                placeholder="Ej. 50000"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setTouched((prev) => ({ ...prev, price: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {touched.price ? errors.price ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-[var(--fg)]">
                URL de la imagen
              </label>
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setTouched((prev) => ({ ...prev, imageUrl: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {touched.imageUrl ? errors.imageUrl ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <RequiredLabel>Descripción</RequiredLabel>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setTouched((prev) => ({ ...prev, description: true }));
                }}
                placeholder="Describe brevemente el evento..."
                className="min-h-[110px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300"
              />
              <div className="flex items-center justify-between">
                <p className="min-h-[20px] text-xs text-red-600">
                  {touched.description ? errors.description ?? "" : ""}
                </p>
                <span className="text-xs text-[var(--muted)]">
                  {description.trim().length}/240
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create} disabled={!canSubmit}>
              Crear evento
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Eventos existentes
        </h2>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((ev) => (
          <Card key={ev.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="font-bold">{ev.name}</div>
                  <StatusBadge active={ev.isActive ?? true} />
                </div>

                <div className="text-sm text-[var(--muted)]">
                  {new Date(ev.date).toLocaleString()}
                </div>

                <div className="text-sm text-[var(--muted)]">
                  ${ev.price.toLocaleString("es-CO")}
                </div>
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

            <div className="line-clamp-2 text-sm text-[var(--muted)]">
              {ev.description}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={editOpen}
        title="Editar evento"
        onClose={() => {
          setEditOpen(false);
          setEditingId(null);
        }}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <RequiredLabel>Nombre del evento</RequiredLabel>
              <Input
                placeholder="Nombre"
                value={eName}
                onChange={(e) => {
                  setEName(e.target.value);
                  setEditTouched((prev) => ({ ...prev, name: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {editTouched.name ? editErrors.name ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <RequiredLabel>Categoría</RequiredLabel>
              <Select
                value={eCategoryId}
                onChange={(e) => {
                  setECategoryId(e.target.value);
                  setEditTouched((prev) => ({ ...prev, categoryId: true }));
                }}
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
              <p className="min-h-[20px] text-xs text-red-600">
                {editTouched.categoryId ? editErrors.categoryId ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <RequiredLabel>Fecha y hora</RequiredLabel>
              <Input
                type="datetime-local"
                value={eDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  setEDate(e.target.value);
                  setEditTouched((prev) => ({ ...prev, date: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {editTouched.date ? editErrors.date ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <RequiredLabel>Precio</RequiredLabel>
              <Input
                type="number"
                placeholder="Precio"
                value={ePrice}
                onChange={(e) => {
                  setEPrice(e.target.value);
                  setEditTouched((prev) => ({ ...prev, price: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {editTouched.price ? editErrors.price ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-[var(--fg)]">
                URL de la imagen
              </label>
              <Input
                placeholder="https://..."
                value={eImageUrl}
                onChange={(e) => {
                  setEImageUrl(e.target.value);
                  setEditTouched((prev) => ({ ...prev, imageUrl: true }));
                }}
              />
              <p className="min-h-[20px] text-xs text-red-600">
                {editTouched.imageUrl ? editErrors.imageUrl ?? "" : ""}
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <RequiredLabel>Descripción</RequiredLabel>
              <textarea
                value={eDescription}
                onChange={(e) => {
                  setEDescription(e.target.value);
                  setEditTouched((prev) => ({ ...prev, description: true }));
                }}
                placeholder="Describe brevemente el evento..."
                className="min-h-[110px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300"
              />
              <div className="flex items-center justify-between">
                <p className="min-h-[20px] text-xs text-red-600">
                  {editTouched.description ? editErrors.description ?? "" : ""}
                </p>
                <span className="text-xs text-[var(--muted)]">
                  {eDescription.trim().length}/240
                </span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--fg)]">
                Estado del evento
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEIsActive((prev) => !prev)}
                  className={`relative flex h-8 w-16 items-center rounded-full transition ${
                    eIsActive ? "bg-green-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition ${
                      eIsActive ? "translate-x-9" : "translate-x-1"
                    }`}
                  />
                </button>

                <StatusBadge active={eIsActive} />
              </div>
            </div>
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