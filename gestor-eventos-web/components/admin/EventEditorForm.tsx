"use client";

import { ChangeEvent, DragEvent, ReactNode, useRef } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { resolveApiAssetUrl } from "@/lib/api";
import { Category, TicketType } from "@/lib/types";
import {
  EventFormState,
  FormErrors,
  hasErrors,
  TicketFormRow,
} from "@/app/admin/events/form-helpers";

function RequiredLabel({ children }: { children: ReactNode }) {
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
        active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700",
      ].join(" ")}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function getPreviewUrl(form: EventFormState) {
  if (form.imagePreview) return form.imagePreview;
  return resolveApiAssetUrl(form.imageUrl);
}

function ImageDropzone({
  form,
  error,
  onSelectFile,
  onRemoveImage,
}: {
  form: EventFormState;
  error?: string;
  onSelectFile: (file: File) => void;
  onRemoveImage: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrl = getPreviewUrl(form);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onSelectFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium text-[var(--fg)]">Imagen del evento</label>

      <div
        className="rounded-3xl border border-dashed border-[var(--border)] bg-slate-50/70 p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        {previewUrl ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <img
                src={previewUrl}
                alt="Vista previa del evento"
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                Reemplazar imagen
              </Button>
              <Button type="button" variant="outline" onClick={onRemoveImage}>
                Quitar imagen
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-white text-center">
            <div className="text-sm font-semibold text-slate-700">
              Arrastre una imagen aqui o subala desde su equipo
            </div>
            <p className="max-w-md text-xs text-[var(--muted)]">
              Formatos recomendados: JPG, PNG o WEBP. Tamano maximo 5 MB.
            </p>
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              Seleccionar archivo
            </Button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />

      <p className="min-h-[20px] text-xs text-red-600">{error ?? ""}</p>
    </div>
  );
}

