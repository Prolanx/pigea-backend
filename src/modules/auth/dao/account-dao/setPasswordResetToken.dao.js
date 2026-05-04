import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account } = db.models;
const { AuthConstants } = constants;

export async function setPasswordResetToken(email, token, expiresAt) {
  try {
    const account = await Account.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        passwordResetToken: token,
        passwordResetTokenExpiry: expiresAt,
        passwordResetTokenSentAt: new Date(),
      },
      { new: true }
    );
    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.SET_RESET_TOKEN_FAILED}: ${error.message}`);
  }
}
