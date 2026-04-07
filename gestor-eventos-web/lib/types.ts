export type Category = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type TicketType = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EventTicket = {
  id: string;
  eventId: string;
  ticketTypeId: string;
  price: number;
  stock: number;
  sold: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  ticketType?: TicketType;
};

export type EventItem = {
  id: string;
  name: string;
  description: string;
  date: string;
  price?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  interestCount?: number;
  eventTickets?: EventTicket[];
};

export type Paged<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export type TicketPurchase = {
  id: string;
  userId: string;
  eventId: string;
  eventTicketId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
  event?: EventItem;
  eventTicket?: EventTicket;
};