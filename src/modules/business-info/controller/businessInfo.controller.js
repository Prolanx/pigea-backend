import { ControllerError } from '@common/errors.js';
import { BUSINESS_INFO_DEFAULT_STOCK_THRESHOLD } from '@common/constants/business-info.constants.js';

class BusinessInfoController {
  constructor(accountDAO) {
    this.accountDAO = accountDAO;
  }

  async getBusinessInfo(merchantId) {
    try {
      const account = await this.accountDAO.findById(merchantId);
      if (!account) throw new ControllerError('Account not found', 404);

      // Normalize: if businessInfo exists but only contains schema-default/empty values,
      // treat it as absent and return null so frontend can detect "no business info".
      const bi = account.businessInfo || null;
      if (!bi) return null;

      const stringFields = [
        'name', 'email', 'phone',
        'address', 'city', 'state', 'country',
        'industry', 'taxId', 'billingCurrency', 'invoiceNote',
      ];
      const numericFields = ['taxRate', 'defaultShippingCost', 'lowStockThreshold'];

      const allStringsEmpty = stringFields.every((f) => !bi[f] || String(bi[f]).trim() === '');
      const allNumericsEmpty = numericFields.every((f) => bi[f] == null || Number(bi[f]) === 0);
      const logoEmpty = bi.logo === null || bi.logo === '';

      const hasUseAccountEmailFlag = bi.useAccountEmailAsBusinessEmail === true;
      const isEmpty = !hasUseAccountEmailFlag && allStringsEmpty && allNumericsEmpty && logoEmpty;

      if (isEmpty) return null;

      if (bi.useAccountEmailAsBusinessEmail) {
        return {
          ...bi,
          email: account.email || '',
        };
      }

      return bi;
    } catch (err) {
      if (err instanceof ControllerError) throw err;
      throw new ControllerError(`Failed to fetch business info: ${err.message}`);
    }
  }

  async getLowStockThreshold(merchantId) {
    try {
      const businessInfo = await this.getBusinessInfo(merchantId);
      if (!businessInfo) return BUSINESS_INFO_DEFAULT_STOCK_THRESHOLD;
      return typeof businessInfo.lowStockThreshold === 'number'
        ? businessInfo.lowStockThreshold
        : BUSINESS_INFO_DEFAULT_STOCK_THRESHOLD;
    } catch (err) {
      if (err instanceof ControllerError) throw err;
      throw new ControllerError(`Failed to resolve low stock threshold: ${err.message}`);
    }
  }

  async saveBusinessInfo(payload, merchantId) {
    try {
      // Strip businessType from payload before persisting —
      // it is used for validation routing only and must not be stored.
      const { businessType, ...businessInfoData } = payload;

      if (businessInfoData.useAccountEmailAsBusinessEmail) {
        businessInfoData.email = null;
      }

      if (businessInfoData.invoiceDefaults && !businessInfoData.invoiceNote) {
        businessInfoData.invoiceNote = businessInfoData.invoiceDefaults;
      }
      delete businessInfoData.invoiceDefaults;
      delete businessInfoData.defaultOrderStatus;

      // Upsert businessInfo sub-document on Account
      const update = { businessInfo: businessInfoData };
      const updated = await this.accountDAO.updateById(merchantId, update);
      if (!updated) throw new ControllerError('Account not found', 404);
      return updated.businessInfo || null;
    } catch (err) {
      if (err instanceof ControllerError) throw err;
      throw new ControllerError(`Failed to save business info: ${err.message}`);
    }
  }
}

export default BusinessInfoController;