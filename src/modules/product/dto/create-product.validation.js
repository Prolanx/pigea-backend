import { body } from '@common/validators.js';

/**
 * Validation schema for creating a product
 */
const createProductDtoSchema = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Product name must be a string')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('sku')
    .not()
    .exists()
    .withMessage('SKU cannot be provided by client'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => value >= 0)
    .withMessage('Price must be greater than or equal to 0'),

  body('inventory')
    .notEmpty()
    .withMessage('Inventory is required')
    .isInt({ min: 0 })
    .withMessage('Inventory must be a non-negative integer'),

  body('imageUrl')
    .notEmpty()
    .withMessage('Image URL is required')
    .isString()
    .withMessage('Image URL must be a string')
    .trim(),

  body('taxApplicable')
    .optional()
    .isBoolean()
    .withMessage('taxApplicable must be a boolean'),

  body('hasVariants')
    .optional()
    .isBoolean()
    .withMessage('hasVariants must be a boolean'),

  body('thresholdType')
    .optional()
    .isIn(['auto', 'custom'])
    .withMessage('Threshold type must be either auto or custom')
    .custom((value, { req }) => {
      const thresholdType = value || 'auto';
      const thresholdPresent = req.body.threshold !== undefined && req.body.threshold !== null && req.body.threshold !== '';

      if (thresholdType === 'custom' && !thresholdPresent) {
        throw new Error('Threshold is required when threshold type is custom');
      }

      if (thresholdType !== 'custom' && thresholdPresent) {
        throw new Error('Threshold must not be provided when threshold type is auto');
      }

      return true;
    }),

  body('threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Threshold must be a non-negative integer')
    .custom((value, { req }) => {
      const thresholdType = req.body.thresholdType || 'auto';
      if (thresholdType !== 'custom') {
        throw new Error('Threshold must not be provided when threshold type is auto');
      }
      return value >= 0;
    })
    .withMessage('Threshold must be greater than or equal to 0'),

  body('shippingType')
    .optional()
    .isIn(['auto', 'custom'])
    .withMessage('Shipping type must be either auto or custom')
    .custom((value, { req }) => {
      const shippingType = value || 'auto';
      const shippingCostPresent = req.body.shippingCost !== undefined && req.body.shippingCost !== null && req.body.shippingCost !== '';

      if (shippingType === 'custom' && !shippingCostPresent) {
        throw new Error('Shipping cost is required when shipping type is custom');
      }

      if (shippingType !== 'custom' && shippingCostPresent) {
        throw new Error('Shipping cost must not be provided when shipping type is auto');
      }

      return true;
    }),

  body('shippingCost')
    .optional()
    .isNumeric()
    .withMessage('Shipping cost must be a number')
    .custom((value, { req }) => {
      const shippingType = req.body.shippingType || 'auto';
      if (shippingType !== 'custom') {
        throw new Error('Shipping cost must not be provided when shipping type is auto');
      }
      return value >= 0;
    })
    .withMessage('Shipping cost must be greater than or equal to 0'),

  body('attributes').custom((value, { req }) => {
    const hasVariants = req.body.hasVariants === true || req.body.hasVariants === 'true';
    if (hasVariants && (!Array.isArray(value) || value.length === 0)) {
      throw new Error('Attributes are required when variants are enabled');
    }
    if (value !== undefined && !Array.isArray(value)) {
      throw new Error('Attributes must be an array');
    }
    return true;
  }),

  body('attributes.*.name')
    .optional()
    .isString()
    .withMessage('Attribute name must be a string')
    .trim(),

  body('attributes.*.values')
    .optional()
    .isArray()
    .withMessage('Attribute values must be an array'),

  body('attributes.*.values.*')
    .optional()
    .isString()
    .withMessage('Attribute values must be strings')
    .trim(),

  body('variants').custom((value, { req }) => {
    const hasVariants = req.body.hasVariants === true || req.body.hasVariants === 'true';
    if (hasVariants && (!Array.isArray(value) || value.length === 0)) {
      throw new Error('Variants are required when variants are enabled');
    }
    if (value !== undefined && !Array.isArray(value)) {
      throw new Error('Variants must be an array');
    }
    return true;
  }),

  body('variants.*.sku')
    .not()
    .exists()
    .withMessage('Variant SKU cannot be provided by client'),

  body('variants.*.price')
    .optional()
    .isNumeric()
    .withMessage('Variant price must be a number')
    .custom((value) => value >= 0)
    .withMessage('Variant price must be greater than or equal to 0'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Variant stock must be a non-negative integer'),

  body('variants.*.media')
    .optional()
    .isArray()
    .withMessage('Variant media must be an array'),

  body('variants.*.media.*')
    .optional()
    .isString()
    .withMessage('Variant media items must be strings')
    .trim(),

  body('variants.*.optionValues')
    .optional()
    .custom((value) => typeof value === 'object' && value !== null && !Array.isArray(value))
    .withMessage('Variant optionValues must be an object'),

  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required'),
];

export default createProductDtoSchema;
