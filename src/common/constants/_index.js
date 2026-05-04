/**
 * Constants Entry Point
 * All application constants are exported through this single entry point
 */

import * as envConstants from '@common/constants/env.constants.js';
import * as invoiceConstants from '@common/constants/invoice.constants.js';
import * as businessInfoConstants from '@common/constants/business-info.constants.js';

export const constants = {
  env: envConstants,
  invoice: invoiceConstants,
  businessInfo: businessInfoConstants
};
