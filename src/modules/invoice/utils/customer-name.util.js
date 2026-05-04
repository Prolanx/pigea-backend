export function getCustomerName(customer) {
  if (!customer) return '';
  // Primary source: canonical sys_name stored in contact.data
  if (customer?.data?.sys_name) return customer.data.sys_name;
  // Legacy fallbacks for older contact documents
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || customer?.name || '';
}
