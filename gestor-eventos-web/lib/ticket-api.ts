import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import { TicketPurchase } from "./types";

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
};

export async function getTicketTypes() {
  return apiGet("/ticket-types");
}

export async function createTicketType(body: CreateTicketTypePayload) {
  return apiPost("/ticket-types", body);
}

export async function updateTicketType(
  id: string,
  body: UpdateTicketTypePayload,
) {
  return apiPatch(`/ticket-types/${id}`, body);
}

export async function deleteTicketType(id: string) {
  return apiDelete(`/ticket-types/${id}`);
}

export async function getEventTicketsAdmin(eventId: string) {
  return apiGet(`/events/${eventId}/tickets`);
}

export async function getEventTicketsPublic(eventId: string) {
  return apiGet(`/events/public/${eventId}/tickets`);
}

export async function createEventTicket(
  eventId: string,
  body: CreateEventTicketPayload,
) {
  return apiPost(`/events/${eventId}/tickets`, body);
}

export async function updateEventTicket(
  eventId: string,
  eventTicketId: string,
  body: UpdateEventTicketPayload,
) {
  return apiPatch(`/events/${eventId}/tickets/${eventTicketId}`, body);
}

export async function deleteEventTicket(
  eventId: string,
  eventTicketId: string,
) {
  return apiDelete(`/events/${eventId}/tickets/${eventTicketId}`);
}

export async function createTicketPurchase(body: CreatePurchasePayload) {
  return apiPost<{ message: string; purchase: TicketPurchase }>(
    "/ticket-purchases",
    body,
  );
}

export async function getMyTicketPurchases() {
  return apiGet<TicketPurchase[]>("/ticket-purchases/me");
}

export async function getTicketPurchaseById(id: string) {
  return apiGet<TicketPurchase>(`/ticket-purchases/${id}`);
}