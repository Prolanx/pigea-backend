import InboxChannelConnection from '@database/models/InboxChannelConnection.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

function buildDefaultChannelCards() {
  return InboxConstants.CHANNEL_CARDS.ORDER.map((channelType) => ({
    channelType,
    status: InboxConstants.CHANNEL_STATUS.DISCONNECTED,
    configuration: {
      label: InboxConstants.CHANNEL_CARDS.MAP[channelType].defaultConfigLabel,
      value: null,
    },
    connectedAt: null,
    disconnectedAt: null,
    lastSyncAt: null,
  }));
}

export async function listChannelsByMerchant(merchantId) {
  try {
    const existing = await InboxChannelConnection.find({ merchantId }).lean();
    const existingMap = new Map(existing.map((item) => [item.channelType, item]));

    return buildDefaultChannelCards().map((channel) => {
      const persisted = existingMap.get(channel.channelType);
      if (!persisted) return channel;

      return {
        ...channel,
        id: persisted._id,
        status: persisted.status,
        configuration: persisted.configuration || channel.configuration,
        connectedAt: persisted.connectedAt,
        disconnectedAt: persisted.disconnectedAt,
        lastSyncAt: persisted.lastSyncAt,
      };
    });
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.LIST_CHANNELS_FAILED}: ${error.message}`);
  }
}
