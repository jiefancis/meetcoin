const moment = require('moment');
const { logger, tools } = require('../../lib/common-lib');
const geoIP = require('geoip-country');

function GetOptions(ctx) {
  if (!ctx) {
    return {
      deviceID: '',
      platform: '',
      country: '',
      appVersion: '',
      mainVersion: 0,
      timezone: 'utc+0',
      ip_country_code: '',
      ip: '',
      adID: ''
    };
  }
  const ip = tools.user.GetIp(ctx);
  const geo = geoIP.lookup(ip);
  const ipCountryCode = geo && geo.country ? geo.country.toUpperCase() : null;
  const option = {
    deviceID: ctx.deviceId || '',
    platform: ctx.deviceType ? ctx.deviceType.toLowerCase() : '',
    country: ctx.country ? ctx.country.toUpperCase() : '',
    appVersion: ctx.appVersion ? ctx.appVersion.origin || '' : '',
    mainVersion: ctx.appVersion ? ctx.appVersion.main || 0 : 0,
    timezone: ctx.headers['timezone'] || 'utc+0',
    ip_country_code: ipCountryCode,
    ip,
    adID: ctx.headers['ad-id'] || '',
  };
  logger.debug('option: ', option);
  return option;
}

function GetNowDate(timeZone = 'utc+0') {
  const offset = Number(timeZone.replace('utc', ''));
  const date = moment().utcOffset(offset).format('YYYY-MM-DD');
  logger.debug('date: ', date);
  return date;
}


module.exports = {
  GetOptions,
  GetNowDate,
};