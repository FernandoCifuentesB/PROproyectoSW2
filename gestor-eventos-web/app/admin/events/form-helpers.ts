import { EventItem } from "@/lib/types";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export type TicketFormRow = {
  id?: string;
  ticketTypeId: string;
  price: string;
  stock: string;
  isActive: boolean;
  sold: number;
};

export type EventFormState = {
  name: string;
  categoryId: string;
  date: string;
  description: string;
  imageFile: File | null;
  imageUrl: string | null;
  imagePreview: string | null;
  removeImage: boolean;
  tickets: TicketFormRow[];
  isActive: boolean;
};

export type TicketRowErrors = {
  ticketTypeId?: string;
  price?: string;
  stock?: string;
};

export type FormErrors = {
  name?: string;
  categoryId?: string;
  date?: string;
  description?: string;
  image?: string;
  tickets?: string;
  ticketRows: TicketRowErrors[];
};

export function createEmptyTicketRow(): TicketFormRow {
  return {
    ticketTypeId: "",
    price: "",
    stock: "",
    isActive: true,
    sold: 0,
  };
}

export function createEmptyForm(): EventFormState {
  return {
    name: "",
    categoryId: "",
    date: "",
    description: "",
    imageFile: null,
    imageUrl: null,
    imagePreview: null,
    removeImage: false,
    tickets: [createEmptyTicketRow()],
    isActive: true,
  };
}

export function revokeBlobUrl(url?: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function toDatetimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function validateForm(form: EventFormState): FormErrors {
  const errors: FormErrors = {
    ticketRows: form.tickets.map(() => ({})),
  };

  const trimmedName = form.name.trim();
  if (!trimmedName) errors.name = "El nombre es obligatorio.";
  else if (trimmedName.length < 3) errors.name = "Minimo 3 caracteres.";
  else if (trimmedName.length > 60) errors.name = "Maximo 60 caracteres.";

  if (!form.categoryId) errors.categoryId = "Seleccione una categoria.";

  if (!form.date) {
    errors.date = "La fecha es obligatoria.";
  } else {
    const eventDate = new Date(form.date);
    if (Number.isNaN(eventDate.getTime())) errors.date = "Fecha invalida.";
    else if (eventDate <= new Date()) errors.date = "El evento debe programarse en una fecha futura.";
  }

  const trimmedDescription = form.description.trim();
  if (!trimmedDescription) errors.description = "La descripcion es obligatoria.";
  else if (trimmedDescription.length < 10) errors.description = "Minimo 10 caracteres.";
  else if (trimmedDescription.length > 240) errors.description = "Maximo 240 caracteres.";

  if (form.imageFile) {
    if (!form.imageFile.type.startsWith("image/")) {
      errors.image = "Solo se permiten imagenes.";
    } else if (form.imageFile.size > MAX_IMAGE_SIZE) {
      errors.image = "La imagen no puede superar 5 MB.";
    }
  }

  if (!form.tickets.length) {
    errors.tickets = "Debe agregar al menos una boleta.";
    return errors;
  }

  const seenTypes = new Set<string>();

  form.tickets.forEach((ticket, index) => {
    const rowErrors = errors.ticketRows[index];

    if (!ticket.ticketTypeId) {
      rowErrors.ticketTypeId = "Seleccione un tipo.";
    } else if (seenTypes.has(ticket.ticketTypeId)) {
      rowErrors.ticketTypeId = "Este tipo ya fue agregado.";
    } else {
      seenTypes.add(ticket.ticketTypeId);
    }

    if (!ticket.price.trim()) {
      rowErrors.price = "Ingrese el precio.";
    } else {
      const price = Number(ticket.price);
      if (!Number.isInteger(price) || price <= 0) {
        rowErrors.price = "Debe ser un entero mayor a 0.";
      }
    }

    if (!ticket.stock.trim()) {
      rowErrors.stock = "Ingrese el stock.";
    } else {
      const stock = Number(ticket.stock);
      if (!Number.isInteger(stock) || stock < ticket.sold) {
        rowErrors.stock =
          ticket.sold > 0
            ? `No puede ser menor a lo vendido (${ticket.sold}).`
            : "Debe ser un entero mayor o igual a 0.";
      }
    }
  });

  if (errors.ticketRows.some((row) => row.ticketTypeId || row.price || row.stock)) {
    errors.tickets = "Revise las boletas configuradas.";
  }

  return errors;
}

export function hasErrors(errors: FormErrors) {
  return Boolean(
    errors.name ||
      errors.categoryId ||
      errors.date ||
      errors.description ||
      errors.image ||
      errors.tickets,
  );
}

export function buildEventFormData(form: EventFormState, includeStatus = false) {
  const data = new FormData();

  data.append("name", form.name.trim());
  data.append("categoryId", form.categoryId);
  data.append("date", new Date(form.date).toISOString());
  data.append("description", form.description.trim());
  data.append(
    "tickets",
    JSON.stringify(
      form.tickets.map((ticket) => ({
        ...(ticket.id ? { id: ticket.id } : {}),
        ticketTypeId: ticket.ticketTypeId,
        price: Number(ticket.price),
        stock: Number(ticket.stock),
        isActive: ticket.isActive,
      })),
    ),
  );

  if (includeStatus) data.append("isActive", String(form.isActive));
  if (form.removeImage) data.append("removeImage", "true");
  if (form.imageFile) data.append("image", form.imageFile);

  return data;
}

export function mapEventToForm(event: EventItem): EventFormState {
  return {
    name: event.name ?? "",
    categoryId: event.categoryId ?? "",
    date: toDatetimeLocalValue(event.date),
    description: event.description ?? "",
    imageFile: null,
    imageUrl: event.imageUrl ?? null,
    imagePreview: null,
    removeImage: false,
    tickets:
      event.eventTickets?.length
        ? event.eventTickets.map((ticket) => ({
            id: ticket.id,
            ticketTypeId: ticket.ticketTypeId,
            price: String(ticket.price),
            stock: String(ticket.stock),
            isActive: ticket.isActive,
            sold: ticket.sold ?? 0,
          }))
        : [createEmptyTicketRow()],
    isActive: event.isActive ?? true,
  };
}
