export type Category = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type EventItem = {
  id: string;
  name: string;
  description: string;
  date: string;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  interestCount?: number;
};

export type Paged<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};