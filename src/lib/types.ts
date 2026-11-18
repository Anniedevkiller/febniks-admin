export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "awaiting_confirmation"
  | "paid"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "payment_rejected";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Meal {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  created_at?: string;
  categories?: Category | null;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  meal_id: string | null;
  meal_name: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  fulfillment: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_address: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payer_name: string | null;
  payment_proof_path: string | null;
  customer_marked_paid_at: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  admin_note: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface PaymentSettings {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  instructions: string | null;
  updated_at?: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  type: string;
  priority: TicketPriority;
  status: TicketStatus;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
  orders?: Order | null;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: "customer" | "admin";
  body: string;
  created_at: string;
  profiles?: Profile | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  quantity: number;
  low_level: number;
  critical_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  item_id: string;
  change: number;
  quantity_after: number;
  reason: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
  inventory_items?: InventoryItem | null;
  profiles?: Profile | null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  awaiting_confirmation: "Awaiting Confirmation",
  paid: "Paid",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_rejected: "Payment Rejected",
};

export const VALID_FULFILLMENT_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["cancelled"],
  awaiting_confirmation: ["cancelled"], // paid & payment_rejected handled by confirm/reject endpoints
  paid: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "delivered", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  payment_rejected: ["cancelled"],
};
