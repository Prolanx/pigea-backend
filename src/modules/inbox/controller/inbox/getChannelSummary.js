import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

export async function getChannelSummary(merchantId) {
  try {
    const channels = await this.inboxDAO.listChannelsByMerchant(merchantId);
    const connected = channels.filter((item) => item.status === InboxConstants.CHANNEL_STATUS.CONNECTED).length;

    return {
      total: channels.length,
      connected,
      disconnected: channels.length - connected,
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.CHANNELS_SUMMARY_FAILED}: ${error.message}`);
  }
}
