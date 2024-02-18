// ================================ 曝光 ================================

const redis = require('./index');
const moment = require('moment');
const util = require('util');
const { RedisKeyFormat } = require('../../config/constants');

async function CacheServing(userId, swipeUserIds){
  if(!swipeUserIds || swipeUserIds.length === 0) return
  const servingKey = util.format(RedisKeyFormat.SwipeServing, userId);
  await redis.sadd(servingKey, swipeUserIds);
  await redis.expire(servingKey, 86400)
}

async function FindServing(userId){
  const servingKey = util.format(RedisKeyFormat.SwipeServing, userId);
  return redis.smembers(servingKey);
}


async function IncrSwipeLike(userId){
  const date = moment().utcOffset(8).format('YYYY-MM-DD')
  const swipeKey = util.format(RedisKeyFormat.SwipeLike, date, userId);
  const cnt = await redis.incr(swipeKey);
  if(cnt === 1) await redis.expire(swipeKey, 86400);
  return cnt;
}


async function GetPreference(userId){
  const key = util.format(RedisKeyFormat.SwipePreference, userId);
  const rst = await redis.get(key);
  if(!rst) return null;
  return JSON.parse(rst);
}

async function CachePreference(userId, preference){
  const key = util.format(RedisKeyFormat.SwipePreference, userId);
  await redis.set(key, JSON.stringify(preference));
  await redis.expire(key, 86400);
}

async function CacheSwipeIgnore(userId, ignores){
  const key = util.format(RedisKeyFormat.SwipeIgnore, userId);
  await redis.sadd(key, ignores);
  await redis.expire(key, 3600);
}

async function GetSwipeIgnore(userId){
  const key = util.format(RedisKeyFormat.SwipeIgnore, userId);
  return redis.smembers(key);
}

async function ClearSwipeIgnore(userId){
  const key = util.format(RedisKeyFormat.SwipeIgnore, userId);
  await redis.del(key);
}


async function GetBoostChance(userId){
  const key = util.format(RedisKeyFormat.BoostChance, userId);
  let rst = await redis.get(key);
  return rst ? parseInt(rst,10): 0;
}

async function UpdateBoostChance(userID, incrNum){
  const key = util.format(RedisKeyFormat.BoostChance, userID);
  return redis.incrby(key, incrNum);
}


async function IncrFreeSuperLike(userId){
  const key = util.format(RedisKeyFormat.SwipeSuperLike, userId);
  await redis.incr(key);
}

async function UseFreeSuperLike(userId){
  const key = util.format(RedisKeyFormat.SwipeSuperLike, userId);
  const rst = await redis.decr(key);
  if(rst >= 0) return true;
  await redis.incr(key);
  return false;
}



module.exports = {
  CacheServing,
  FindServing,
  IncrSwipeLike,
  GetPreference,
  CachePreference,
  CacheSwipeIgnore,
  GetSwipeIgnore,
  ClearSwipeIgnore,
  GetBoostChance,
  UpdateBoostChance,
  IncrFreeSuperLike,
  UseFreeSuperLike,
}