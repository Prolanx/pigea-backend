import { ControllerError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Set or update the merchant's inbox slug.
 * The slug is stored on Account.businessInfo.inboxSlug and is used to
 * route inbound emails to the correct merchant.
 *
 * @this {InboxController}
 * @param {string} merchantId
 * @param {string} slug - Already validated, lowercase
 * @returns {{ slug: string }}
 */
export async function setInboxSlug(merchantId, slug) {
  try {
    const normalised = slug.toLowerCase();

    // Check uniqueness — if another merchant owns this slug, reject it
    const existing = await this.accountDAO.findByInboxSlug(normalised);
    if (existing && String(existing._id) !== String(merchantId)) {
      throw new ControllerError(InboxConstants.SLUG.TAKEN, 409);
    }

    // Persist using dot-notation so only this sub-field is updated
    const updated = await this.accountDAO.updateById(merchantId, {
      'businessInfo.inboxSlug': normalised,
    });

    if (!updated) {
      throw new ControllerError('Account not found', 404);
    }

    return { slug: updated.businessInfo?.inboxSlug ?? normalised };
  } catch (err) {
    if (err instanceof ControllerError) throw err;
    throw new ControllerError(`${InboxConstants.SLUG.SET_FAILED}: ${err.message}`);
  }
}
