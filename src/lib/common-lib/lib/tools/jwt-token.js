const sign = require('jsonwebtoken');
const { logger } = require('../../index');

const jwtKey = process.env.JWT_SECRET || 'WZ3V99J6P2R1J559M75TIA59';

/**
 * 校验token
 * @param token
 * @returns {JwtPayload | string}
 */
function verifyToken(token) {
  try {
    return sign.verify(token, jwtKey);
  } catch (e) {
    return null;
  }
}

function genAccessToken(params) {
  return sign.sign(params, jwtKey);
}

/**
 * 获取token 从ctx.headers.authorization
 * @param authToken
 * @returns {string|*}
 */
function extractToken(authToken) {
  if (!authToken) return '';

  const parts = authToken.trim().split(' ');
  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }
  return '';
}

module.exports = {
  verifyToken,
  extractToken,
  genAccessToken,
};
