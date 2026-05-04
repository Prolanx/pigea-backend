import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account, Category } = db.models;
const { AuthConstants } = constants;

export async function createMerchantWithDefaults(accountData) {
  try {
    const account = await Account.create(accountData);

    await Category.create({
      name: AuthConstants.DEFAULTS.CATEGORY_NAME,
      description: AuthConstants.DEFAULTS.CATEGORY_DESCRIPTION,
      isDefault: true,
      merchantId: account._id,
    });

    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.CREATE_MERCHANT_FAILED}: ${error.message}`);
  }
}
