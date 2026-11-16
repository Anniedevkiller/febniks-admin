import "server-only";
import { Resend } from "resend";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/types";

function getOrderLink(order: Order) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_USER_SITE_URL || "https://febniks-user.vercel.app"
  ).replace(/\/$/, "");
  return `${baseUrl}/orders/${order.id}`;
}

function renderItemsTable(items: OrderItem[] = [], order: Order) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b;">
          <strong>${escapeHtml(item.meal_name)}</strong> &times; ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; text-align: right; font-weight: 600;">
          ₦${Number(item.unit_price * item.quantity).toLocaleString()}
        </td>
      </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">Item</th>
          <th style="text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding-top: 10px; font-size: 13px; color: #64748b;">Subtotal</td>
          <td style="padding-top: 10px; font-size: 13px; color: #334155; text-align: right;">₦${Number(order.subtotal || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding-top: 6px; font-size: 13px; color: #64748b;">Delivery Fee</td>
          <td style="padding-top: 6px; font-size: 13px; color: #334155; text-align: right;">₦${Number(order.delivery_fee || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding-top: 10px; font-size: 16px; font-weight: 800; color: #0f172a;">Total</td>
          <td style="padding-top: 10px; font-size: 16px; font-weight: 800; color: #E63946; text-align: right;">₦${Number(order.total).toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

function wrapBrandedLayout({
  badgeText,
  badgeColor,
  heading,
  introHtml,
  order,
  items,
  extraNote,
}: {
  badgeText: string;
  badgeColor: string;
  heading: string;
  introHtml: string;
  order: Order;
  items: OrderItem[];
  extraNote?: string | null;
}) {
  const orderLink = getOrderLink(order);
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: #9B2226; padding: 24px 32px; color: #ffffff;">
          <div style="font-size: 20px; font-weight: 900; letter-spacing: 0.5px;">
            FEBNIKS <span style="color: #F4A261;">KITCHEN</span>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">
            Order #${escapeHtml(order.order_number)}
          </div>
        </div>
        <div style="padding: 32px;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${badgeColor}; color: #ffffff; margin-bottom: 16px;">
            ${escapeHtml(badgeText)}
          </span>
          <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #0f172a;">
            ${escapeHtml(heading)}
          </h1>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
            ${introHtml}
          </p>
          ${
            extraNote
              ? `<div style="padding: 14px 16px; background: #fff7ed; border-left: 4px solid #F4A261; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #7c2d12;">
                   <strong>Note from Kitchen:</strong> ${escapeHtml(extraNote)}
                 </div>`
              : ""
          }
          ${renderItemsTable(items, order)}
          <div style="margin-top: 28px; text-align: center;">
            <a href="${orderLink}" style="display: inline-block; background: #E63946; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 12px;">
              Track Order #${escapeHtml(order.order_number)}
            </a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Febniks Kitchen. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | null | undefined;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!to) {
    return { sent: false, error: "Customer has no email address on order." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@febniks.com";

  if (!apiKey || apiKey === "your-resend-key") {
    console.warn("[Resend] Skipping email send because RESEND_API_KEY is not configured.");
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Febniks Kitchen <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error("[Resend Error]", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err: any) {
    console.error("[Resend Exception]", err);
    return { sent: false, error: err?.message || "Failed to send email" };
  }
}

export async function sendPaymentConfirmedEmail(order: Order, items: OrderItem[]) {
  const html = wrapBrandedLayout({
    badgeText: "Payment Confirmed",
    badgeColor: "#16a34a",
    heading: `We received your payment of ₦${Number(order.total).toLocaleString()}!`,
    introHtml: `Hi <strong>${escapeHtml(
      order.customer_name
    )}</strong>, your transfer for order <strong>#${escapeHtml(
      order.order_number
    )}</strong> has been verified. Our kitchen is now getting ready to prepare your meal.`,
    order,
    items,
    extraNote: order.admin_note,
  });

  return sendEmail({
    to: order.customer_email,
    subject: `Payment Confirmed — Order #${order.order_number} | Febniks Kitchen`,
    html,
  });
}

export async function sendPaymentRejectedEmail(order: Order, items: OrderItem[]) {
  const html = wrapBrandedLayout({
    badgeText: "Payment Issue",
    badgeColor: "#dc2626",
    heading: `Action Required on Order #${order.order_number}`,
    introHtml: `Hi <strong>${escapeHtml(
      order.customer_name
    )}</strong>, we could not verify your bank transfer of <strong>₦${Number(
      order.total
    ).toLocaleString()}</strong> for order <strong>#${escapeHtml(
      order.order_number
    )}</strong>. Please review the note below and check your order page.`,
    order,
    items,
    extraNote: order.admin_note,
  });

  return sendEmail({
    to: order.customer_email,
    subject: `Payment Update — Order #${order.order_number} | Febniks Kitchen`,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(
  order: Order,
  items: OrderItem[],
  newStatus: OrderStatus
) {
  const label = ORDER_STATUS_LABELS[newStatus] || newStatus;
  const statusMessages: Partial<Record<OrderStatus, string>> = {
    preparing: "Our chefs have started preparing your fresh meal in the kitchen!",
    ready: "Your order is hot, packed, and ready for pickup or dispatch!",
    out_for_delivery: "Your order is on the way! Our rider is heading to your delivery address.",
    delivered: "Your order has been delivered. Enjoy your meal from Febniks Kitchen!",
    cancelled: "Your order has been cancelled. Please see any note below or contact us if you need assistance.",
  };

  const badgeColors: Partial<Record<OrderStatus, string>> = {
    preparing: "#2563eb",
    ready: "#0891b2",
    out_for_delivery: "#7c3aed",
    delivered: "#16a34a",
    cancelled: "#dc2626",
  };

  const html = wrapBrandedLayout({
    badgeText: label,
    badgeColor: badgeColors[newStatus] || "#E63946",
    heading: `Order #${order.order_number} is now ${label}`,
    introHtml: `Hi <strong>${escapeHtml(order.customer_name)}</strong>, ${
      statusMessages[newStatus] || `your order status has been updated to ${label}.`
    }`,
    order,
    items,
    extraNote: order.admin_note,
  });

  return sendEmail({
    to: order.customer_email,
    subject: `Order #${order.order_number}: ${label} | Febniks Kitchen`,
    html,
  });
}
