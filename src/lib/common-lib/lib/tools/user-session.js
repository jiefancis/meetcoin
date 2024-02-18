const { HttpErrorCode } = require('../../config/constants');
const baseError = require('../../config/base-error');

/**
 * 获取req中携带的user id
 * @param ctx
 * @returns {string}
 */
function getUserId(ctx) {
  return ctx.headers['x-user-id'];
}

/**
 * 将user id挂载ctx
 * @param ctx
 */
function setUserId(ctx) {
  ctx.currentUserId = getUserId(ctx);
}

function GetForwardedFor(ctx) {
  return ctx.headers['x-forwarded-for'];
}

function GetIp(ctx) {
  const ip = GetForwardedFor(ctx);
  if (ip) {
    const ipArr = ip.split(',');
    if (ipArr && ipArr[0]) {
      return ipArr[0].trim();
    }
  }
  return ctx.request.ip;
}

/**
 * 检查userID是否挂载ctx
 * @param ctx
 */
function validateUserId(ctx) {
  if (!ctx.currentUserId) {
    throw new baseError(HttpErrorCode.WRONG_PARAM, 'CurrentUserId Must Not Be Null.');
  }
}

/**
 * 获取用户最近一次登陆地点的时区
 * @param redisClient {ioredis.Redis}
 * @param userID {string}
 * @returns {Promise<string>}
 */
async function getUserTimeZone(redisClient, userID) {
  if (!redisClient || !userID) throw new Error('redisClient or userID cannot be null');
  const key = `Witcoin:user:timezone:${userID}`;
  return redisClient.get(key);
}

/**
 * 设置用户最近一次登陆地点的时区
 * @param redisClient {ioredis.Redis}
 * @param userID {string}
 * @param zone {string}
 * @returns {Promise<string>}
 */
async function setUserTimeZone(redisClient, userID, zone) {
  if (!redisClient || !userID || !zone) throw new Error('redisClient or userID or zone cannot be null');
  const key = `Witcoin:user:timezone:${userID}`;
  return redisClient.set(key, zone);
}

module.exports = {
  GetIp,
  getUserId,
  setUserId,
  validateUserId,
  getUserTimeZone,
  setUserTimeZone,
};
