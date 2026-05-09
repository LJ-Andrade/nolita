const emptyValue = "";

function escapeHtml(value) {
  return String(value ?? emptyValue)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  const amount = Number.parseFloat(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `$ ${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount)}`;
}

function buildOrderXls(order) {
  const rows = [
    ["Pedido", `#${order.id}`],
    ["Estado", order.status],
    ["Cliente", order.customer?.name || order.shipping_address?.name || emptyValue],
    ["Email", order.customer?.email || order.shipping_address?.email || emptyValue],
    ["Teléfono", order.customer?.phone || order.shipping_address?.phone || emptyValue],
    ["Total", formatMoney(order.total_amount)],
  ];

  const itemRows = (order.items || []).map((item) => {
    const variant = [
      item.variant?.color?.name,
      item.variant?.size?.name,
    ].filter(Boolean).join(" / ");

    return `
      <tr>
        <td>${escapeHtml(item.product_name)}</td>
        <td>${escapeHtml(variant)}</td>
        <td>${escapeHtml(item.variant?.sku || emptyValue)}</td>
        <td>${escapeHtml(item.quantity || 0)}</td>
        <td>${escapeHtml(formatMoney(item.unit_price))}</td>
        <td>${escapeHtml(formatMoney(item.subtotal))}</td>
      </tr>
    `;
  }).join("");

  return `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <table>
          <tbody>
            ${rows.map(([label, value]) => `
              <tr>
                <th>${escapeHtml(label)}</th>
                <td>${escapeHtml(value)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <br />
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Variante</th>
              <th>SKU</th>
              <th>Cantidad</th>
              <th>Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </body>
    </html>
  `;
}

export function exportOrderXls(order) {
  const blob = new Blob([buildOrderXls(order)], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `order-${order.id}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
