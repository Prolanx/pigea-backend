import { body } from '@common/validators.js';

/**
 * Validation for saving/updating merchant business-info.
 *
 * businessType is required in the payload to drive conditional validation
 * for commerce vs service defaults. It is NOT persisted to the database.
 *
 * Tax fields (taxRate, taxId) are only required when taxEnabled === true.
 * E-commerce defaults are only required when businessType === 'ecommerce'.
 * Service defaults are only required when businessType === 'service'.
 * Opposite business type fields arrive as null and are allowed via .optional().
 */
const businessInfoDtoSchema = [

  // ── Business type (routing only — not persisted) ──────────
  body('businessType')
    .notEmpty().withMessage('Business type is required')
    .isIn(['ecommerce', 'service']).withMessage('Invalid business type'),

  // ── Identity ──────────────────────────────────────────────
  body('name')
    .notEmpty().withMessage('Business name is required'),

  body('industry')
    .notEmpty().withMessage('Industry is required'),

  body('logo')
    .optional().isString().withMessage('Logo must be a string'),

  // ── Contact ───────────────────────────────────────────────
  body('email')
    .if(body('useAccountEmailAsBusinessEmail').not().equals('true'))
    .notEmpty().withMessage('Business email is required')
    .isEmail().withMessage('Invalid email'),

  body('useAccountEmailAsBusinessEmail')
    .isBoolean().withMessage('Use account email flag must be a boolean'),

  body('phone')
    .optional().isString().withMessage('Phone must be a string'),

  // ── Address ───────────────────────────────────────────────
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required'),

  // ── Billing ───────────────────────────────────────────────
  body('billingCurrency')
    .notEmpty().withMessage('Billing currency is required'),

  body('paymentTerms')
    .notEmpty().withMessage('Payment terms are required'),

  body('invoiceNote')
    .notEmpty().withMessage('Invoice note is required')
    .isString().withMessage('Invoice note must be a string'),

  // ── Tax ───────────────────────────────────────────────────
  body('taxEnabled')
    .isBoolean().withMessage('Tax enabled must be a boolean'),

  // taxRate and taxId are only required when taxEnabled === true
  body('taxRate')
    .if(body('taxEnabled').equals('true'))
    .notEmpty().withMessage('Tax rate is required when tax is enabled')
    .isFloat({ min: 0 }).withMessage('Tax rate must be 0 or greater'),

  body('taxId')
    .if(body('taxEnabled').equals('true'))
    .notEmpty().withMessage('Tax ID is required when tax is enabled')
    .isString().withMessage('Tax ID must be a string'),

  // ── E-commerce defaults ───────────────────────────────────
  // Required when businessType === 'ecommerce', null when service
  body('lowStockThreshold')
    .if(body('businessType').equals('ecommerce'))
    .notEmpty().withMessage('Low stock threshold is required')
    .isFloat({ min: 0 }).withMessage('Low stock threshold must be 0 or greater'),

  body('defaultShippingCost')
    .optional()
    .isNumeric().withMessage('Default shipping cost must be a number')
    .custom((value) => value >= 0)
    .withMessage('Default shipping cost must be greater than or equal to 0'),

  // ── Service defaults ──────────────────────────────────────
  // Required when businessType === 'service', null when commerce
  body('defaultClientStatus')
    .if(body('businessType').equals('service'))
    .notEmpty().withMessage('Default client status is required')
    .isString().withMessage('Default client status must be a string'),
];

export default businessInfoDtoSchema;