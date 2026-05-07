import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import InboxChannelConnection from '@database/models/InboxChannelConnection.js';

export async function updateChannelConfig(merchantId, channelType, payload = {}) {
  try {
    if (!InboxConstants.CHANNEL_CARDS.MAP[channelType]) {
      throw new ControllerError(InboxConstants.ERRORS.INVALID_CHANNEL_TYPE, 400);
    }

    // For email channels, enforce uniqueness of configuration.value (the slug)
    if (channelType === 'email' && payload.configuration?.value) {
      const value = String(payload.configuration.value).trim().toLowerCase();

      const conflict = await InboxChannelConnection.findOne({
        channelType: 'email',
        'configuration.value': value,
        merchantId: { $ne: merchantId },
      }).lean();

      if (conflict) {
        throw new ControllerError(InboxConstants.SLUG.TAKEN, 409);
      }

      payload = {
        ...payload,
        configuration: {
          ...payload.configuration,
          value,
        },
      };
    }

    return await this.inboxDAO.updateChannelConfig(merchantId, channelType, payload);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.CHANNEL_CONFIG_UPDATE_FAILED}: ${error.message}`);
  }
}
