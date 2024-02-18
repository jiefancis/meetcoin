// ===================================== 邮箱验证码、用户DTO、token 的存储（set get del） =====================================
const redis = require('./index');
const util = require('util');
const { RedisKeyFormat } = require('../../config/constants');


// TODO: 校验邮箱验证码已发送次数，1小时内最多10次发送邮箱验证码，超过10次需要等到下一个小时
async function CheckEmailLimit(email){
  // EmailLimit: 'meetcoin:email:limit:%s' 使用email来替换 %s
  const key = util.format(RedisKeyFormat.EmailLimit, email);
  //将key的整数值加1
  const rst = await redis.incr(key); // incr(key: RedisKey, callback?: Callback<number>): Promise<number>
  if (rst === 1) {
    await redis.expire(key, 60 * 60); // 这个邮箱号第一次发送验证码 1小时过期，过期后会自动删掉key
  }
  return rst;
}

// TODO: 邮箱验证码10分钟内有效
async function SetEmailCode(email, code){
  const key = util.format(RedisKeyFormat.EmailCode, email);
  //TODO: 10分钟时效
  return redis.setex(key, 600, code);
}

// TODO: 获取邮箱对应的验证码
async function GetEmailCode(email){
  const key = util.format(RedisKeyFormat.EmailCode, email);
  return redis.get(key);
}

// TODO：SetUserCache设置2小时有效期，超时将会自动删除key，所以返回的userJson要判断是否存在
async function GetUserCache(userID){
  if (!userID) return null;
  const key = util.format(RedisKeyFormat.UserCache, userID);
  const userJson = await redis.get(key);
  if (userJson && typeof userJson === 'string' && userJson.indexOf('{') === 0) {
    return JSON.parse(userJson);
  }
  return null;
}

async function SetUserCache(userID, userDTO){
  if (!userID || !userDTO) return;
  const key = util.format(RedisKeyFormat.UserCache, userID);
  await redis.set(key, JSON.stringify(userDTO), 'EX', 7200); // expire 2 hour
}

async function DelUserCache(userId){
  const key = util.format(RedisKeyFormat.UserCache, userId);
  await redis.del(key);
}

async function GetAccessToken(userID) {
  const key = util.format(RedisKeyFormat.UserToken, userID);
  return redis.get(key);
}

async function SetAccessToken(userID, accessToken) {
  const key = util.format(RedisKeyFormat.UserToken, userID);
  return redis.set(key, accessToken, 'EX', 2592000);
}

async function DelAccessToken(userID) {
  const key = util.format(RedisKeyFormat.UserToken, userID);
  return redis.del(key);
}


module.exports = {
  CheckEmailLimit,
  SetEmailCode,
  GetEmailCode,
  GetUserCache,
  SetUserCache,
  DelUserCache,
  GetAccessToken,
  SetAccessToken,
  DelAccessToken,
}