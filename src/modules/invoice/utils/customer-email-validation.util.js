import { ControllerError } from '@common/errors.js';

export function getCustomerEmailFromContact(customer) {
  if (!customer || typeof customer !== 'object') return null;
  const email = customer?.data?.sys_email || customer?.email;
  return typeof email === 'string' && email.trim() ? email.trim() : null;
}

export function validateInvoiceCustomerEmail(customer, providedEmail) {
  if (!providedEmail) return;

  const customerEmail = getCustomerEmailFromContact(customer);
  if (!customerEmail) {
    throw new ControllerError('Customer record does not contain an email to validate against', 400);
  }

  if (String(providedEmail).trim().toLowerCase() !== customerEmail.toLowerCase()) {
    throw new ControllerError('Customer email does not match customer record', 400);
  }
}
