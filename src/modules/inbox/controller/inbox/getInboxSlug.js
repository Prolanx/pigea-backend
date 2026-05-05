import { ControllerError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Get the merchant's current inbox slug.
 *
 * @this {InboxController}
 * @param {string} merchantId
 * @returns {{ slug: string | null }}
 */
export async function getInboxSlug(merchantId) {
  try {
    const account = await this.accountDAO.findById(merchantId);
    if (!account) throw new ControllerError('Account not found', 404);

    const slug = account.businessInfo?.inboxSlug ?? null;
    return { slug };
  } catch (err) {
    if (err instanceof ControllerError) throw err;
    throw new ControllerError(`${InboxConstants.SLUG.SET_FAILED}: ${err.message}`);
  }
}
