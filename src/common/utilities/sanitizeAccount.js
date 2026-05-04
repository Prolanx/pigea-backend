// Utility to produce a safe, public-facing account object from a raw DB document

/**
 * Returns true when businessInfo contains only Mongoose schema defaults
 * (i.e. the merchant has never actually saved their business info).
 * Mirrors the normalization logic in BusinessInfoController.getBusinessInfo.
 */
function isBusinessInfoEmpty(bi) {
  if (!bi) return true;

  const stringFields = [
    'name', 'email', 'phone',
    'address', 'city', 'state', 'country',
    'industry', 'taxId', 'billingCurrency', 'invoiceNote',
  ];
  const numericFields = ['taxRate', 'defaultShippingCost', 'lowStockThreshold'];

  const allStringsEmpty = stringFields.every((f) => !bi[f] || String(bi[f]).trim() === '');
  const allNumericsEmpty = numericFields.every((f) => bi[f] == null || Number(bi[f]) === 0);
  const logoEmpty = bi.logo === null || bi.logo === undefined || bi.logo === '';
  const hasUseAccountEmailFlag = bi.useAccountEmailAsBusinessEmail === true;

  return !hasUseAccountEmailFlag && allStringsEmpty && allNumericsEmpty && logoEmpty;
}

export function sanitizeAccount(account) {
  if (!account) return null;

  const {
    _id,
    firstName,
    lastName,
    email,
    role,
    isVerified,
    onboarding,
    businessInfo,
  } = account;

  return {
    id: _id,
    firstName,
    lastName,
    email,
    role,
    verified: Boolean(isVerified),
    onboarding: onboarding || null,
    businessInfo: isBusinessInfoEmpty(businessInfo) ? null : businessInfo,
  };
}
