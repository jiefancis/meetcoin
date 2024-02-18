const userService = require('../../service/user-service');
const swipeService = require('../../service/swipe-service');
const moderationService = require('../../service/moderation-service');
const ThirdPartyAuth = require('../../lib/third-party-auth');
const { logger, BaseError } = require('../../lib/common-lib/index');
const { ACCOUNT_SOURCE, BizErrorCode, ModerationConfig } = require("../../config/constants");

async function SendCode(ctx){
  try {
    const { email } = ctx.state.params;
    await userService.SendLoginCode(email);
    ctx.state.ok({});
  } catch (error) {
    logger.error('SendCode error', error);
    ctx.state.error(error);
  }
}

async function LoginRegister(ctx){
  try {
    let {
      account_source: accountSource, 
      account_id: accountId,
      token,
      email, 
      code: passCode,
    } = ctx.state.params;
    let auth, authResult;
    switch (accountSource) {
      case ACCOUNT_SOURCE.Email:
        await userService.ValidateLoginCode(email, passCode);
        accountId = email;
        break;
      case ACCOUNT_SOURCE.Google:
        auth = new ThirdPartyAuth({
          source: accountSource,
          AppID: process.env.GOOGLE_APP_ID,
          AppSecret: process.env.GOOGLE_APP_SECRET,
        });
        authResult = await auth.Verify(token);
        if (!authResult.isValid) throw new BaseError(BizErrorCode.GoogleAuthFail);
        email = authResult.email;
        accountId = authResult.accountID
        break;
      case ACCOUNT_SOURCE.Apple:
        auth = new ThirdPartyAuth({
          source: accountSource,
          AppID: process.env.APPLE_APP_ID,
          AppSecret: process.env.APPLE_APP_SECRET,
        });
        authResult = await auth.Verify(token);
        if (!authResult.isValid) throw new BaseError(BizErrorCode.AppleAuthFail);
        email = authResult.email;
        accountId = authResult.accountID
        break;
      case ACCOUNT_SOURCE.Snapchat:
        auth = new ThirdPartyAuth({
          source: accountSource,
          AppID: 'test',
          AppSecret: 'test',
        });
        authResult = await auth.Verify(token);
        if (!authResult.isValid) throw new BaseError(BizErrorCode.SnapAuthFail);
        break;
      default:
        throw new BaseError(BizErrorCode.ParamsError, 'invalid account source');
    }

    const { user, access_token } = await userService.UserLogin(accountId, accountSource, email,{
      deviceID: ctx.deviceId,
      deviceType: ctx.deviceType,
      app: ctx.headers.app,
    });
    const preference = await swipeService.GetPreference(user.id);
    delete user.email;
    ctx.state.ok({
      user,
      access_token,
      preference,
    });
  } catch (error) {
    logger.error('LoginRegister error', error);
    ctx.state.error(error);
  }
}

async function LogOut(ctx){
  try {
    const userId = ctx.currentUserId;
    await userService.UserLogOut(userId);
    ctx.state.ok({});
  } catch (error) {
    logger.error('LogOut error', error);
    ctx.state.error(error);
  }
}

async function Profile(ctx){
  try {
    const userId = ctx.currentUserId;
    const user = await userService.GetUser(userId);
    delete user.email;
    const preference = await swipeService.GetPreference(userId);
    ctx.state.ok({
      profile: user,
      preference,
    });
  } catch (error) {
    logger.error('Profile error', error);
    ctx.state.error(error);
  }
}

async function UpdateProfile(ctx){
  try {
    const userId = ctx.currentUserId;
    const body = ctx.state.params;
    const photos = body.photos ? body.photos : [];
    for (let photo of photos) {
      const punish = await moderationService.DetectImage(userId, photo);
      if (punish === ModerationConfig.PunishStatus.Punished) throw new BaseError(BizErrorCode.ParamsError, 'invalid image');
    }
    const user = await userService.UpdateUser(userId, body);
    delete user.email;
    const preference = await swipeService.GetPreference(userId);
    ctx.state.ok({
      profile: user,
      preference,
    });
  } catch (error) {
    logger.error('UpdateProfile error', error);
    ctx.state.error(error);
  }
}

// TODO：物理标记清除用户账号
async function DeleteUser(ctx){
  try {
    const userId = ctx.currentUserId;
    await userService.DeleteAccount(userId);
    ctx.state.ok({});
  } catch (error) {
    logger.error('DeleteUser error', error);
    ctx.state.error(error);
  }
}

async function BlockUser(ctx){
  try {
    const userId = ctx.currentUserId;
    const { block_user_id: blockUserId } = ctx.state.params;
    await userService.BlockUser(userId, blockUserId);
    ctx.state.ok({});
  } catch (error) {
    logger.error('BlockUser error', error);
    ctx.state.error(error);
  }
}

async function UnBlock(ctx){
  try {
    const userId = ctx.currentUserId;
    const { block_user_id: blockUserId } = ctx.state.params;
    await userService.UnBlockUser(userId, blockUserId);
    ctx.state.ok({});
  } catch (error) {
    logger.error('UnBlock error', error);
    ctx.state.error(error);
  }
}

async function BlockList(ctx){
  try {
    const userId = ctx.currentUserId;
    let { offset: queryOffset } = ctx.state.params;
    // queryOffset = parseInt(queryOffset) ? parseInt(queryOffset) : 0;
    queryOffset = parseInt(queryOffset) || 0;
    const { count, offset, items } = await userService.BlockList(userId, queryOffset);
    ctx.state.ok({ count, offset, items });
  } catch (error) {
    logger.error('BlockList error', error);
    ctx.state.error(error);
  }
}

// TODO：应该是举报用户
async function ReportUser(ctx){
  try {
    const userId = ctx.currentUserId;
    const { violator_id: violatorId, reason, content } = ctx.state.params;
    await userService.Report(userId, violatorId, reason, content);
    ctx.state.ok({});
  } catch (error) {
    logger.error('ReportUser error', error);
    ctx.state.error(error);
  }
}



module.exports = {
  SendCode,
  LoginRegister,
  LogOut,
  Profile,
  UpdateProfile,
  DeleteUser,
  BlockUser,
  ReportUser,
  BlockList,
  UnBlock,
}