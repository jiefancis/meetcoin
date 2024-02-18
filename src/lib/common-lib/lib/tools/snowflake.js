const bigintFormat = require('biguint-format');
const FlakeId = require('flake-idgen');
const now = require('nano-time');

const flakeIdGen = new FlakeId();

/**
 * 创建雪花算法的ID
 * @returns {*}
 * @constructor
 */
function GenId() {
  return bigintFormat(flakeIdGen.next(), 'dec');
}

module.exports = {
  GenId,
};
