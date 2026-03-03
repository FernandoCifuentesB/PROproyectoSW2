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

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [items, setItems] = useState<Category[]>([]);

  // create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [serverError, setServerError] = useState<string>("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [eName, setEName] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eIsActive, setEIsActive] = useState(true);

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

    if (!n) e.name = "El nombre es obligatorio.";
    else if (n.length < 3) e.name = "Mínimo 3 caracteres.";
    else if (n.length > 40) e.name = "Máximo 40 caracteres.";

    const d = description.trim();
    if (d && d.length > 120) e.description = "Máximo 120 caracteres.";

    return e;
  }, [name, description]);

  const canSubmit = Object.keys(errors).length === 0;

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

    if (!canSubmit) return;

    try {
      await apiPost("/categories", {
        name: name.trim(),
        description: description.trim() || null,
      });

      setName("");
      setDescription("");
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
    return <div className="p-6 text-sm text-[var(--muted)]">Verificando acceso...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Admin · Categorías</h1>

      <Card className="space-y-3">
        {serverError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <Input placeholder="Nombre (único)" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
          </div>

          <div className="md:col-span-1">
            <Input
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description}</p> : null}
          </div>

          <div className="md:col-span-1 flex items-start">
            <Button className="w-full" onClick={create} disabled={!canSubmit}>
              Crear
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((c) => (
          <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold">{c.name}</div>
              <div className="text-sm text-[var(--muted)]">{c.description ?? "—"}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                Estado: <span className="font-semibold">{c.isActive ? "Activa" : "Inactiva"}</span>
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

      {/* ✅ MODAL EDITAR */}
      <Modal
        open={editOpen}
        title="Editar categoría"
        onClose={() => {
          setEditOpen(false);
          setEditingId(null);
        }}
      >
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-1">
              <Input placeholder="Nombre" value={eName} onChange={(e) => setEName(e.target.value)} />
              {editErrors.name ? <p className="mt-1 text-xs text-red-600">{editErrors.name}</p> : null}
            </div>

            <div className="md:col-span-1">
              <Input
                placeholder="Descripción (opcional)"
                value={eDescription}
                onChange={(e) => setEDescription(e.target.value)}
              />
              {editErrors.description ? (
                <p className="mt-1 text-xs text-red-600">{editErrors.description}</p>
              ) : null}
            </div>

            <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3">
              <div>
                <div className="font-semibold">Estado</div>
                <div className="text-xs text-[var(--muted)]">Activa = visible para seleccionar en eventos</div>
              </div>

              <Button variant="outline" onClick={() => setEIsActive((v) => !v)}>
                {eIsActive ? "Desactivar" : "Activar"}
              </Button>
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