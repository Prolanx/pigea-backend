import { body } from '@common/validators.js';
import { constants } from '@common/constants/_index.js';

/**
 * Validation schema for updating invoice data (PUT /:id)
 * - All fields are OPTIONAL (if not provided, existing values are kept)
 * - If provided, fields must follow validation rules
 * - Status field is NOT included (status is updated via separate endpoint)
 * - This is for updating invoice DATA only (items, customer, notes, etc.)
 */
const updateInvoiceDtoSchema = [
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Customer ID must be a valid Mongo ID')
    .trim(),
  
  body('orderId')
    .optional()
    .isString()
    .withMessage('Order ID must be a string')
    .trim(),
  
  body('fulfillmentStatus')
    .optional()
    .isString()
    .withMessage('Fulfillment status must be a string')
    .trim(),
  
  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Issue date must be a valid date'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item'),
  
  body('items.*').custom((item) => {
    if (!item) return true;

    const hasProductId = item?.productId;
    const hasName = item?.name;
    const hasUnitPrice = typeof item?.unitPrice === 'number' || typeof item?.unitPrice === 'string';

    if (!hasProductId && !hasName) {
      throw new Error('Each item must include either a productId or a name');
    }

    if (!item?.quantity) {
      throw new Error('Item quantity is required');
    }

    if (!hasProductId && !hasUnitPrice) {
      throw new Error('Item unit price is required for service items');
    }

    return true;
  }),
  
  body('items.*.quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Item quantity must be a number and non-negative'),
  
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a number and non-negative'),
  
  body('tax')
    .optional()
    .isNumeric()
    .withMessage('Tax must be a number')
    .isFloat({ min: 0 })
    .withMessage('Tax must be non-negative'),
  
  body('type')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Type must be either automatic or manual'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim(),

  body('status')
    .optional()
    .isIn(constants.invoice.INVOICE_STATUS_CREATE_OPTIONS)
    .withMessage('Status must be one of: auto, draft'),

  body('saveAsDraft')
    .optional()
    .isBoolean()
    .withMessage('saveAsDraft must be a boolean')
];

export default updateInvoiceDtoSchema;
