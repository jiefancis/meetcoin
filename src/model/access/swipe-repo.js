const model = require('../db/index');
const moment = require('moment');
const swipeCache = require('../redis/swipe-cache');
const { UserConfig, SwipeConfig } = require('../../config/constants');
const { logger, tools } = require('../../lib/common-lib');


async function GetSwipeProfile(userId){
  return model.swipe_profile.findOne({
    where: { user_id: userId }
  })
}

async function UpsertProfile(profile){
  const now = new Date().getTime();
  profile.update_ts = now;
  profile.create_ts = now;
  await model.swipe_profile.upsert(profile,{
    fields:['gender', 'birthday_ts', 'update_ts', 'deleted', 'banned', 'online_status']
  });
}

async function PreferenceProfiles(ageUpper, ageLower, genderSelector, excludes){
  const birthday_ts_upper = moment().add(ageUpper * -1,'years').valueOf();
  const birthday_ts_lower = moment().add(ageLower * -1, 'years').valueOf();
  // logger.info(`PreferenceProfiles ageUpper ${ageUpper},${birthday_ts_upper}`)
  // logger.info(`PreferenceProfiles ageLower ${ageLower},${birthday_ts_lower}`)
  // logger.info('PreferenceProfiles excludes',excludes);
  // logger.info('PreferenceProfiles genderSelector',genderSelector);
  return model.swipe_profile.findAll({
    where:{
      birthday_ts:{
        [model.Sequelize.Op.lte]: birthday_ts_lower,
        [model.Sequelize.Op.gte]: birthday_ts_upper
      },
      gender:{ [model.Sequelize.Op.in]: genderSelector },
      user_id:{ [model.Sequelize.Op.notIn]: excludes },
      deleted: UserConfig.DeleteStatus.Normal,
      banned: UserConfig.BannedStatus.Normal,
    },
    order:[['boost_end_ts', 'DESC'], ['like_cnt', 'DESC']],
  });
}

async function IncrLikeCnt(userId){
  const now =new Date().getTime();
  await model.swipe_profile.increment({
    like_cnt: +1,
    update_ts: now,
  },{
    where:{ user_id:userId }
  });
}

async function IncrDisLike(userId){
  const now =new Date().getTime();
  await model.swipe_profile.increment({
    dislike_cnt: +1,
    update_ts: now,
  },{
    where:{ user_id:userId }
  });
}

async function GetPreference(userId){
  const cache = await swipeCache.GetPreference(userId);
  if(cache) return cache;

  const now = new Date().getTime();
  const [obj, created] = await model.swipe_preference.findOrCreate({
    where:{ user_id: userId },
    defaults: {
      user_id: userId, age_upper: 80, age_lower: 0,
      genders: [1,2,3], create_ts: now, update_ts: now,
    },
  });
  const preference = {
    age_upper: obj.age_upper,
    age_lower: obj.age_lower,
    genders: obj.genders,
  };
  await swipeCache.CachePreference(userId, preference);
  return preference;
}

async function UpdatePreference(userId, preference){
  const now = new Date().getTime();
  preference.user_id = userId;
  preference.update_ts = now;
  preference.create_ts = now;
  await model.swipe_preference.upsert(preference,{
    fields:['user_id','age_upper', 'age_lower', 'genders', 'update_ts']
  });
  await swipeCache.CachePreference(userId, preference);
}

async function GetRequest(sender, receiver){
  return model.swipe_request.findOne({
    where:{ sender:sender, receiver:receiver }
  });
}

async function FindAllRequest(sender){
  return model.swipe_request.findAll({
    where:{ sender:sender }
  });
}

async function FindPendingRequest(userId, offset){
  const { count, rows } = await model.swipe_request.findAndCountAll({
    where: {
      status: SwipeConfig.RequestStatus.Pending,
      receiver: userId,
      deleted: UserConfig.DeleteStatus.Normal,
      banned: UserConfig.BannedStatus.Normal,
    },
    order: [['request_ts', 'DESC']],
    offset: offset,
    limit: 20,
  });
  return { count, rows };
}


async function UpsertRequest(sender, receiver, isSuperLike){
  const now = new Date().getTime();
  const doc = {
    sender: sender,
    receiver: receiver,
    request_ts: now,
    deleted: UserConfig.DeleteStatus.Normal,
    banned: UserConfig.BannedStatus.Normal,
    create_ts: now,
    update_ts: now,
  }
  if(isSuperLike) doc.super_like = 1;
  const [row, created] = await model.swipe_request.upsert(doc,{
    fields:['request_ts','update_ts', 'deleted', 'banned']
  });
  return created;
}

async function UpdateRequest(sender, receiver, status){
  const now = new Date().getTime();
  await model.swipe_request.update({
    status: status,
    update_ts: now,
  },{ where:{sender:sender, receiver:receiver} });
}


async function AddBoostAction(data, transaction){
  await model.swipe_boost.create({
    user_id: data.user_id,
    action: data.action,
    chance_num: data.chance_num,
    consume_flag: data.consume_flag,
    order_id: data.order_id?data.order_id:'',
  },{transaction});
}




async function UserDeleted(userId){
  const now =new Date().getTime();
  await model.swipe_profile.update({
    deleted: UserConfig.DeleteStatus.Deleted,
    update_ts: now,
  },{
    where:{ user_id:userId }
  });
}

async function UserBanned(userId){
  const now =new Date().getTime();
  await model.swipe_profile.update({
    banned: UserConfig.BannedStatus.Banned,
    update_ts: now,
  },{
    where:{ user_id:userId }
  });
}


module.exports = {
  GetPreference,
  UpdatePreference,
  PreferenceProfiles,
  UpsertProfile,
  IncrLikeCnt,
  IncrDisLike,
  UpsertRequest,
  GetRequest,
  UpdateRequest,
  FindAllRequest,
  FindPendingRequest,
  GetSwipeProfile,
  AddBoostAction,
  UserDeleted,
  UserBanned,
}