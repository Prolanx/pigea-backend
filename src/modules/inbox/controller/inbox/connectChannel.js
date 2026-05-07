import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

export async function connectChannel(merchantId, channelType, payload = {}) {
  try {
    if (!InboxConstants.CHANNEL_CARDS.MAP[channelType]) {
      throw new ControllerError(InboxConstants.ERRORS.INVALID_CHANNEL_TYPE, 400);
    }

    return await this.inboxDAO.connectChannel(merchantId, channelType, payload);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.CHANNEL_CONNECT_FAILED}: ${error.message}`);
  }
}
