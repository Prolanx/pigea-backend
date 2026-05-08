import { ControllerError, DAOError } from '@common/errors.js';
import { buildCustomerApiForInvoice, buildContactEmbedShape } from '@modules/crm/utils/contact-transform.util.js';
import { buildCustomFieldMap } from '@modules/crm/utils/contact-type-response.util.js';
import { sendInvoiceEmail } from '@modules/invoice/utils/send-invoice-email.util.js';
import { constants } from '@common/constants/_index.js';
import { validateInvoiceCustomerEmail } from '@modules/invoice/utils/customer-email-validation.util.js';

export async function createInvoiceAction(controller, invoiceData, merchantId) {
  try {
    const customer = await controller.contactDAO.findById(invoiceData.customerId, merchantId);
    if (!customer) {
      throw new ControllerError('Customer not found', 404);
    }

    validateInvoiceCustomerEmail(customer, invoiceData.customerEmail);

    const merchantAccount = await controller.accountDAO.findById(merchantId);
    const invoiceCategory = invoiceData.invoiceCategory || 'service';
    const businessType = merchantAccount?.onboarding?.businessType;

    try {
      controller.utils.validateInvoiceItems(invoiceData.items, { invoiceCategory });
    } catch (validationError) {
      throw new ControllerError(validationError.message, 400);
    }

    if (invoiceCategory === 'ecommerce' || businessType === 'ecommerce') {
      if (!invoiceData.customerEmail) {
        throw new ControllerError('Customer email is required for ecommerce invoices', 400);
      }
      if (!invoiceData.fulfillmentStatus && !invoiceData.productMeta?.fulfillmentStatus) {
        throw new ControllerError('Fulfillment status is required for ecommerce invoices', 400);
      }
    }

    const derivedCustomerName = controller.utils.getCustomerName(customer);
    const customerName = derivedCustomerName || invoiceData.customerName || invoiceData.customer?.name || '';
    const currency = merchantAccount?.businessInfo?.billingCurrency || invoiceData.currency || 'USD';

    const requestedStatus = (invoiceData.status || 'draft').toLowerCase();
    // Shared invoice email decision logic for create/update auto/draft flows.
    const emailDecision = controller.utils.determineInvoiceEmailDecision({
      requestStatus: requestedStatus,
      isCreation: true
    });

    const enriched = {
      ...invoiceData,
      merchantId,
      customerName,
      customerEmail: invoiceData.customerEmail,
      invoiceCategory,
      currency,
      status: emailDecision.normalizedStatus,
    };

    if (!enriched.issueDate) enriched.issueDate = new Date();
    if (!enriched.dueDate) enriched.dueDate = new Date();

    enriched.items = await controller.utils.prepareInvoiceItems(enriched.items, merchantId, controller.productDAO);

    const taxEnabled = merchantAccount?.businessInfo?.taxEnabled ?? false;
    const taxRate = merchantAccount?.businessInfo?.taxRate ?? 0;
    enriched.tax = controller.utils.calculateTax(enriched.items, taxEnabled, taxRate);

    if (invoiceCategory === 'ecommerce' || businessType === 'ecommerce') {
      enriched.productMeta = controller.utils.buildProductMeta(invoiceData);
      enriched.orderId = enriched.productMeta.orderId;
    } else {
      // Service invoices should not carry ecommerce product metadata
      enriched.productMeta = null;
      enriched.orderId = null;
    }

    const invoiceWithTotals = controller.invoiceCalculator.calculateInvoiceTotals(enriched);

    const invoice = await controller.invoiceDAO.create(invoiceWithTotals);

    const auditEntry = {
      action: emailDecision.auditAction,
      changedAt: new Date()
    };

    const updatedInvoice = await controller.invoiceDAO.updateByIdWithMerchantScope(invoice._id, merchantId, {
      auditTrail: [...(invoice.auditTrail || []), auditEntry],
      // statusHistory is initialized in InvoiceDAO.create() to avoid duplicate root entries
    });

    const customFields = await controller.fieldDefinitionDAO.findByMerchant(merchantId);
    const customFieldMap = buildCustomFieldMap(customFields);
    const formatted = controller.utils.formatInvoice(updatedInvoice, buildContactEmbedShape(customer, customFieldMap));

    if (emailDecision.shouldSendInvoiceEmail) {
      let invoiceForEmail = null;
      let businessData = null;

      const businessName = merchantAccount?.businessInfo?.name || merchantAccount?.businessInfo?.businessName;
      if (!businessName || String(businessName).trim().toLowerCase() === 'your business name') {
        throw new ControllerError('Merchant business name is required before sending invoice email', 400);
      }

      try {
        businessData = {
          logoUrl: merchantAccount?.businessInfo?.logoUrl || null,
          name: businessName,
          email: merchantAccount?.businessInfo?.email || merchantAccount?.email || 'business@example.com'
        };

        const platformData = {
          logoUrl: constants.env.PLATFORM_LOGO_URL,
          name: constants.env.PLATFORM_NAME,
          supportEmail: constants.env.PLATFORM_SUPPORT_EMAIL
        };

        const paymentLinkBase = process.env.FRONTEND_INVOICE_CHECKOUT_URL;
        if (!paymentLinkBase) {
          throw new ControllerError('FRONTEND_INVOICE_CHECKOUT_URL must be set to generate payment link', 500);
        }

        const paymentLink = `${paymentLinkBase}?invoiceNumber=${encodeURIComponent(invoice.invoiceNumber)}`;

        invoiceForEmail = {
          ...invoice.toObject(),
          customer: { data: buildCustomerApiForInvoice(customer)?.data || [] }
        };

        await sendInvoiceEmail(invoiceForEmail, businessData, platformData, controller.emailAdapter, paymentLink);
      } catch (emailError) {
        console.error('Failed to send invoice email during creation:', emailError.message);
        if (invoice) {
          console.error('Invoice ID:', invoice._id?.toString());
        }
        console.error('Customer email data:', invoiceForEmail?.customer?.data);
        console.error('Email payload details:', {
          to: invoiceForEmail?.customer?.data,
          subject: invoice ? `Invoice ${invoice.invoiceNumber} from ${businessData?.name}` : null,
          invoiceId: invoice?._id
        });
        console.error(emailError);
      }
    }

    return formatted;
  } catch (error) {

    console.log('Error in createInvoiceAction:', error);
    if (error instanceof DAOError) {
      throw error;
    }
    throw new ControllerError('Failed to create invoice');
  }
}
