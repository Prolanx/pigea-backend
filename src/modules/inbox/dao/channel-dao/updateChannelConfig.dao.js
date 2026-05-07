import InboxChannelConnection from '@database/models/InboxChannelConnection.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

export async function updateChannelConfig(merchantId, channelType, payload = {}) {
  try {
    const existing = await InboxChannelConnection.findOne({ merchantId, channelType }).lean();

    const nextConfiguration = {
      ...(existing?.configuration || {}),
      ...(payload.configuration || {}),
    };

    const updated = await InboxChannelConnection.findOneAndUpdate(
      { merchantId, channelType },
      {
        $set: {
          configuration: nextConfiguration,
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
    throw new DAOError(`${InboxConstants.DB_ERRORS.UPDATE_CHANNEL_CONFIG_FAILED}: ${error.message}`);
  }
}
