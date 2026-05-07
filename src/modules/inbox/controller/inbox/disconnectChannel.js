import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

export async function disconnectChannel(merchantId, channelType) {
  try {
    if (!InboxConstants.CHANNEL_CARDS.MAP[channelType]) {
      throw new ControllerError(InboxConstants.ERRORS.INVALID_CHANNEL_TYPE, 400);
    }

    return await this.inboxDAO.disconnectChannel(merchantId, channelType);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.CHANNEL_DISCONNECT_FAILED}: ${error.message}`);
  }
}
