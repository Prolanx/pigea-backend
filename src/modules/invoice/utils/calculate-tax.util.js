export function calculateTax(items = [], taxEnabled = false, taxRate = 0) {
  if (!taxEnabled) return 0;

  const rate = Number(taxRate) || 0;
  if (rate <= 0) return 0;

  const productsTotal = (items || []).reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    const subtotal = quantity * unitPrice;
    const name = (item?.name || "").toLowerCase();

    if (name.includes("shipping") || name.includes("delivery")) {
      return sum;
    }

    return sum + subtotal;
  }, 0);

  return +(productsTotal * (rate / 100)).toFixed(2);
}
