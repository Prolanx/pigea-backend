import Account from '@database/models/Account.js';
import InboxChannelConnection from '@database/models/InboxChannelConnection.js';
import { DAOError } from '@common/errors.js';

/**
 * Find a merchant account by their unique inbox slug.
 * The slug is stored on the email InboxChannelConnection's configuration.slug field.
 * @param {string} slug - Lowercase inbox slug
 * @returns {Promise<Object|null>} Account document or null
 */
export async function findByInboxSlug(slug) {
  try {
    const channel = await InboxChannelConnection.findOne({
      channelType: 'email',
      'configuration.value': slug.toLowerCase(),
    }).lean();

    if (!channel) return null;

    const account = await Account.findById(channel.merchantId);
    return account;
  } catch (error) {
    throw new DAOError(`Failed to find account by inbox slug: ${error.message}`);
  }
}
