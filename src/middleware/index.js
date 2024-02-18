// ====================================== 中间件，Init定义通过的state到ctx请求上下文中 ======================================

const _ = require('lodash');
const { v4: uuid } = require("uuid");
const { logger, BaseError, session, tools } = require('../lib/common-lib');
const { WHITE_API } = require('../config/constants');
const userCache = require('../model/redis/user-cache');
const metrics = require('../lib/metrics');

const { device, token } = tools;
async function Access(ctx, next){
  const start = Date.now();
  logger.info(`Access ${ctx.method} ${ctx.url}`);
  try {
    await next();
  } catch (error) {
    logger.error('error occurred:', error);
    ctx.status = error.status || 500;
    ctx.body = { code: ctx.status, data: {}, error_msg: error.message, };
  }
  const ms = Date.now() - start;
  metrics.ObserveApi(ctx, ms/1000);
  logger.info(`Response ${ctx.method} ${ctx.url} ${ctx.status} ${ms}ms response`);
}

async function SetRequest(ctx, next) {
  // 获取 requestId
  const requestId = ctx.header['x-request-id'] || uuid();
  ctx.res.setHeader('x-request-id', requestId);
  await session.run(requestId, () => {
    return next();
  });
}

async function Authentication(ctx, next){
  let tokenValid = false;
  const now = Math.floor(Date.now() / 1000);
  if (ctx.headers && ctx.headers.authorization) {
    const value = token.extractToken(ctx.headers.authorization);
    if (value) {
      const tokenInfo = token.verifyToken(value);
      logger.debug('token decipher: ', tokenInfo);
      if (tokenInfo && tokenInfo.user_id && tokenInfo.exp && now < tokenInfo.exp) {
        // const cacheAuth = false;
        const cacheAuth = await userCache.GetAccessToken(tokenInfo.user_id);
        // token解密成功含有userID且token与userID对应缓存中的token一致，则验证通过
        if (cacheAuth === value) {
          ctx.currentUserId = tokenInfo.user_id;
          tokenValid = true;
        } else {
          logger.error(`token invalid, cache token=>${cacheAuth}, request token=>${value}`);
        }
      }
    }
  }

  let api = [ctx.method, ctx.url.split('?')[0]].join('_');
  if (WHITE_API.includes(api)) {
    // 白名单API, 不需要token验证
    tokenValid = true;
    logger.info(`${api} in the whitelist apis`);
  }
  if (!tokenValid) {
    ctx.status = 200;
    ctx.body = { code: 401, err_msg: 'token invalid' };
    return;
  }
  await next();
}

async function UpdateContext(ctx, next) {
  // device-id
  ctx.deviceId = device.getDeviceId(ctx);
  // device-type
  ctx.deviceType = device.getDeviceType(ctx);
  // app-version
  ctx.appVersion = tools.device.getAppVersion(ctx);
  // country
  ctx.country = ctx.headers.country;
  if (ctx.country) ctx.country = ctx.country.toUpperCase();
  // postman test api
  if (ctx.headers.postman) {
    ctx.isPostman = parseInt(ctx.headers.postman, 10) === 1;
  } else {
    ctx.isPostman = false;
  }
  await next();
}


async function Init(ctx, next){
  ctx.state.error = function err(error){
    if (error instanceof BaseError) {
      logger.warn(`biz error => ${error.code} ${error.err_msg}`);
    } else {
      logger.error(`unexpected error, msg: ${error.message}, stack: ${error.stack}`);
    }
    if (error.code && error.code === 401) {
      ctx.status = 401;
    } else {
      ctx.status = 200;
    }
    ctx.body = {
      code: error.code || 500,
      data: {},
      err_msg: error.code ? error.message || error.err_msg : '',
    };
  }

  // ok
  ctx.state.ok = function ok(obj) {
    ctx.body = { code: 200, data: obj, };
  };

  ctx.state.redirect = function redirect(link) {
    ctx.status = 302;
    ctx.redirect(link);
  }
  ctx.state.params = _.defaultsDeep(ctx.request.body.data, ctx.request.query);
  // input logger
  logger.info(`${ctx.method} ${ctx.url} ${ctx.currentUserId} request:`, ctx.state.params, ctx.headers);
  await next();
}


module.exports = {
  Access,
  SetRequest,
  Authentication,
  UpdateContext,
  Init,
}