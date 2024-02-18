
const _ = require('lodash');
const sign = require('jsonwebtoken');
const moment = require('moment');
const userCache = require('../model/redis/user-cache');
const swipeCache = require('../model/redis/swipe-cache');
const userRepo = require('../model/access/user-repo');
const swipeRepo = require('../model/access/swipe-repo');
const walletRepo = require('../model/access/wallet-repo');
const sensitiveWords = require('../lib/sensitive-words');
const { EmailClient } = require('../lib/email');
const { logger, BaseError, tools } = require('../lib/common-lib');
const { BizErrorCode, LoginEmailSchema, UserConfig, ACCOUNT_SOURCE, WalletConfig } = require('../config/constants');
const model = require("../model/db");

const jwtKey = process.env.JWT_SECRET || 'WZ3V99J6P2R1J559M75TIA59';
//TODO: AWS KEY
const mailClient = new EmailClient({
  AWS_KEY: process.env.AWS_EMAIL_KEY,
  AWS_SECRET: process.env.AWS_EMAIL_SECRET,
  AWS_REGION: process.env.AWS_EMAIL_REGION,
});

async function SendLoginCode(email){
  if (!email) throw new BaseError(BizErrorCode.ParamsError, 'wrong email');

  //TODO: 每小时限制10次，超过需要等待
  const emailLimit = await userCache.CheckEmailLimit(email);
  if (emailLimit > UserConfig.EmailPerHour) throw new BaseError(BizErrorCode.EmailLimited, 'try again later');

  const chars = '1234567890';
  const str = _.sampleSize(chars, 6);
  const code = str.join('');
  //TODO: 验证吗邮件模版
  const params = _.cloneDeep(LoginEmailSchema);
  const subject = params.Message.Subject.Data;
  const content = params.Message.Body.Html.Data.replace('#code#', code);
  const source = params.Source;
  await mailClient.SendEmailByAWS(source, email, subject, content);
  // TODO: 缓存email与code对应关系，10分钟后失效
  await userCache.SetEmailCode(email, code);
}

async function ValidateLoginCode(email, passCode){
  const code = await userCache.GetEmailCode(email);
  if (!code || code !== passCode) {
    throw new BaseError(BizErrorCode.InvalidLoginCode, 'invalid code');
  }
}

async function UserLogin(accountId, accountSource, email, options){
  const { deviceID, deviceType, app } = options;
  logger.debug(`UserLogin deviceID:${deviceID} deviceType:${deviceType}`)
  const { user, created } = await userRepo.FindOrCreateByAccount(accountId, accountSource);
  const userId = user.id;
  if( created && email && email !== '' ){
    await userRepo.UpdateUser(userId, { email: email, });
  }
  if( accountSource === ACCOUNT_SOURCE.Snapchat){
    await userRepo.UpdateUser(userId, { snap_chat_id: accountId });
  }
  await userCache.DelUserCache(userId);
  const userDO = await userRepo.GetUser(userId);
  userDO.new_user = created ? 1 : 0;

  const access_token = sign.sign({
    user_id: userId,
    did: deviceID,
    dtype: deviceType,
    app: app,
    exp: Math.floor(Date.now() / 1000) + 2592000, // 90 d
  }, jwtKey);
  await userCache.SetAccessToken(userId, access_token);
  // 更新设备信息
  await userRepo.UpdateDevice(userId, deviceID, deviceType);
  return { user: userDO, access_token };
}

async function UserLogOut(userId){
  await userCache.DelAccessToken(userId);
}

async function GetUser(userId){
  if (!userId) throw new BaseError(BizErrorCode.WRONG_PARAM, `userID:${ userId } must be uuid`);
  return userRepo.GetUser(userId);
}


/**
 * 用户名敏感词汇过滤：sensitiveWords.search(updateData.user_name.toLowerCase())
 * 
 * 
 */
