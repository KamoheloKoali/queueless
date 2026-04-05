export function formatOrderNumber(orderNumber: number) {
  return `ORD-${String(orderNumber).padStart(6, "0")}`;
}
