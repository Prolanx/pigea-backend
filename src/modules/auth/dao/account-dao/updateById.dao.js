import { common } from '@common/_index.js';
import { db } from '@database/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { DAOError } = common.errors;
const { Account } = db.models;
const { AuthConstants } = constants;

export async function updateById(id, updateData) {
  try {
    const account = await Account.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return account;
  } catch (error) {
    throw new DAOError(`${AuthConstants.DB_ERRORS.UPDATE_FAILED}: ${error.message}`);
  }
}