async function UpdateUser(userId, params){
  const updateData = _.assign({ update_ts: new Date().getTime() }, params);
  const photos = _.cloneDeep(params.photos);
  const interests = _.cloneDeep(params.interests);

  if (photos && photos.length > 0 && Array.isArray(photos)) {
    updateData.photos = photos;
  }
  if (interests && interests.length > 0 && Array.isArray(interests)) {
    updateData.interests = interests;
  }

  if (updateData.user_name) {
    const caught = sensitiveWords.search(updateData.user_name.toLowerCase());
    if (caught.length > 0) throw new BaseError(BizErrorCode.ParamsError, 'invalid user name');
  }

  const success = await userRepo.UpdateUser(userId, updateData);
  if (!success) throw new BaseError(BizErrorCode.ParamsError, 'update user failed');
  await userCache.DelUserCache(userId);

  // ==================== 从数据库中读取后，存在redis缓存中 ==================== 
  const user = await userRepo.GetUser(userId);

  const profile = { user_id: user.id };
  if(user.gender||user.gender===0) profile.gender = user.gender;
  if(user.birthday) profile.birthday_ts = moment(user.birthday).valueOf();
  if(user.country_code) profile.country_code = user.country_code;
  profile.deleted = user.photos.length === 0 ? 1 : 0;
  await swipeRepo.UpsertProfile(profile);
  return user;
}


async function DeleteAccount(userId){
  const user = await userRepo.GetUser(userId);
  const randomEmail = [tools.util.genRandomCode(6), user.email].join('_');
  const now = new Date().getTime();
  // ======================================= 物理标记删除用户 ======================================= 
  await userRepo.UpdateUser(userId, {
    email: randomEmail,
    third_account_id: userId,
    snap_chat_id: userId,
    deleted: UserConfig.DeleteStatus.Deleted,
    update_ts:now
  });

  await userCache.DelUserCache(userId);
  await userCache.DelAccessToken(userId);
  await swipeRepo.UserDeleted(userId);
}


async function BlockUser(userId, blockUserId){
  const blockUser = await userRepo.GetUser(blockUserId);
  if(!blockUser) throw new BaseError(BizErrorCode.ParamsError, 'user not exist');
  await userRepo.Block(userId, blockUserId);
  await swipeCache.ClearSwipeIgnore(userId);
  await swipeCache.ClearSwipeIgnore(blockUserId);
}

async function UnBlockUser(userId, blockUserId){
  await userRepo.UnBlock(userId, blockUserId);
}
async function BlockList(userId, offset){
  const { count, rows } = await userRepo.BlockList(userId, offset);
  const blockIds = rows.map((row)=>{return row.block_user_id});
  const users = await userRepo.FindUsers(blockIds);

  // TODO：很迷惑的操作，已经通过block_user_id查出来用户数据，这里还要再将id跟user对应，再get（block_user_id），这是在过滤吗？
  const userMap = new Map(users.map((user)=>{
    return [user.id, user];
  }));
  const items = rows.map((row)=>{
    return userMap.get(row.block_user_id);
  });
  return { count, offset:offset+items.length, items}
}


function calcPunishedScore(reportCnt){
  if(reportCnt === 1) return 100;
  if(reportCnt === 2) return 500;
  return 1000;
}


async function Report(userId, violatorId, reason, reasonContent){
  const violator = await userRepo.GetUser(violatorId);
  if(!violator) throw new BaseError(BizErrorCode.ParamsError, 'user not exist');
  await userRepo.Report(userId, violatorId, reason, reasonContent);
  await swipeCache.ClearSwipeIgnore(userId);
  await swipeCache.ClearSwipeIgnore(violatorId);

  const reportedCnt = await userRepo.CountReport(violatorId);
  let punishScore = calcPunishedScore(reportedCnt);
  const wallet = await walletRepo.GetWallet(violatorId);
  const balance = wallet[WalletConfig.AmountType.Score];
  punishScore = punishScore <= balance ? punishScore : balance;
  await model.sequelize.transaction(async (transaction) => {
    await walletRepo.UpdateBalance(
      violatorId, WalletConfig.AmountType.Score, -1 * punishScore,
      WalletConfig.ItemType.ReportPunish, userId, transaction);
  });
}


async function Online(userId, onlineTs){
  logger.debug(`Online:${userId}, onlineTs:${onlineTs}`)
  await userRepo.Online(userId, onlineTs);
  //TODO: 修改Swipe的活跃时间？
}

async function Offline(userId, offlineTs){
  await userRepo.Offline(userId, offlineTs);
}

module.exports = {
  SendLoginCode,
  ValidateLoginCode,
  UserLogin,
  UserLogOut,
  GetUser,
  UpdateUser,
  DeleteAccount,
  BlockUser,
  Report,
  Online,
  Offline,
  BlockList,
  UnBlockUser,
}


