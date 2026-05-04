import { generateInvoiceEmailHTML } from './email-templates/invoice-email-template.util.js';

/**
 * Send invoice email to customer
 * @param {Object} invoice - Invoice object with populated customer
 * @param {Object} businessData - Merchant business data { logoUrl, name, email }
 * @param {Object} platformData - Platform branding data { logoUrl, name, supportEmail }
 * @param {Object} emailAdapter - Email adapter instance
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails
 */
export async function sendInvoiceEmail(invoice, businessData, platformData, emailAdapter, paymentLink = null) {
  if (!invoice) {
    throw new Error('Invoice is required for invoice email');
  }

  const customerData = Array.isArray(invoice.customer?.data) ? invoice.customer.data : [];
  if (!Array.isArray(invoice.customer?.data)) {
    console.warn('Invoice customer.data is not array, falling back to top-level fields');
  }

  const customerEmail = getFieldValue(customerData, 'sys_email') || invoice.customerEmail || invoice.customer?.email;
  const customerName = getFieldValue(customerData, 'sys_name') || invoice.customerName || invoice.customer?.name;

  if (!customerEmail) {
    throw new Error('Customer email not found - cannot send invoice');
  }

  if (!customerName) {
    throw new Error('Customer name not found - cannot send invoice');
  }

  if (!businessData || !businessData.name || !businessData.email) {
    throw new Error('Merchant business name/email is missing for invoice email');
  }

  const normalizedName = String(businessData.name).trim().toLowerCase();
  if (normalizedName === 'your business name' || normalizedName === '') {
    throw new Error('Merchant business name is invalid or placeholder value; cannot send invoice email');
  }

  if (!platformData || !platformData.name || !platformData.supportEmail) {
    throw new Error('Platform name/support email is missing for invoice email');
  }

  // Format invoice dates and times
  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    return `${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  const issueDate = formatDateTime(invoice.issueDate || invoice.createdAt);
  const invoiceDate = issueDate; // invoice date should reflect issue date
  const dueDate = formatDateTime(invoice.dueDate);

  // Calculate tax rate percentage
  const taxRate = invoice.subtotal > 0 
    ? ((invoice.tax / invoice.subtotal) * 100).toFixed(2)
    : '0.00';

  // Prepare template data
  const templateData = {
    businessLogoUrl: businessData.logoUrl,
    businessName: businessData.name,
    businessEmail: businessData.email,
    platformLogoUrl: platformData.logoUrl,
    platformName: platformData.name,
    platformSupportEmail: platformData.supportEmail,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate,
    issueDate,
    dueDate,
    customerName,
    customerEmail,
    items: invoice.items,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    taxRate,
    total: invoice.total,
    paymentLink
  };

  // Generate HTML email content
  const htmlContent = generateInvoiceEmailHTML(templateData);

  // Email options
  const emailOptions = {
    to: customerEmail,
    subject: `Invoice ${invoice.invoiceNumber} from ${businessData.name}`,
    html: htmlContent
  };

  // Send email using email adapter
  try {
    const sendFn = emailAdapter.sendEmail || emailAdapter.sendMail;
    if (typeof sendFn !== 'function') {
      throw new Error('No sendEmail/sendMail function available on emailAdapter');
    }

    await sendFn({
      to: customerEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${businessData.name}`,
      html: htmlContent,
      text: `Invoice ${invoice.invoiceNumber} is ready. View it at ${paymentLink || 'your portal'}`
    });

    console.log(`✅ Invoice email sent successfully to ${customerEmail} for invoice ${invoice.invoiceNumber}`);
  } catch (error) {
    console.error(`❌ Failed to send invoice email to ${customerEmail}:`, error.message);
    throw new Error(`Failed to send invoice email: ${error.message}`);
  }
}

/**
 * Get field value from customer data array
 * @param {Array} dataArray - Customer data array [{id, key, value, isSystem}]
 * @param {string} fieldKey - Field key to search for (e.g., 'sys_name', 'sys_email')
 * @returns {*} Field value or undefined
 */
function getFieldValue(dataArray, fieldKey) {
  if (!Array.isArray(dataArray)) return undefined;
  const field = dataArray.find(f => f.key === fieldKey || f.id === fieldKey);
  return field?.value;
}
