// SocialChannelDAO.js
// Handles DB ops for social channel references

class SocialChannelDAO {
  constructor(SocialChannelModel) {
    this.SocialChannelModel = SocialChannelModel;
  }

  async listChannels(merchantId) {
    return await this.SocialChannelModel.find({ merchantId });
  }

  async saveChannel(merchantId, platform, accountInfo) {
    // accountInfo: { accountId, name, profileImage, accessToken }
    return await this.SocialChannelModel.create({
      merchantId,
      platform,
      accountId: accountInfo.accountId,
      name: accountInfo.name,
      profileImage: accountInfo.profileImage,
      accessToken: accountInfo.accessToken,
      status: 'connected',
    });
  }

  async getChannelById(channelId, merchantId) {
    return await this.SocialChannelModel.findOne({ _id: channelId, merchantId });
  }

  async disconnectChannel(channelId, merchantId) {
    return await this.SocialChannelModel.findOneAndUpdate(
      { _id: channelId, merchantId },
      { status: 'disconnected', accessToken: null },
      { new: true }
    );
  }
}

export default SocialChannelDAO;
