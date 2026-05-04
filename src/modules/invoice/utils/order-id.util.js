export function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
