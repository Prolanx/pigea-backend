// SocialChannelController.js
// Handles connect, view, disconnect for social accounts

class SocialChannelController {
  constructor(channelDAO, oauthAdapter) {
    this.channelDAO = channelDAO;
    this.oauthAdapter = oauthAdapter;
  }

  async getConnectedChannels(merchantId) {
    return await this.channelDAO.listChannels(merchantId);
  }

  async getOAuthUrl(platform, merchantId) {
    return this.oauthAdapter.getAuthUrl(platform, merchantId);
  }

  async connectChannel(platform, merchantId, authCode) {
    // Exchange code for token, get account info
    const accountInfo = await this.oauthAdapter.exchangeCode(platform, authCode);
    return await this.channelDAO.saveChannel(merchantId, platform, accountInfo);
  }

  async disconnectChannel(channelId, merchantId) {
    const channel = await this.channelDAO.getChannelById(channelId, merchantId);
    await this.oauthAdapter.revokeToken(channel.platform, channel.accessToken);
    return await this.channelDAO.disconnectChannel(channelId, merchantId);
  }
}

export default SocialChannelController;
