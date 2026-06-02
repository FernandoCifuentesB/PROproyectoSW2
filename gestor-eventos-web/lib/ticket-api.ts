import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import { EventTicket, TicketPurchase, TicketType } from "./types";
import type { PaymentProvider } from "./payment-types";

export type { PaymentProvider };

export type CreateTicketTypePayload = {
  name: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateTicketTypePayload = Partial<CreateTicketTypePayload>;

export type CreateEventTicketPayload = {
  ticketTypeId: string;
  price: number;
  stock: number;
  isActive?: boolean;
};

export type UpdateEventTicketPayload = {
  price?: number;
  stock?: number;
  isActive?: boolean;
};

export type CreatePurchasePayload = {
  eventTicketId: string;
  quantity: number;
  provider: PaymentProvider;
  cardNumber: string;
  cvv?: string;
  paymentTrackingId: string;
};

export type CreateTicketPurchaseResponse = {
  message: string;
  purchase: TicketPurchase | null;
  payment?: unknown;
};

export async function getTicketTypes() {
  return apiGet<TicketType[]>("/ticket-types");
}

export async function createTicketType(body: CreateTicketTypePayload) {
  return apiPost<TicketType>("/ticket-types", body);
}

export async function updateTicketType(
  id: string,
  body: UpdateTicketTypePayload,
) {
  return apiPatch<TicketType>(`/ticket-types/${id}`, body);
}

export async function deleteTicketType(id: string) {
  return apiDelete(`/ticket-types/${id}`);
}

export async function getEventTicketsAdmin(eventId: string) {
  return apiGet<EventTicket[]>(`/events/${eventId}/tickets`);
}

export async function getEventTicketsPublic(eventId: string) {
  return apiGet<EventTicket[]>(`/events/public/${eventId}/tickets`);
}

export async function createEventTicket(
  eventId: string,
  body: CreateEventTicketPayload,
) {
  return apiPost<EventTicket>(`/events/${eventId}/tickets`, body);
}

export async function updateEventTicket(
  eventId: string,
  eventTicketId: string,
  body: UpdateEventTicketPayload,
) {
  return apiPatch<EventTicket>(
    `/events/${eventId}/tickets/${eventTicketId}`,
    body,
  );
}

export async function deleteEventTicket(
  eventId: string,
  eventTicketId: string,
) {
  return apiDelete(`/events/${eventId}/tickets/${eventTicketId}`);
}

export async function createTicketPurchase(payload: CreatePurchasePayload) {
  return apiPost<CreateTicketPurchaseResponse>("/ticket-purchases", payload);
}

export async function getMyTicketPurchases() {
  return apiGet<TicketPurchase[]>("/ticket-purchases/me");
}

export async function getTicketPurchaseById(id: string) {
  return apiGet<TicketPurchase>(`/ticket-purchases/${id}`);
}