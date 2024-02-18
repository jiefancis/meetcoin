

// ================================== 加解密 ================================== 


const crypto = require('crypto');

module.exports = new Encode();
function Encode() {
  this.key = process.env.AES_KEY;
  this.iv = new Buffer.alloc(16);
  this.iv.fill(0);
}

/**
 * Real上下行解码
 * @param str {string}
 * @returns {string}
 */
Encode.prototype.encode = function(str) {
  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    let encoded = cipher.update(str, 'utf8', 'base64');
    encoded += cipher.final('base64');
    return encoded;
  } catch (e) {
    return 'ERROR';
  }
}

/**
 * Real上下行加密
 * @param str {string}
 * @returns {string}
 */
Encode.prototype.decode = function(str) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    let decoded = decipher.update(str, 'base64', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
  } catch (e) {
    return 'ERROR';
  }
}