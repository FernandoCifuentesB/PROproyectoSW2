"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";

import EventEditorForm from "@/components/admin/EventEditorForm";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import {
  buildEventFormData,
  createEmptyForm,
  createEmptyTicketRow,
  hasErrors,
  mapEventToForm,
  revokeBlobUrl,
  validateForm,
  type EventFormState,
  type TicketFormRow,
} from "@/app/admin/events/form-helpers";
import { useAuth } from "@/lib/auth";
import { apiDelete, apiGet, apiPatchForm, apiPostForm } from "@/lib/api";
import { formatCop, getMinTicketPrice } from "@/lib/tickets";
import { Category, EventItem, TicketType } from "@/lib/types";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700",
      ].join(" ")}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function cloneForm(form: EventFormState): EventFormState {
  return {
    ...form,
    tickets: form.tickets.map((ticket) => ({ ...ticket })),
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [serverError, setServerError] = useState("");
  const [editServerError, setEditServerError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<EventFormState>(createEmptyForm);
  const [editForm, setEditForm] = useState<EventFormState>(createEmptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [createTouched, setCreateTouched] = useState(false);
  const [editTouched, setEditTouched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (token === null) return;
    if (!token) return router.push("/login");
    if (user?.role !== "ADMIN") return router.push("/");
  }, [token, user, router]);

  useEffect(() => {
    return () => {
      revokeBlobUrl(createForm.imagePreview);
      revokeBlobUrl(editForm.imagePreview);
    };
  }, [createForm.imagePreview, editForm.imagePreview]);

  async function load() {
    const [categoryData, eventData, ticketTypeData] = await Promise.all([
      apiGet<Category[]>("/categories"),
      apiGet<EventItem[]>("/events"),
      apiGet<TicketType[]>("/ticket-types"),
    ]);

    setCategories(categoryData);
    setEvents(eventData);
    setTicketTypes(ticketTypeData);
  }

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    load().catch((error: Error) => setServerError(error.message));
  }, [token, user]);

  const createErrors = useMemo(
    () => (createTouched ? validateForm(createForm) : { ticketRows: createForm.tickets.map(() => ({})) }),
    [createForm, createTouched],
  );

  const editErrors = useMemo(
    () => (editTouched ? validateForm(editForm) : { ticketRows: editForm.tickets.map(() => ({})) }),
    [editForm, editTouched],
  );
  function updateForm(
    setter: Dispatch<SetStateAction<EventFormState>>,
    patch: Partial<EventFormState>,
  ) {
    if (setter === setCreateForm) {
      setCreateTouched(true);
    }

    if (setter === setEditForm) {
      setEditTouched(true);
    }

    setter((current) => ({ ...current, ...patch }));
  }

  function updateTicketRow(
    setter: Dispatch<SetStateAction<EventFormState>>,
    index: number,
    patch: Partial<TicketFormRow>,
  ) {
    if (setter === setCreateForm) {
      setCreateTouched(true);
    }

    if (setter === setEditForm) {
      setEditTouched(true);
    }

    setter((current) => ({
      ...current,
      tickets: current.tickets.map((ticket, rowIndex) =>
        rowIndex === index ? { ...ticket, ...patch } : ticket,
      ),
    }));
  }

  function addTicketRow(setter: Dispatch<SetStateAction<EventFormState>>) {
    if (setter === setCreateForm) {
      setCreateTouched(true);
    }

    if (setter === setEditForm) {
      setEditTouched(true);
    }

    setter((current) => ({
      ...current,
      tickets: [...current.tickets, createEmptyTicketRow()],
    }));
  }

  function removeTicketRow(
    setter: Dispatch<SetStateAction<EventFormState>>,
    index: number,
  ) {
    if (setter === setCreateForm) {
      setCreateTouched(true);
    }

    if (setter === setEditForm) {
      setEditTouched(true);
    }

    setter((current) => ({
      ...current,
      tickets: current.tickets.filter((_, rowIndex) => rowIndex !== index),
    }));
  }

  function handleSelectFile(
    currentPreview: string | null,
    setter: Dispatch<SetStateAction<EventFormState>>,
    file: File,
  ) {
    if (setter === setCreateForm) {
      setCreateTouched(true);
    }

    if (setter === setEditForm) {
      setEditTouched(true);
    }

    revokeBlobUrl(currentPreview);
    const preview = URL.createObjectURL(file);

    setter((current) => ({
      ...current,
      imageFile: file,
      imagePreview: preview,
      removeImage: false,
    }));
  }

  function handleRemoveImage(setter: Dispatch<SetStateAction<EventFormState>>) {
    if (setter === setCreateForm) {
      setCreateTouched(true);
    }

    if (setter === setEditForm) {
      setEditTouched(true);
    }

    setter((current) => {
      revokeBlobUrl(current.imagePreview);

      return {
        ...current,
        imageFile: null,
        imagePreview: null,
        imageUrl: null,
        removeImage: true,
      };
    });
  }

  async function handleCreate() {
    setCreateTouched(true);

    const errors = validateForm(createForm);

    if (hasErrors(errors)) {
      return;
    }

    setServerError("");
    setSubmitting(true);

    try {
      await apiPostForm("/events", buildEventFormData(createForm));
      revokeBlobUrl(createForm.imagePreview);
      setCreateForm(createEmptyForm());
      setCreateTouched(false);
      setCreateOpen(false);
      await load();
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, "Error creando evento"));
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(event: EventItem) {
    revokeBlobUrl(editForm.imagePreview);
    setEditingId(event.id);
    setEditForm(cloneForm(mapEventToForm(event)));
    setEditServerError("");
    setEditOpen(true);
    setEditTouched(false);
  }

  async function handleEdit() {
    if (!editingId) return;

    setEditServerError("");
    setEditSubmitting(true);

    try {
      await apiPatchForm<EventItem>(
        `/events/${editingId}`,
        buildEventFormData(editForm, true),
      );
      revokeBlobUrl(editForm.imagePreview);
      setEditOpen(false);
      setEditingId(null);
      setEditForm(createEmptyForm());
      await load();
    } catch (error: unknown) {
      setEditServerError(getErrorMessage(error, "Error actualizando evento"));
    } finally {
      setEditSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar evento?")) return;

    try {
      await apiDelete(`/events/${id}`);
      await load();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Error eliminando evento"));
    }
  }

  if (!token || user?.role !== "ADMIN") {
    return <div className="p-6 text-sm text-[var(--muted)]">Verificando acceso...</div>;
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2 pt-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Gestion de eventos
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Cree el evento y configure sus boletas desde el mismo formulario.
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
            onClick={() => {
              setCreateOpen((prev) => {
                const next = !prev;

                if (!next) {
                  setCreateTouched(false);
                }

                return next;
              });
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-semibold text-[var(--fg)] shadow-sm transition hover:bg-slate-50"
            aria-label={createOpen ? "Cerrar formulario" : "Abrir formulario"}
          >
            {createOpen ? "-" : "+"}
          </button>
        </div>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {createOpen ? (
        <Card className="rounded-3xl p-6 shadow-sm">
          <EventEditorForm
            title="Nuevo evento"
            description="Cree un nuevo evento, suba su imagen y defina las boletas de una vez."
            form={createForm}
            errors={createErrors}
            categories={categories}
            ticketTypes={ticketTypes}
            submitLabel="Crear evento"
            submitting={submitting}
            serverError={serverError}
            onChange={(patch) => updateForm(setCreateForm, patch)}
            onSelectFile={(file) => handleSelectFile(createForm.imagePreview, setCreateForm, file)}
            onRemoveImage={() => handleRemoveImage(setCreateForm)}
            onAddTicket={() => addTicketRow(setCreateForm)}
            onChangeTicket={(index, patch) => updateTicketRow(setCreateForm, index, patch)}
            onRemoveTicket={(index) => removeTicketRow(setCreateForm, index)}
            onCancel={() => {
              setCreateTouched(false);
              setCreateOpen(false);
            }}
            onSubmit={handleCreate}
          />
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
        {events.map((event) => {
          const minPrice = getMinTicketPrice(event);

          return (
            <Card key={event.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-bold">{event.name}</div>
                    <StatusBadge active={event.isActive ?? true} />
                  </div>

                  <div className="text-sm text-[var(--muted)]">
                    {new Date(event.date).toLocaleString()}
                  </div>

                  <div className="text-sm text-[var(--muted)]">
                    {minPrice !== null
                      ? `Desde ${formatCop(minPrice)}`
                      : "Sin boletas configuradas"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => openEdit(event)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => remove(event.id)}>
                    Eliminar
                  </Button>
                  <Link
                    href={`/admin/event-tickets?eventId=${event.id}`}
                    className="rounded-xl border px-3 py-2 text-sm text-[var(--fg)] hover:bg-slate-50"
                  >
                    Gestionar entradas
                  </Link>
                </div>
              </div>

              <div className="line-clamp-2 text-sm text-[var(--muted)]">{event.description}</div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={editOpen}
        onClose={() => {
          revokeBlobUrl(editForm.imagePreview);
          setEditOpen(false);
          setEditingId(null);
          setEditForm(createEmptyForm());
        }}
      >
        <EventEditorForm
          title="Editar evento"
          description="Actualice los datos generales, la imagen y las boletas asociadas."
          form={editForm}
          errors={editErrors}
          categories={categories}
          ticketTypes={ticketTypes}
          submitLabel="Guardar cambios"
          submitting={editSubmitting}
          showStatusToggle
          serverError={editServerError}
          onChange={(patch) => updateForm(setEditForm, patch)}
          onSelectFile={(file) => handleSelectFile(editForm.imagePreview, setEditForm, file)}
          onRemoveImage={() => handleRemoveImage(setEditForm)}
          onAddTicket={() => addTicketRow(setEditForm)}
          onChangeTicket={(index, patch) => updateTicketRow(setEditForm, index, patch)}
          onRemoveTicket={(index) => removeTicketRow(setEditForm, index)}
          onCancel={() => {
            revokeBlobUrl(editForm.imagePreview);
            setEditOpen(false);
            setEditingId(null);
            setEditTouched(false);
            setEditForm(createEmptyForm());
          }}
          onSubmit={handleEdit}
        />
      </Modal>
    </div>
  );
}
