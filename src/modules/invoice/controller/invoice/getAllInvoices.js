import { ControllerError, DAOError } from '@common/errors.js';
import { buildCustomFieldMap } from '@modules/crm/utils/contact-type-response.util.js';
import { buildContactEmbedShape } from '@modules/crm/utils/contact-transform.util.js';

export async function getAllInvoicesAction(controller, merchantId = null) {
  try {
    const invoices = await controller.invoiceDAO.findAll(merchantId);

    const customFields = await controller.fieldDefinitionDAO.findByMerchant(merchantId);
    const customFieldMap = buildCustomFieldMap(customFields);

    return invoices.map((inv) => {
      const contact = inv.customerId && typeof inv.customerId === 'object' && inv.customerId._id
        ? inv.customerId
        : null;
      return controller.utils.formatInvoice(inv, buildContactEmbedShape(contact, customFieldMap));
    });
  } catch (error) {
    if (error instanceof DAOError) {
      throw error;
    }
    throw new ControllerError('Failed to retrieve invoices');
  }
}