function TicketRowsEditor({
  rows,
  errors,
  ticketTypes,
  onChangeRow,
  onAddRow,
  onRemoveRow,
}: {
  rows: TicketFormRow[];
  errors: FormErrors;
  ticketTypes: TicketType[];
  onChangeRow: (index: number, patch: Partial<TicketFormRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}) {
  return (
    <div className="space-y-4 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <RequiredLabel>Boletas del evento</RequiredLabel>
          <p className="text-xs text-[var(--muted)]">
            Configure precio y stock por cada tipo de boleta.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onAddRow}>
          Agregar boleta
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => {
          const rowErrors = errors.ticketRows[index] ?? {};

          return (
            <div
              key={row.id ?? `new-${index}`}
              className="rounded-3xl border border-[var(--border)] bg-slate-50/60 p-4"
            >
              <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto]">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--fg)]">Tipo de boleta</label>
                  <Select
                    value={row.ticketTypeId}
                    disabled={Boolean(row.id && row.sold > 0)}
                    onChange={(event) => onChangeRow(index, { ticketTypeId: event.target.value })}
                  >
                    <option value="">Seleccione tipo</option>
                    {ticketTypes.map((type) => (
                      <option
                        key={type.id}
                        value={type.id}
                        disabled={!type.isActive && type.id !== row.ticketTypeId}
                      >
                        {type.name}
                        {!type.isActive && type.id === row.ticketTypeId ? " (inactivo)" : ""}
                      </option>
                    ))}
                  </Select>
                  <p className="min-h-[20px] text-xs text-red-600">
                    {rowErrors.ticketTypeId ?? ""}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--fg)]">Precio</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="50000"
                    value={row.price}
                    onChange={(event) => onChangeRow(index, { price: event.target.value })}
                  />
                  <p className="min-h-[20px] text-xs text-red-600">{rowErrors.price ?? ""}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--fg)]">Stock</label>
                  <Input
                    type="number"
                    min={row.sold}
                    placeholder="100"
                    value={row.stock}
                    onChange={(event) => onChangeRow(index, { stock: event.target.value })}
                  />
                  <p className="min-h-[20px] text-xs text-red-600">{rowErrors.stock ?? ""}</p>
                </div>

                <div className="flex flex-col items-end justify-between gap-3">
                  <label className="flex items-center gap-2 pt-8 text-sm font-medium text-[var(--fg)]">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      onChange={(event) => onChangeRow(index, { isActive: event.target.checked })}
                    />
                    Activa
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={row.sold > 0}
                    onClick={() => onRemoveRow(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              {row.sold > 0 ? (
                <p className="mt-2 text-xs text-amber-700">
                  Esta boleta ya tiene {row.sold} ventas. No puede eliminarse y el stock no puede
                  quedar por debajo de ese valor.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="min-h-[20px] text-xs text-red-600">{errors.tickets ?? ""}</p>
    </div>
  );
}

export default function EventEditorForm({
  title,
  description,
  form,
  errors,
  categories,
  ticketTypes,
  submitLabel,
  submitting,
  showStatusToggle = false,
  serverError,
  onChange,
  onSelectFile,
  onRemoveImage,
  onAddTicket,
  onChangeTicket,
  onRemoveTicket,
  onCancel,
  onSubmit,
}: {
  title: string;
  description: string;
  form: EventFormState;
  errors: FormErrors;
  categories: Category[];
  ticketTypes: TicketType[];
  submitLabel: string;
  submitting: boolean;
  showStatusToggle?: boolean;
  serverError?: string;
  onChange: (patch: Partial<EventFormState>) => void;
  onSelectFile: (file: File) => void;
  onRemoveImage: () => void;
  onAddTicket: () => void;
  onChangeTicket: (index: number, patch: Partial<TicketFormRow>) => void;
  onRemoveTicket: (index: number) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      {serverError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      ) : null}

      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5">
        <div className="mb-1 text-lg font-bold text-[var(--fg)]">{title}</div>
        <p className="text-sm text-[var(--muted)]">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <RequiredLabel>Nombre del evento</RequiredLabel>
          <Input
            placeholder="Ej. Concierto en Tunja"
            value={form.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
          <p className="min-h-[20px] text-xs text-red-600">{errors.name ?? ""}</p>
        </div>

        <div className="space-y-1.5">
          <RequiredLabel>Categoria</RequiredLabel>
          <Select value={form.categoryId} onChange={(event) => onChange({ categoryId: event.target.value })}>
            <option value="">Seleccione categoria</option>
            {categories
              .filter((category) => category.isActive || category.id === form.categoryId)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </Select>
          <p className="min-h-[20px] text-xs text-red-600">{errors.categoryId ?? ""}</p>
        </div>

        <div className="space-y-1.5">
          <RequiredLabel>Fecha y hora</RequiredLabel>
          <Input
            type="datetime-local"
            value={form.date}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(event) => onChange({ date: event.target.value })}
          />
          <p className="min-h-[20px] text-xs text-red-600">{errors.date ?? ""}</p>
        </div>

        {showStatusToggle ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fg)]">Estado del evento</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange({ isActive: !form.isActive })}
                className={`relative flex h-8 w-16 items-center rounded-full transition ${
                  form.isActive ? "bg-green-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition ${
                    form.isActive ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
              <StatusBadge active={form.isActive} />
            </div>
          </div>
        ) : null}

        <ImageDropzone
          form={form}
          error={errors.image}
          onSelectFile={onSelectFile}
          onRemoveImage={onRemoveImage}
        />

        <div className="space-y-1.5 md:col-span-2">
          <RequiredLabel>Descripcion</RequiredLabel>
          <textarea
            value={form.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Describe brevemente el evento..."
            className="min-h-[110px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300"
          />
          <div className="flex items-center justify-between">
            <p className="min-h-[20px] text-xs text-red-600">{errors.description ?? ""}</p>
            <span className="text-xs text-[var(--muted)]">{form.description.trim().length}/240</span>
          </div>
        </div>

        <TicketRowsEditor
          rows={form.tickets}
          errors={errors}
          ticketTypes={ticketTypes}
          onChangeRow={onChangeTicket}
          onAddRow={onAddTicket}
          onRemoveRow={onRemoveTicket}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={onSubmit} disabled={submitting || hasErrors(errors)}>
          {submitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
