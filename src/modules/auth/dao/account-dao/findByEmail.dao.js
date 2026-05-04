import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account } = db.models;
const { AuthConstants } = constants;

export async function findByEmail(email) {
  try {
    const account = await Account.findOne({ email: email.toLowerCase() });
    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.FIND_BY_EMAIL_FAILED}: ${error.message}`);
  }
}
