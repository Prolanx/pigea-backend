import { body } from '@common/validators.js';
import { constants } from '@common/constants/_index.js';

/**
 * Validation schema for creating an invoice
 * Pure schema definition - handler applied via validateDto middleware
 */
const createInvoiceDtoSchema = [
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .bail()
    .isMongoId()
    .withMessage('Customer ID must be a valid Mongo ID')
    .trim(),
  
  body('customerEmail')
    .notEmpty()
    .withMessage('Customer email is required')
    .bail()
    .isEmail()
    .withMessage('Customer email must be valid')
    .trim(),

  body('invoiceCategory')
    .notEmpty()
    .withMessage('Invoice category is required')
    .bail()
    .isIn(['service', 'ecommerce'])
    .withMessage('Invoice category must be either service or ecommerce'),

  body('currency')
    .optional()
    .isString()
    .withMessage('Currency must be a string')
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
    .notEmpty()
    .withMessage('Issue date is required')
    .bail()
    .isISO8601()
    .withMessage('Issue date must be a valid date'),
  
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .bail()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('items')
    .notEmpty()
    .withMessage('Items must be provided')
    .bail()
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item'),
  
  // Each item must define category and meet per-category rules
  body('items.*').custom((item, { req }) => {
    const invoiceCategory = req.body.invoiceCategory || 'service';

    if (!item) {
      throw new Error('Invoice item cannot be empty');
    }

    if (!item.itemCategory) {
      throw new Error('Item category is required');
    }

    if (!['service', 'ecommerce'].includes(item.itemCategory)) {
      throw new Error('Item category must be service or ecommerce');
    }

    if (invoiceCategory === 'ecommerce' && item.itemCategory !== 'ecommerce') {
      throw new Error('All items must be ecommerce when invoiceCategory is ecommerce');
    }

    if (invoiceCategory === 'service' && item.itemCategory !== 'service') {
      throw new Error('All items must be service when invoiceCategory is service');
    }

    if (item.itemCategory === 'ecommerce' && !item.productId) {
      throw new Error('Product ID is required for ecommerce items');
    }

    const hasName = !!item.name;
    const hasUnitPrice = typeof item.unitPrice === 'number' || (typeof item.unitPrice === 'string' && item.unitPrice.trim() !== '');

    if (!hasName) {
      throw new Error('Item name is required');
    }

    if (!item.quantity && item.quantity !== 0) {
      throw new Error('Item quantity is required');
    }

    if (item.itemCategory === 'service' && !hasUnitPrice) {
      throw new Error('Item unit price is required for service items');
    }

    if (item.itemCategory === 'service' && item.durationHours != null && Number(item.durationHours) < 0) {
      throw new Error('Service durationHours must be non-negative');
    }

    return true;
  }),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Item quantity is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Item quantity must be a number and non-negative'),
  
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a number and non-negative'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .bail()
    .isIn(constants.invoice.INVOICE_STATUS_CREATE_OPTIONS)
    .withMessage('Status must be one of: auto, draft'),
  
  body('type')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Type must be either automatic or manual'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim()
];

export default createInvoiceDtoSchema;
