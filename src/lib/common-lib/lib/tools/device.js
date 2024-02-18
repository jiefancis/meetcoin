const { HttpErrorCode } = require('../../config/constants');
const baseError = require('../../config/base-error');

/**
 * 获取req中携带的device id
 * @param ctx
 * @returns {*}
 */
function getDeviceId(ctx) {
  return ctx.headers['device-id'];
}

/**
 * 获取req中携带的device typeo
 * @param ctx
 * @returns {*}
 */
function getDeviceType(ctx) {
  return ctx.headers['device-type'];
}

/**
 * 检查device id是否已经挂载在ctx
 * @param ctx
 */
function checkDeviceId(ctx) {
  if (!ctx.deviceId) {
    throw new baseError(HttpErrorCode.WRONG_PARAM, 'request header must contain device-id');
  }
}

/**
 * 检查ctx中是否挂在了deviceType
 * @param ctx
 */
function checkDeviceType(ctx) {
  if (!ctx.deviceType) {
    throw new baseError(HttpErrorCode.WRONG_PARAM, 'request header must contain device-type');
  }
}

/**
 * 获取header头中的app version. version string 'x.xx.xx.xx'，main version只关注前两位，计算出一个版本递增值
 * '1.12.23.11' -> main version = 10120;
 * @param ctx
 * @returns {{origin: string, main: number}}
 */
function getAppVersion(ctx) {
  if (!ctx.headers['app-version']) {
    return {
      origin: '',
      main: 10400,
    };
  }
  const versionString = String(ctx.headers['app-version']);
  if (!versionString.match(/\d+.?/g) ||
    versionString.match(/\d+.?/g).length < 3) {
    throw new Error('wrong format of app version in header');
  }
  const versionArray = versionString.split('.');
  let mainVersion;
  try {
    mainVersion = Number(versionArray[0]) * 10000 + Number(versionArray[1]) * 100 + Number(versionArray[2]);
  } catch (e) {
    throw new Error('wrong format of app version in header');
  }
  if (isNaN(mainVersion)) {
    throw new Error('wrong format of app version in header');
  }
  return {
    origin: versionString,
    main: mainVersion,
  };
}

module.exports = {
  getDeviceId,
  getDeviceType,
  checkDeviceId,
  checkDeviceType,
  getAppVersion,
};
