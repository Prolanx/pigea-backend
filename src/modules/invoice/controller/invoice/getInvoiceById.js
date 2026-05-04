import { ControllerError, DAOError } from '@common/errors.js';
import { buildCustomFieldMap } from '@modules/crm/utils/contact-type-response.util.js';
import { buildContactEmbedShape } from '@modules/crm/utils/contact-transform.util.js';

export async function getInvoiceByIdAction(controller, id, merchantId = null) {
  try {
    const invoice = await controller.invoiceDAO.findById(id);
    if (!invoice) {
      return null;
    }

    if (merchantId && String(invoice.merchantId) !== String(merchantId)) {
      throw new ControllerError('You do not have permission to view this invoice', 403);
    }

    const contact = invoice.customerId && typeof invoice.customerId === 'object' && invoice.customerId._id
      ? invoice.customerId
      : null;

    const customFields = await controller.fieldDefinitionDAO.findByMerchant(merchantId);
    const customFieldMap = buildCustomFieldMap(customFields);

    return controller.utils.formatInvoice(invoice, buildContactEmbedShape(contact, customFieldMap));
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to retrieve invoice');
  }
}
