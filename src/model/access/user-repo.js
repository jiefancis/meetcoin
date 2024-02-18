const model = require('../db/index');
const cache = require('../redis/user-cache');
const _ = require('lodash');
const { UserConfig } = require('../../config/constants');

function toUserDTO(userDO){
  return {
    id: userDO.id,
    email: userDO.email,
    user_name: userDO.user_name ? userDO.user_name : '',
    profile_img_url: userDO.profile_img_url ? userDO.profile_img_url : '',
    snap_chat_id: userDO.snap_chat_id ? userDO.snap_chat_id : '',
    gender: userDO.gender ? userDO.gender : 0,
    birthday: userDO.birthday ? userDO.birthday : '',
    display_age: userDO.display_age ? userDO.display_age : 0,
    country_code: userDO.country_code ? userDO.country_code : '',
    bio: userDO.bio ? userDO.bio : '',
    photos: userDO.photos ? userDO.photos : [],
    deleted: userDO.deleted ? userDO.deleted : 0,
    banned: userDO.banned ? userDO.banned : 0,
  };
}

async function FindOrCreate(email){
  const now = new Date().getTime();
  const defaults = {
    create_ts: now,
    update_ts: now,
  }
  const [user, created] = await model.user.findOrCreate({
    where: { email },
    defaults,
  });
  return { user, created }
}

async function FindOrCreateByAccount(accountId, accountSource){
  const now = new Date().getTime();
  const defaults = {
    create_ts: now,
    update_ts: now,
  }
  const [user, created] = await model.user.findOrCreate({
    where: { third_account_id:accountId, third_account_source:accountSource },
    defaults,
  });
  return { user, created }
}

async function GetUser(userId){
  const users = await FindUsers([userId]);
  if (users.length === 0) return null;
  return users[0];
}

async function FindUsers(userIds){
  if (!userIds || userIds.length === 0) return [];
  const userIDs = _.uniq(userIds);
  const userDTOList = [];
  const uncachedUserIds = [];
  for (let i in userIDs) {
    const userId = userIDs[i];
    let cachedProfileDTO = await cache.GetUserCache(userId);
    if (!cachedProfileDTO) {
      uncachedUserIds.push(userId);
    } else {
      // 旧缓存更新
      userDTOList.push(cachedProfileDTO);
    }
  }
  // 这一段是我自己加的，如果数据都在redis中，就没有必要再更新redis缓存了

  if(uncachedUserIds.length === 0) {
    return userDTOList
  }

  
  
  const userDOs = await model.user.findAll({
    where: { id: { [model.Sequelize.Op.in]: uncachedUserIds } },
  });

  for (let userDO of userDOs) {
    const userDTO = toUserDTO(userDO);
    await cache.SetUserCache(userDTO.id, userDTO);
    userDTOList.push(userDTO);
  }
  return userDTOList;
}

async function UpdateUser(userId, param){
  const rst = await model.user.update(param, {
    where: { id: userId }
  });
  if (!rst || rst[0] === 0) {
    return false;
  }
  return true;
}

async function FindAllBlock(userId){
  return model.block.findAll({
    where:{ user_id: userId, deleted:UserConfig.DeleteStatus.Normal }
  });
}

async function Block(userId, blockUserId){
  const now = new Date().getTime();
  const blocked = await model.block.findOne({
    where: {
      user_id: userId,
      block_user_id: blockUserId,
    },
  });
  if (blocked) {
    await model.block.update({
      update_ts: now,
      deleted: UserConfig.DeleteStatus.Normal,
    }, { where: { id: blocked.id } });
    return;
  }
  await model.block.create({
    user_id: userId,
    block_user_id: blockUserId,
    deleted: UserConfig.DeleteStatus.Normal,
    create_ts: now,
    update_ts: now,
  });
}

async function BlockList(userId, offset){
  const { count, rows } = await model.block.findAndCountAll({
    where: {
      user_id: userId,
      deleted: UserConfig.DeleteStatus.Normal,
    },
    order: [['create_ts', 'DESC']],
    offset:offset,
    limit: 20,
  });
  return { count, rows }
}

async function UnBlock(userId, blockUserId){
  await model.block.update({
    deleted: UserConfig.DeleteStatus.Deleted,
  }, {
    where: { user_id: userId, block_user_id: blockUserId, }
  });
}


async function Report(userId, violatorId, reason, content){
  const now = new Date().getTime();
  await model.report.create({
    user_id: userId,
    violator_id: violatorId,
    reason: reason,
    content: content,
    create_ts: now,
    update_ts: now,
  });
}

async function CountReport(violatorId){
  return model.report.count({
    where:{violator_id: violatorId}
  });
}


async function FindViolator(userId){
  return model.report.findAll({
    where:{ user_id: userId }
  });
}


async function Online(userId, onlineTs){
  await model.user_online.upsert({
    user_id: userId,
    online_ts: onlineTs,
    update_ts: onlineTs,
    create_ts: onlineTs,
  },{
    fields:['user_id', 'online_ts', 'update_ts']
  });
}

async function Offline(userId, offlineTs){
  await model.user_online.upsert({
    user_id: userId,
    offline_ts: offlineTs,
    update_ts: offlineTs,
    create_ts: offlineTs,
  },{
    fields:['user_id', 'offline_ts', 'update_ts']
  });
}

async function Engage(userId, engageTs){
  await model.user_online.upsert({
    user_id: userId,
    engage_ts: engageTs,
    update_ts: engageTs,
    create_ts: engageTs,
  },{
    fields:['user_id', 'engage_ts', 'update_ts']
  });
}

async function GetUserOnline(userId){
  return model.user_online.findOne({
    where:{user_id: userId}
  });
}

async function UpdateDevice(userId, deviceId, deviceType){
  if(!deviceId) return;
  const now = new Date().getTime();
  await model.device.upsert({
    user_id: userId,
    device_id: deviceId,
    device_type: deviceType,
    update_ts: now,
    create_ts: now,
  },{
    fields:['device_id', 'device_type', 'update_ts']
  });
}

async function GetDevice(userId){
  return model.device.findOne({
    where: { user_id: userId },
  });
}


module.exports = {
  FindOrCreate,
  FindOrCreateByAccount,
  GetUser,
  FindUsers,
  UpdateUser,
  Block,
  BlockList,
  UnBlock,
  Report,
  Online,
  Offline,
  UpdateDevice,
  FindAllBlock,
  FindViolator,
  GetUserOnline,
  Engage,
  GetDevice,
  CountReport,
}