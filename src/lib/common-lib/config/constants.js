/**
 * 定义常见http状态码
 */
const HttpErrorCode = Object.freeze({
  NORMAL: 200,
  WRONG_PARAM: 400,
  AUTH_FAIL: 401,
  NO_PERMIT: 403,
  NOT_FOUND: 404,
  SIZE_EXCEED: 413,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});

/**
 * 加解密Header Flag标记
 */
const CRYPTO = Object.freeze({
  ENCRYPT_REQ_HEADER: 'x-req-encrypt',
  ENCRYPT_RES_HEADER: 'x-res-encrypt',
  DECRYPT_RES_HEADER: 'x-res-decrypt',
});

module.exports = {
  HttpErrorCode,
  CRYPTO,
}