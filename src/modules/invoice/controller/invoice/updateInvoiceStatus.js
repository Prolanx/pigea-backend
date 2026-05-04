import { ControllerError, DAOError } from '@common/errors.js';
import { buildCustomerApiForInvoice } from '@modules/crm/utils/contact-transform.util.js';
import { sendInvoiceEmail } from '@modules/invoice/utils/send-invoice-email.util.js';
import { constants } from '@common/constants/_index.js';

export const STATUS_TRANSITIONS = {
  new: ['sent', 'cancelled'],
  sent: ['re-issued', 'paid', 'cancelled'],
  overdue: ['re-issued', 'cancelled'],
  're-issued': ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
};

export const shouldTriggerEmail = (status) => ['sent', 're-issued'].includes(status);

export async function updateInvoiceStatusAction(controller, id, status, merchantId) {
  try {
    const current = await controller.invoiceDAO.findById(id);
    if (!current) {
      throw new ControllerError('Invoice not found', 404);
    }

    if (String(current.merchantId) !== String(merchantId)) {
      throw new ControllerError('You do not have permission to update this invoice status', 403);
    }

    const allowed = STATUS_TRANSITIONS;

    if (current.status === status) {
      // idempotent: no status change requested
      return controller.utils.formatInvoice(current);
    }

    if (!allowed[current.status]?.includes(status)) {
      throw new ControllerError(`Invalid status transition from ${current.status} to ${status}`, 400);
    }

    const merchantAccount = await controller.accountDAO.findById(merchantId);
    const businessData = {
      logoUrl: merchantAccount?.businessInfo?.logoUrl || 'https://via.placeholder.com/48',
      name: merchantAccount?.businessInfo?.name || merchantAccount?.businessInfo?.businessName || 'Your Business Name',
      email: merchantAccount?.businessInfo?.email || merchantAccount?.email || 'business@example.com'
    };

    const invoice = await controller.invoiceDAO.updateByIdWithMerchantScope(id, merchantId, {
      status,
      $push: { statusHistory: { status, changedAt: new Date() } }
    });

    if ((status === 'sent' || status === 're-issued') && current.status !== status) {
      let invoiceForEmail = null;
      try {
        const platformData = {
          logoUrl: constants.env.PLATFORM_LOGO_URL,
          name: constants.env.PLATFORM_NAME,
          supportEmail: constants.env.PLATFORM_SUPPORT_EMAIL
        };

        let customerData = null;
        try {
          customerData = await controller.contactDAO.findById(invoice.customerId, merchantId);
        } catch (err) {
          customerData = null;
        }
        const customerApi = customerData ? buildCustomerApiForInvoice(customerData) : null;

        invoiceForEmail = {
          ...invoice.toObject(),
          customer: { data: customerApi?.data || [] }
        };

        await sendInvoiceEmail(invoiceForEmail, businessData, platformData, controller.emailAdapter);
      } catch (emailError) {
        console.error('Failed to send invoice email during status update:', emailError.message);
        console.error('Customer email data:', invoiceForEmail?.customer?.data);
        console.error(emailError);
      }
    }

    return controller.utils.formatInvoice(invoice);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to update invoice status');
  }
}
