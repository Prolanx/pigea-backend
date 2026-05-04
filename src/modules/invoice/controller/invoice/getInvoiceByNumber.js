import { ControllerError, DAOError } from '@common/errors.js';
import { buildCustomFieldMap } from '@modules/crm/utils/contact-type-response.util.js';
import { buildContactEmbedShape } from '@modules/crm/utils/contact-transform.util.js';

export async function getInvoiceByNumberAction(controller, invoiceNumber) {
  try {
    const invoice = await controller.invoiceDAO.findByInvoiceNumber(invoiceNumber);
    if (!invoice) {
      return null;
    }

    const contact = invoice.customerId && typeof invoice.customerId === 'object' && invoice.customerId._id
      ? invoice.customerId
      : null;

    const merchantId = invoice.merchantId ? String(invoice.merchantId) : null;
    const customFields = await controller.fieldDefinitionDAO.findByMerchant(merchantId);
    const customFieldMap = buildCustomFieldMap(customFields);

    return controller.utils.formatInvoice(invoice, buildContactEmbedShape(contact, customFieldMap));
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to retrieve invoice by number');
  }
}
