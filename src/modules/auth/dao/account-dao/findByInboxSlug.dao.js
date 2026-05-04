import Account from '@database/models/Account.js';
import { DAOError } from '@common/errors.js';
import { AuthConstants } from '@modules/auth/constants/auth.constants.js';

/**
 * Find a merchant account by their unique inbox slug.
 * The slug corresponds to the local-part of their inbound email address.
 * @param {string} slug - Lowercase inbox slug
 * @returns {Promise<Object|null>} Account document or null
 */
export async function findByInboxSlug(slug) {
  try {
    const account = await Account.findOne({
      'businessInfo.inboxSlug': slug.toLowerCase(),
    });
    return account;
  } catch (error) {
    throw new DAOError(`Failed to find account by inbox slug: ${error.message}`);
  }
}
