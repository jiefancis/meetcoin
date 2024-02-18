// =============================== 第三方认证，使用了适配器模式（Auth） =============================== 

const axios = require('axios').default;
const GoogleAuth = require('google-auth-library');
const AppleAuth = require('apple-signin-auth');
const { ACCOUNT_SOURCE } = require('../config/constants');
const { logger } = require('../lib/common-lib');

class Client {
  /**
   *
   * @param options {{AppID: string, AppSecret: string}}
   */
  constructor(options) {
    if (!options.AppID) throw new Error('AppID cannot be empty');
    if (!options.AppSecret) throw new Error('AppSecret cannot be empty');
    this.appID = options.AppID;
    this.appSecret = options.AppSecret;
  }

  /**
   *
   * @param token {string}
   * @returns {Promise<{isValid: boolean, accountID?: string, email?: string, img?: string, userName?: string}>}
   */
  async verifyToken(token) {
    return {
      isValid: true,
    };
  }
}

class Google extends Client {
  constructor(options) {
    super(options);
    this.client = new GoogleAuth.OAuth2Client(this.appSecret);
  }

  /**
   * @param token {string}
   * @returns {Promise<{isValid: boolean, accountID?: string, email?: string, img?: string, userName?: string}>}
   */
  async verifyToken(token) {
    let isValid = true;
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: this.appSecret,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      isValid = false;
    }
    if (!isValid) {
      return { isValid };
    }
    return {
      isValid,
      accountID: payload.sub,
      email: payload.email || '',
      img: payload.picture || '',
      userName: payload.name || '',
    };
  }
}

class Facebook extends Client {
  constructor(options) {
    super(options);
    this.authUrl = `https://graph.facebook.com/debug_token?access_token=${this.appID}%7C${this.appSecret}&input_token=`;
  }

  /**
   * @param token {string}
   * @returns {Promise<{isValid: boolean, accountID?: string, email?: string, img?: string, userName?: string}>}
   */
  async verifyToken(token) {
    let isValid = true;
    const fullAuthUrl = this.authUrl + token;
    const authRes = await axios.get(fullAuthUrl);
    if (!authRes || authRes.status !== 200) {
      isValid = false;
    }
    const { data } = authRes.data;
    if (!data || !data.is_valid) {
      isValid = false;
    }
    if (!isValid) {
      return { isValid };
    }
    return {
      isValid,
      accountID: data.user_id,
      email: data.scopes ? data.scopes.email || '' : '',
      img: data.picture || '',
      userName: data.name || '',
    }
  }
}

class Apple extends Client {
  constructor(options) {
    super(options);
    this.client = AppleAuth;
  }

  async verifyToken(token) {
    let isValid = true;
    const payload = await this.client.verifyIdToken(token, {
      audience: this.appSecret,
    });
    if (!payload) {
      isValid = false;
    }
    if (!isValid) {
      return { isValid };
    }
    return {
      isValid,
      accountID: payload.sub,
      email: payload.email || '',
      userName: '',
    };
  }
}

// https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens/
// open_id
class Tiktok extends Client {
  constructor(options) {
    super(options);
  }

  async verifyToken(token) {
    try{
      const auth_url = `https://open-api.tiktok.com/oauth/access_token/?client_key=${this.appID}&client_secret=${this.appSecret}&code=${token}&grant_type=authorization_code`;
      const auth_res = await axios.get(auth_url);
      if (auth_res.data.message === 'error') {
        return { isValid: false, accountID: '', accessToken: ''};
      };
      const user_info_url = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,profile_deep_link';
      const headers = { 'Authorization': `Bearer ${auth_res.data.data.access_token}`, }
      const tiktokInfo = await axios.get(user_info_url, { headers });
      const avatar_url = tiktokInfo.data.data.user.avatar_url;
      const display_name = tiktokInfo.data.data.user.display_name;
      const profile_deep_link = tiktokInfo.data.data.user.profile_deep_link;
      return {
        isValid: true,
        accountID: auth_res.data.data.open_id,
        accessToken: auth_res.data.data.access_token,
        avatarUrl: avatar_url,
        userName: display_name,
        profileLink: profile_deep_link,
      };
    }catch(err){
      logger.error(`TikTok GetAccessToken Failed Code:${token}, Error:`, err);
      return { isValid: false, accountID: '', accessToken: ''};
    }
  }
}

// https://docs.snap.com/snap-kit/login-kit/Tutorials/web#server-side-web-application-integration
// user.display_name, user.bitmoji.avatar, user.external_id
class Snapchat extends Client {
  constructor(options) {
    super(options);
  }

  async verifyToken(token) {
    return {
      isValid: true,
      accountID: '',
    };
  }
}

module.exports = Auth;

/**
 *
 * @param options {{source: number}}
 * @constructor
 */
function Auth(options) {
  if (!options.source) throw new Error('source cannot be empty');
  switch (options.source) {
    case ACCOUNT_SOURCE.Google:
      this.client = new Google(options);
      break;
    case ACCOUNT_SOURCE.Apple:
      this.client = new Apple(options);
      break;
    case ACCOUNT_SOURCE.Snapchat:
      this.client = new Snapchat(options);
      break;
    default:
      throw new Error('Account source not recognized');
  }
}

// ================================== 适配器模式 ==================================
Auth.prototype.Verify = async function(token) {
  return this.client.verifyToken(token);
}
