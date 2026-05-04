// oauthAdapter.js
// Adapter for OAuth flows and token management



import { SocialChannelConstants } from './socialChannel.constants.js';


import axios from 'axios';

class OAuthAdapter {
  async getAuthUrl(platform, merchantId) {
    // Facebook and Instagram require different scopes and endpoints
    if (platform === 'facebook') {
      // Facebook OAuth URL
      const baseUrl = SocialChannelConstants.OAUTH_URLS.facebook;
      const clientId = SocialChannelConstants.OAUTH_CLIENT_IDS.facebook;
      const redirectUri = SocialChannelConstants.OAUTH_REDIRECT_URIS.facebook;
      const scope = SocialChannelConstants.OAUTH_SCOPES.facebook;
      return `${baseUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${merchantId}&scope=${scope}&response_type=${SocialChannelConstants.OAUTH_RESPONSE_TYPE}`;
    }
    if (platform === 'instagram') {
      // Instagram OAuth URL
      const baseUrl = SocialChannelConstants.OAUTH_URLS.instagram;
      const clientId = SocialChannelConstants.OAUTH_CLIENT_IDS.instagram;
      const redirectUri = SocialChannelConstants.OAUTH_REDIRECT_URIS.instagram;
      const scope = SocialChannelConstants.OAUTH_SCOPES.instagram;
      return `${baseUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${merchantId}&scope=${scope}&response_type=${SocialChannelConstants.OAUTH_RESPONSE_TYPE}`;
    }
    // Default fallback (not implemented)
    throw new Error('Unsupported platform');
  }

  async exchangeCode(platform, authCode) {
    // Exchange auth code for access token and fetch account info
    if (platform === 'facebook') {
      // Step 1: Exchange code for access token
      // See: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/
      const tokenRes = await axios.get(SocialChannelConstants.FACEBOOK_TOKEN_URL, {
        params: {
          client_id: SocialChannelConstants.OAUTH_CLIENT_IDS.facebook,
          redirect_uri: SocialChannelConstants.OAUTH_REDIRECT_URIS.facebook,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          code: authCode,
        },
      });
      const accessToken = tokenRes.data.access_token;

      // Step 2: Fetch user profile info
      const profileRes = await axios.get(SocialChannelConstants.FACEBOOK_PROFILE_URL, {
        params: {
          access_token: accessToken,
          fields: SocialChannelConstants.FACEBOOK_PROFILE_FIELDS,
        },
      });
      return {
        accountId: profileRes.data.id,
        name: profileRes.data.name,
        profileImage: profileRes.data.picture?.data?.url,
        accessToken,
        status: SocialChannelConstants.STATUS_CONNECTED,
      };
    }

    if (platform === 'instagram') {
      // Step 1: Exchange code for short-lived access token
      // See: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started/
      const tokenRes = await axios.get(SocialChannelConstants.INSTAGRAM_TOKEN_URL, {
        params: {
          client_id: SocialChannelConstants.OAUTH_CLIENT_IDS.instagram,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          grant_type: SocialChannelConstants.INSTAGRAM_GRANT_TYPE,
          redirect_uri: SocialChannelConstants.OAUTH_REDIRECT_URIS.instagram,
          code: authCode,
        },
      });
      const accessToken = tokenRes.data.access_token;
      const userId = tokenRes.data.user_id;

      // Step 2: Fetch user profile info
      const profileRes = await axios.get(`${SocialChannelConstants.INSTAGRAM_PROFILE_URL}/${userId}`, {
        params: {
          access_token: accessToken,
          fields: SocialChannelConstants.INSTAGRAM_PROFILE_FIELDS,
        },
      });
      return {
        accountId: profileRes.data.id,
        name: profileRes.data.username,
        profileImage: profileRes.data.profile_picture_url,
        accessToken,
        status: SocialChannelConstants.STATUS_CONNECTED,
      };
    }

    // Default fallback (not implemented)
    throw new Error('Unsupported platform');
  }

  async revokeToken(platform, accessToken) {
    // Facebook and Instagram token revocation
    if (platform === 'facebook') {
      // See: https://developers.facebook.com/docs/facebook-login/access-tokens/
      await axios.delete(SocialChannelConstants.FACEBOOK_REVOKE_URL, {
        params: { access_token: accessToken },
      });
      return SocialChannelConstants.STATUS_DISCONNECTED;
    }
    if (platform === 'instagram') {
      // Instagram does not provide a direct revoke endpoint; tokens expire automatically
      // Optionally, you can invalidate by deleting from DB
      return SocialChannelConstants.STATUS_DISCONNECTED;
    }
    throw new Error(SocialChannelConstants.ERROR_UNSUPPORTED_PLATFORM);
  }
}

export default new OAuthAdapter();
