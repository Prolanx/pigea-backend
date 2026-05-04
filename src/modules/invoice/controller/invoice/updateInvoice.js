import { ControllerError, DAOError } from '@common/errors.js';
import { buildCustomerApiForInvoice } from '@modules/crm/utils/contact-transform.util.js';
import { sendInvoiceEmail } from '@modules/invoice/utils/send-invoice-email.util.js';
import { constants } from '@common/constants/_index.js';
import { validateInvoiceCustomerEmail } from '@modules/invoice/utils/customer-email-validation.util.js';

export async function updateInvoiceAction(controller, id, data, merchantId) {
  try {
    const exists = await controller.invoiceDAO.findByIdWithoutMerchantScope(id);
    if (!exists) {
      throw new ControllerError('Invoice not found', 404);
    }

    if (!exists.isLatest) {
      throw new ControllerError('Only the latest version can be edited', 400);
    }

    // Only draft invoices are editable in the current business model.
    if (exists.status !== 'draft') {
      throw new ControllerError('Only draft invoices can be edited', 400);
    }

    const saveAsDraft = data.saveAsDraft === true;

    const customer = await controller.contactDAO.findById(exists.customerId, merchantId);
    if (!customer) {
      throw new ControllerError('Customer not found', 404);
    }

    validateInvoiceCustomerEmail(customer, data.customerEmail || exists.customerEmail);

    const merchantAccount = await controller.accountDAO.findById(merchantId);
    const currency = merchantAccount?.businessInfo?.billingCurrency || data.currency || exists.currency || 'USD';
    const invoiceCategory = data.invoiceCategory || exists.invoiceCategory || 'service';

    try {
      controller.utils.validateInvoiceItems(data.items || exists.items, { invoiceCategory });
    } catch (validationError) {
      throw new ControllerError(validationError.message, 400);
    }

    const itemsForUpdate = data.items || exists.items;

    const requestedStatus = data.status ? String(data.status).toLowerCase() : null;
    // Shared invoice email decision logic for create/update auto/draft flows.
    const emailDecision = controller.utils.determineInvoiceEmailDecision({
      requestStatus: requestedStatus,
      currentStatus: exists.status,
      isCreation: false
    });

    const normalizedStatus = emailDecision.normalizedStatus;
    const statusHistoryEntry = emailDecision.statusHistoryEntry;
    const auditAction = emailDecision.auditAction;

    const normalizedData = {
      ...data,
      customerName: data.customerName || exists.customerName,
      customerEmail: data.customerEmail || exists.customerEmail,
      invoiceCategory,
      currency,
      items: await controller.utils.prepareInvoiceItems(itemsForUpdate, merchantId, controller.productDAO),
    };

    const taxEnabled = merchantAccount?.businessInfo?.taxEnabled ?? false;
    const taxRate = merchantAccount?.businessInfo?.taxRate ?? 0;
    normalizedData.tax = controller.utils.calculateTax(normalizedData.items, taxEnabled, taxRate);

    // Save-as-draft semantics: persist current data only, no status transition or email.
    // Status transitions are managed via PATCH /:id/status.
    if (saveAsDraft) {
      delete normalizedData.saveAsDraft;
    }

    const invoiceWithTotals = controller.invoiceCalculator.calculateInvoiceTotals(normalizedData);

    const updatedInvoice = await controller.invoiceDAO.updateByIdWithMerchantScope(id, merchantId, {
      ...invoiceWithTotals,
      status: normalizedStatus,
      statusHistory: statusHistoryEntry ? [...(exists.statusHistory || []), statusHistoryEntry] : (exists.statusHistory || []),
      auditTrail: auditAction ? [...(exists.auditTrail || []), { action: auditAction, changedAt: new Date() }] : (exists.auditTrail || []),
    });

    if (!updatedInvoice) {
      throw new ControllerError('Failed to update invoice', 500);
    }

    if (!saveAsDraft && emailDecision.shouldSendInvoiceEmail) {
      const businessData = {
        logoUrl: merchantAccount?.businessInfo?.logoUrl || 'https://via.placeholder.com/48',
        name: merchantAccount?.businessInfo?.name || merchantAccount?.businessInfo?.businessName || 'Your Business Name',
        email: merchantAccount?.businessInfo?.email || merchantAccount?.email || 'business@example.com',
      };

      let invoiceForEmail = null;
      try {
        const platformData = {
          logoUrl: constants.env.PLATFORM_LOGO_URL,
          name: constants.env.PLATFORM_NAME,
          supportEmail: constants.env.PLATFORM_SUPPORT_EMAIL,
        };

        let customerData = null;
        try {
          customerData = await controller.contactDAO.findById(updatedInvoice.customerId, merchantId);
        } catch (err) {
          customerData = null;
        }
        const customerApi = customerData ? buildCustomerApiForInvoice(customerData) : null;

        const paymentLinkBase = process.env.FRONTEND_INVOICE_CHECKOUT_URL;
        if (!paymentLinkBase) {
          throw new ControllerError('FRONTEND_INVOICE_CHECKOUT_URL must be set to generate payment link', 500);
        }

        const paymentLink = `${paymentLinkBase}?invoiceNumber=${encodeURIComponent(updatedInvoice.invoiceNumber)}`;

        invoiceForEmail = {
          ...updatedInvoice.toObject(),
          customer: { data: customerApi?.data || [] },
        };

        await sendInvoiceEmail(invoiceForEmail, businessData, platformData, controller.emailAdapter, paymentLink);
      } catch (emailError) {
        console.error('Failed to send invoice email during update:', emailError.message);
        console.error('Customer email data:', invoiceForEmail?.customer?.data);
        console.error(emailError);
      }
    }

    // Keep existing behavior for possible resend/reissued path if logic remains relevant
    if (saveAsDraft !== true && data.resend === true && updatedInvoice.status === 're-issued') {
      const merchantAccount = await controller.accountDAO.findById(merchantId);
      const businessData = {
        logoUrl: merchantAccount?.businessInfo?.logoUrl || 'https://via.placeholder.com/48',
        name: merchantAccount?.businessInfo?.name || merchantAccount?.businessInfo?.businessName || 'Your Business Name',
        email: merchantAccount?.businessInfo?.email || merchantAccount?.email || 'business@example.com',
      };

      let invoiceForEmail = null;
      try {
        const platformData = {
          logoUrl: constants.env.PLATFORM_LOGO_URL,
          name: constants.env.PLATFORM_NAME,
          supportEmail: constants.env.PLATFORM_SUPPORT_EMAIL,
        };

        let customerData = null;
        try {
          customerData = await controller.contactDAO.findById(updatedInvoice.customerId, merchantId);
        } catch (err) {
          customerData = null;
        }
        const customerApi = customerData ? buildCustomerApiForInvoice(customerData) : null;

        invoiceForEmail = {
          ...updatedInvoice.toObject(),
          customer: { data: customerApi?.data || [] },
        };

        await sendInvoiceEmail(invoiceForEmail, businessData, platformData, controller.emailAdapter);
      } catch (emailError) {
        console.error('Failed to resend invoice email during save:', emailError.message);
        console.error('Customer email data:', invoiceForEmail?.customer?.data);
        console.error(emailError);
      }
    }

    return controller.utils.formatInvoice(updatedInvoice);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to update invoice');
  }
}
