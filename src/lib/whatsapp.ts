// ============================================================
// WHATSAPP INTEGRATION — HogarModa
// Genera un enlace WhatsApp API con el resumen del pedido.
// Número del vendedor: 3165517051 (Colombia +57)
// ============================================================

import type { OrderItem } from './types';

const VENDOR_PHONE = '573165517051';

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface OrderDetails {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  total: number;
}

export function generateWhatsAppLink(order: OrderDetails): string {
  const itemsList = order.items
    .map((item) => {
      const sizeTag = item.selectedSize ? ` [Talla/Medida: ${item.selectedSize}]` : '';
      return `  • ${item.name}${sizeTag} x${item.quantity} — ${formatCOP(item.price * item.quantity)}`;
    })
    .join('\n');

  const message = `
🛍️ *NUEVO PEDIDO — HogarModa*
━━━━━━━━━━━━━━━━━━━━

👤 *Cliente:* ${order.customerName}
📱 *Teléfono:* ${order.phone}
📍 *Dirección:* ${order.address}
${order.notes ? `📝 *Notas:* ${order.notes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🛒 *Productos:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: ${formatCOP(order.total)}*

📦 Modalidad: *Contraentrega*
`.trim();

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${VENDOR_PHONE}?text=${encoded}`;
}
