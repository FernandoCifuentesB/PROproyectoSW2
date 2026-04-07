"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { Category } from "@/lib/types";
import { useAuth } from "@/lib/auth";

type Field = "name" | "description";
type Errors = Partial<Record<Field | "server", string>>;

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
      {active ? "Activa" : "Inactiva"}
    </span>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative flex h-8 w-16 items-center rounded-full transition ${
        checked ? "bg-green-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition ${
          checked ? "translate-x-9" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [items, setItems] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [serverError, setServerError] = useState<string>("");

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [eName, setEName] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eIsActive, setEIsActive] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    description: false,
  });

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
    const data = await apiGet<Category[]>("/categories");
    setItems(data);
  }

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    load().catch(console.error);
  }, [token, user]);

  const errors: Errors = useMemo(() => {
    const e: Errors = {};
    const n = name.trim();

    if (touched.name) {
      if (!n) e.name = "El nombre es obligatorio.";
      else if (n.length < 3) e.name = "Mínimo 3 caracteres.";
      else if (n.length > 40) e.name = "Máximo 40 caracteres.";
    }

    const d = description.trim();
    if (touched.description && d && d.length > 120) {
      e.description = "Máximo 120 caracteres.";
    }

    return e;
  }, [name, description, touched]);

  const rawCanSubmit = useMemo(() => {
    const n = name.trim();
    const d = description.trim();

    if (!n) return false;
    if (n.length < 3 || n.length > 40) return false;
    if (d.length > 120) return false;

    return true;
  }, [name, description]);

  const editErrors: Errors = useMemo(() => {
    const e: Errors = {};
    const n = eName.trim();

    if (!n) e.name = "El nombre es obligatorio.";
    else if (n.length < 3) e.name = "Mínimo 3 caracteres.";
    else if (n.length > 40) e.name = "Máximo 40 caracteres.";

    const d = eDescription.trim();
    if (d && d.length > 120) e.description = "Máximo 120 caracteres.";

    return e;
  }, [eName, eDescription]);

  const canSaveEdit = Object.keys(editErrors).length === 0;

  async function create() {
    setServerError("");

    setTouched({
      name: true,
      description: true,
    });

    if (!rawCanSubmit) return;

    try {
      await apiPost("/categories", {
        name: name.trim(),
        description: description.trim() || null,
      });

      setName("");
      setDescription("");
      setTouched({
        name: false,
        description: false,
      });
      setCreateOpen(false);
      await load();
    } catch (e: any) {
      setServerError(e?.message ?? "Error creando categoría");
    }
  }

  function openEdit(c: Category) {
    setEditingId(c.id);
    setEName(c.name ?? "");
    setEDescription(c.description ?? "");
    setEIsActive(!!c.isActive);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!canSaveEdit) return;

    try {
      await apiPatch(`/categories/${editingId}`, {
        name: eName.trim(),
        description: eDescription.trim() || null,
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
    if (!confirm("¿Eliminar categoría?")) return;

    setServerError("");
    try {
      await apiDelete(`/categories/${id}`);
      await load();
    } catch (e: any) {
      setServerError(e?.message ?? "Error eliminando categoría");
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
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)]">
          Gestión de categorías
        </h1>

        <p className="text-sm text-[var(--muted)]">
          Administración de las categorías disponibles en la plataforma
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <button
          type="button"
          onClick={() => setCreateOpen((prev) => !prev)}
          className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.22em] text-slate-500 transition hover:text-[var(--fg)]"
        >
          Crear categoría
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-bold text-[var(--fg)] shadow-sm">
            {createOpen ? "−" : "+"}
          </span>
        </button>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {createOpen && (
        <Card className="overflow-hidden border border-[var(--border)] p-0 shadow-sm">
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="mb-1 text-lg font-bold text-[var(--fg)]">
              Nueva categoría
            </div>
            <p className="text-sm text-[var(--muted)]">
              Crea una categoría para clasificar los eventos del sistema.
            </p>
          </div>

          <div className="space-y-4 px-6 py-6">
            {serverError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Ej. Conciertos, Tecnología, Deportes"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!touched.name) {
                      setTouched((prev) => ({ ...prev, name: true }));
                    }
                  }}
                />
                {errors.name ? (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                ) : (
                  touched.name && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Entre 3 y 40 caracteres.
                    </p>
                  )
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--fg)]">
                  Descripción
                </label>
                <Input
                  placeholder="Descripción breve (opcional)"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (!touched.description) {
                      setTouched((prev) => ({
                        ...prev,
                        description: true,
                      }));
                    }
                  }}
                />
                {errors.description ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description}
                  </p>
                ) : (
                  touched.description && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Máximo 120 caracteres.
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setName("");
                  setDescription("");
                  setTouched({
                    name: false,
                    description: false,
                  });
                  setServerError("");
                }}
              >
                Cancelar
              </Button>

              <Button onClick={create} disabled={!rawCanSubmit}>
                Guardar categoría
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <h2 className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-500">
          Categorías existentes
        </h2>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="space-y-3">
        {items.map((c) => (
          <Card
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="font-bold">{c.name}</div>
                <StatusBadge active={!!c.isActive} />
              </div>

              <div className="text-sm text-[var(--muted)]">
                {c.description ?? "—"}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openEdit(c)}>
                Editar
              </Button>

              <Button variant="danger" onClick={() => remove(c.id)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={editOpen}
        title="Editar categoría"
        onClose={() => {
          setEditOpen(false);
          setEditingId(null);
        }}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input
                placeholder="Nombre"
                value={eName}
                onChange={(e) => setEName(e.target.value)}
              />
              {editErrors.name ? (
                <p className="mt-1 text-xs text-red-600">{editErrors.name}</p>
              ) : null}
            </div>

            <div>
              <Input
                placeholder="Descripción"
                value={eDescription}
                onChange={(e) => setEDescription(e.target.value)}
              />
              {editErrors.description ? (
                <p className="mt-1 text-xs text-red-600">
                  {editErrors.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--fg)]">
                Estado de la categoría
              </label>

              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={eIsActive}
                  onChange={() => setEIsActive((prev) => !prev)}
                />
                <StatusBadge active={eIsActive} />
              </div>

              <p className="text-xs text-[var(--muted)]">
                Activa = disponible para seleccionar en la creación de eventos.
              </p>
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