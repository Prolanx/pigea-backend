import InboxChannelConnection from '@database/models/InboxChannelConnection.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

export async function connectChannel(merchantId, channelType, payload = {}) {
  try {
    const now = new Date();
    const card = InboxConstants.CHANNEL_CARDS.MAP[channelType];

    const updated = await InboxChannelConnection.findOneAndUpdate(
      { merchantId, channelType },
      {
        $set: {
          status: InboxConstants.CHANNEL_STATUS.CONNECTED,
          configuration: payload.configuration || { label: card.defaultConfigLabel, value: null },
          lastSyncAt: now,
          connectedAt: now,
        },
        $unset: {
          disconnectedAt: 1,
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
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONNECT_CHANNEL_FAILED}: ${error.message}`);
  }
}
