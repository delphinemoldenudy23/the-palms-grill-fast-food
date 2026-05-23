export function buildWhatsAppUrl(cart, customer, orderType, notes) {
  const lines = [
    "*New Order — The Palm's Grill & Fast Food*",
    "",
    `*Name:* ${customer.name}`,
    `*Phone:* ${customer.phone}`,
    `*Type:* ${orderType === "delivery" ? "Delivery" : "Pickup"}`,
  ];

  if (orderType === "delivery" && customer.address) {
    lines.push(`*Address:* ${customer.address}`);
  }

  lines.push("", "*Items:*");
  cart.forEach((item) => {
    lines.push(
      `• ${item.name} (${item.size}) x${item.quantity} — GH¢${(item.price * item.quantity).toFixed(2)}`
    );
  });

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  lines.push("", `*Total: GH¢${total.toFixed(2)}*`);
  if (notes) lines.push(`*Notes:* ${notes}`);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/233551720664?text=${text}`;
}
