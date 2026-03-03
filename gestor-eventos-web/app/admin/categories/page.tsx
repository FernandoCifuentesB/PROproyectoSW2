"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { Category } from "@/lib/types";
import { useAuth } from "@/lib/auth";

type Errors = Partial<Record<"name" | "description" | "server", string>>;

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [items, setItems] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string>("");

  // --------------------------
  // Guard: solo ADMIN
  // --------------------------
  useEffect(() => {
    // Espera a que el AuthProvider cargue localStorage (user puede ser null al inicio)
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
    // No cargar data si no es admin (evita requests innecesarios)
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

  async function create() {
    setServerError("");
    setTouched({ name: true, description: true });

    if (!canSubmit) return;

    try {
      await apiPost("/categories", {
        name: name.trim(),
        description: description.trim() || null,
      });
      setName("");
      setDescription("");
      setTouched({});
      await load();
    } catch (e: any) {
      setServerError(e?.message ?? "Error creando categoría");
    }
  }

  async function save(id: string, payload: Partial<Category>) {
    setServerError("");
    try {
      await apiPatch(`/categories/${id}`, payload);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Error actualizando categoría");
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

  // UI simple mientras redirige / valida
  if (!token || user?.role !== "ADMIN") {
    return (
      <div className="p-6 text-sm text-[var(--muted)]">
        Verificando acceso...
      </div>
    );
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
            <Input
              placeholder="Nombre (único)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            {touched.name && errors.name ? (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            ) : (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Ej: Conciertos, Deportes, Tecnología
              </p>
            )}
          </div>

          <div className="md:col-span-1">
            <Input
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            />
            {touched.description && errors.description ? (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            ) : (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Máximo 120 caracteres.
              </p>
            )}
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
          <Card
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <div className="font-bold">{c.name}</div>
              <div className="text-sm text-[var(--muted)]">
                {c.description ?? "—"}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                Estado:{" "}
                <span className="font-semibold">
                  {c.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const newName = prompt("Nuevo nombre:", c.name);
                  if (newName) save(c.id, { name: newName.trim() });
                }}
              >
                Editar
              </Button>

              <Button
                variant="outline"
                onClick={() => save(c.id, { isActive: !c.isActive })}
              >
                {c.isActive ? "Desactivar" : "Activar"}
              </Button>

              <Button variant="danger" onClick={() => remove(c.id)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}