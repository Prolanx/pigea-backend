import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

export async function listChannels(merchantId) {
  try {
    return await this.inboxDAO.listChannelsByMerchant(merchantId);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.CHANNELS_LIST_FAILED}: ${error.message}`);
  }
}
