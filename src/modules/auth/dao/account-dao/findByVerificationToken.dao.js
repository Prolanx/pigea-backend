import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account } = db.models;
const { AuthConstants } = constants;

export async function findByVerificationToken(token) {
  try {
    const now = new Date();
    const account = await Account.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: now },
    });
    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.FIND_BY_VERIFICATION_TOKEN_FAILED}: ${error.message}`);
  }
}
