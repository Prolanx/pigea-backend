export async function prepareInvoiceItems(items = [], merchantId, productDAO) {
  if (!Array.isArray(items)) return [];

  const productItems = items.filter((i) => i && i.productId);
  if (productItems.length === 0) {
    return items;
  }

  const productIds = [...new Set(productItems.map((i) => String(i.productId)))];
  const products = await Promise.all(
    productIds.map((id) => productDAO.findById(id, merchantId))
  );

  const productMap = new Map(
    products.filter(Boolean).map((product) => [String(product._id), product])
  );

  return items.map((item) => {
    if (!item || !item.productId) return item;

    const product = productMap.get(String(item.productId));
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (item.unitPrice != null && Number(item.unitPrice) !== Number(product.price)) {
      throw new Error(
        `Unit price mismatch for product ${item.productId}: expected ${product.price}, got ${item.unitPrice}`
      );
    }

    const sanitizedProductMeta = { ...item.productMeta };
    // preserve extra invoice product metadata (if any) while canonicalizing required fields

    return {
      ...item,
      name: product.name,
      unitPrice: product.price,
      itemCategory: 'product',
      productMeta: sanitizedProductMeta,
    };
  });
}
