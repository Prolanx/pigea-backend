import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account } = db.models;
const { AuthConstants } = constants;

export async function create(accountData) {
  try {
    const account = await Account.create(accountData);
    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.CREATE_FAILED}: ${error.message}`);
  }
}
