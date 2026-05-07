import InboxChannelConnection from '@database/models/InboxChannelConnection.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

export async function disconnectChannel(merchantId, channelType) {
  try {
    const now = new Date();
    const card = InboxConstants.CHANNEL_CARDS.MAP[channelType];

    const updated = await InboxChannelConnection.findOneAndUpdate(
      { merchantId, channelType },
      {
        $set: {
          status: InboxConstants.CHANNEL_STATUS.DISCONNECTED,
          disconnectedAt: now,
          configuration: { label: card.defaultConfigLabel, value: null },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    const { _id, __v, ...rest } = updated;
    return { id: _id.toString(), ...rest };
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.DISCONNECT_CHANNEL_FAILED}: ${error.message}`);
  }
}
