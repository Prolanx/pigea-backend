// socialChannel.constants.js



export const SocialChannelConstants = {
  SUPPORTED_PLATFORMS: ['instagram', 'facebook', 'twitter'],
  OAUTH_URLS: {
    instagram: 'https://api.instagram.com/oauth/authorize',
    facebook: 'https://www.facebook.com/v19.0/dialog/oauth',
    twitter: 'https://twitter.com/i/oauth2/authorize',
  },
//   OAUTH_CLIENT_IDS: {
//     instagram: 'INSTAGRAM_CLIENT_ID',
//     facebook: 'FACEBOOK_CLIENT_ID',
//     twitter: 'TWITTER_CLIENT_ID',
//   },
  OAUTH_CLIENT_IDS: {
  facebook: process.env.FACEBOOK_CLIENT_ID,
  instagram: process.env.INSTAGRAM_CLIENT_ID,
  twitter: process.env.TWITTER_CLIENT_ID,
},

  OAUTH_REDIRECT_URIS: {
    instagram: 'http://localhost:5173/oauth/instagram/callback',
    facebook: 'http://localhost:5173/oauth/facebook/callback',
    twitter: 'http://localhost:5173/oauth/twitter/callback',
  },
  OAUTH_SCOPES: {
    instagram: 'user_profile,user_media',
    facebook: 'pages_show_list,pages_manage_posts,public_profile',
    twitter: 'tweet.read,tweet.write,users.read',
  },
  OAUTH_RESPONSE_TYPE: 'code',
  FACEBOOK_TOKEN_URL: 'https://graph.facebook.com/v19.0/oauth/access_token',
  FACEBOOK_PROFILE_URL: 'https://graph.facebook.com/me',
  FACEBOOK_PROFILE_FIELDS: 'id,name,picture',
  FACEBOOK_REVOKE_URL: 'https://graph.facebook.com/me/permissions',
  INSTAGRAM_TOKEN_URL: 'https://api.instagram.com/oauth/access_token',
  INSTAGRAM_PROFILE_URL: 'https://graph.instagram.com',
  INSTAGRAM_PROFILE_FIELDS: 'id,username,account_type,media_count,profile_picture_url',
  INSTAGRAM_GRANT_TYPE: 'authorization_code',
  STATUS_CONNECTED: 'connected',
  STATUS_DISCONNECTED: 'disconnected',
  ERROR_UNSUPPORTED_PLATFORM: 'Unsupported platform',
};
