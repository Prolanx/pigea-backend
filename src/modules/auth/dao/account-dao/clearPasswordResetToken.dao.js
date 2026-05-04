import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account } = db.models;
const { AuthConstants } = constants;

export async function clearPasswordResetToken(accountId) {
  try {
    const account = await Account.findByIdAndUpdate(
      accountId,
      {
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
      { new: true }
    );
    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.CLEAR_RESET_TOKEN_FAILED}: ${error.message}`);
  }
}
