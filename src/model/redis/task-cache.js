const redis = require('./index');
const util = require('util');
const { logger } = require('../../lib/common-lib');
const { RedisKeyFormat } = require('../../config/constants');



// TODO: redis.set
async function FriendAssistLock(userId){
  const key = util.format(RedisKeyFormat.FriendAssist, userId);
  const rst = await redis.set(key, 1, 'NX','EX', 3600);
  logger.info(`FriendAssistLock:${userId}, ${rst}`);
  return rst === 'OK';
}




module.exports = {
  FriendAssistLock,
}
