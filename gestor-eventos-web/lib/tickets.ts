import { EventItem, EventTicket } from "./types";

export function getAvailableStock(ticket: EventTicket) {
  return Math.max(0, ticket.stock - ticket.sold);
}

export function isTicketSoldOut(ticket: EventTicket) {
  return getAvailableStock(ticket) <= 0;
}

export function getActiveAvailableTickets(event: EventItem) {
  return (event.eventTickets ?? []).filter(
    (ticket) =>
      ticket.isActive &&
      ticket.ticketType?.isActive !== false &&
      getAvailableStock(ticket) > 0,
  );
}

export function getMinTicketPrice(event: EventItem): number | null {
  const prices = getActiveAvailableTickets(event).map((ticket) => ticket.price);

  if (!prices.length) {
    const fallback = typeof event.price === "number" ? event.price : null;
    return fallback;
  }

  return Math.min(...prices);
}

export function formatCop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}