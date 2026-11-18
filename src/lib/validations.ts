import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.partial();

export const mealSchema = z.object({
  category_id: z.string().uuid("Valid category is required").nullable().optional(),
  name: z.string().trim().min(1, "Meal name is required").max(150),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().trim().max(1000).nullable().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  image_url: z.string().url("Invalid image URL").nullable().optional().or(z.literal("")),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export const mealUpdateSchema = mealSchema.partial();

export const confirmPaymentSchema = z.object({
  admin_note: z.string().trim().max(500).optional().nullable(),
});

export const rejectPaymentSchema = z.object({
  admin_note: z.string().trim().min(1, "Reason for rejection (admin note) is required").max(500),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
  admin_note: z.string().trim().max(500).optional().nullable(),
});

export const paymentSettingsSchema = z.object({
  bank_name: z.string().trim().min(2, "Bank name is required").max(100),
  account_name: z.string().trim().min(2, "Account name is required").max(150),
  account_number: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Account number must be a valid 10-digit NUBAN"),
  instructions: z.string().trim().max(1000).optional().nullable(),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(150),
  phone: z.string().trim().max(40).optional().nullable(),
});

// Support Ticket & Messages Schemas
export const ticketCreateSchema = z.object({
  customer_name: z.string().trim().min(1, "Customer name is required").max(100),
  customer_email: z.string().trim().email("Invalid email").optional().nullable(),
  user_id: z.string().uuid("Invalid user ID").optional().nullable(),
  order_id: z.string().uuid("Invalid order ID").optional().nullable(),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(150),
  type: z.string().trim().min(1).default("general"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  initial_message: z.string().trim().min(1, "Message is required").max(2000),
});

export const ticketUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const supportMessageSchema = z.object({
  body: z.string().trim().min(1, "Message body cannot be empty").max(2000),
});

// Inventory Schemas
export const inventoryItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(100),
  category: z.string().trim().max(50).optional().nullable(),
  unit: z.string().trim().min(1, "Unit is required").max(20).default("kg"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative").default(0),
  low_level: z.coerce.number().min(0).default(15),
  critical_level: z.coerce.number().min(0).default(5),
  is_active: z.boolean().default(true),
});

export const inventoryItemUpdateSchema = inventoryItemSchema.partial();

export const inventoryAdjustSchema = z.object({
  p_item_id: z.string().uuid("Invalid item ID"),
  p_change: z.coerce.number().refine((val) => val !== 0, "Change amount cannot be zero"),
  p_reason: z.string().trim().min(1, "Reason is required").max(100).default("adjustment"),
  p_note: z.string().trim().max(500).optional().nullable(),
});

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
