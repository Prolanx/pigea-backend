import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account, Category, ContactType } = db.models;
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

    // Create default "General" contact type with system fields (name and email)
    await ContactType.create({
      name: 'General',
      description: 'Default contact type for emails and general inquiries',
      merchantId: account._id,
      fields: [
        { id: 'sys_email', required: true },   // Email is required
        { id: 'sys_name', required: false },   // Name is optional
      ],
      contactCount: 0,
      isSystemGroup: true,
    });

    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.CREATE_MERCHANT_FAILED}: ${error.message}`);
  }
}
