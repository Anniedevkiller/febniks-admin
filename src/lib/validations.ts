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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
