import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account } = db.models;
const { AuthConstants } = constants;

export async function removeRefreshToken(accountId) {
  try {
    const account = await Account.findByIdAndUpdate(
      accountId,
      {
        refreshToken: null,
        refreshTokenExpiry: null,
      },
      { new: true }
    );
    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.REMOVE_REFRESH_TOKEN_FAILED}: ${error.message}`);
  }
}
