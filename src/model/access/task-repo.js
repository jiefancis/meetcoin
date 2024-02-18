const model = require('../db/index');
const { logger } = require('../../lib/common-lib');



async function SaveUserSign(userId, day, nowDate, rewardNum, option, transaction){
  const signDoc = {
    user_id: userId,
    sign_date: nowDate,
    gold_reward: rewardNum,
    version: option.appVersion || '',
    platform: option.platform || '',
    country: option.country || '',
    day,
  }
  return model.task_sign_in.create(signDoc,{ transaction });
}


async function GetLastSign(userId){
  return model.task_sign_in.findOne({
    where: {
      user_id: userId,
    },
    order: [['sign_date', 'DESC']],
  });
}


async function FindAllFriendAssisted(userId){
  return model.task_friend_assist.findAll({
    where:{ user_id: userId }
  });
}

async function SaveFriendBoost(userId, boxType, ip){
  try{
    await model.task_friend_assist.create({
      user_id:userId,
      box_type: boxType,
      ip: ip,
    });
    return true;
  }catch (error){
    logger.error(`SaveFriendBoost Error ${userId}, ${boxType}, ${ip}`, error);
    return false;
  }
}




module.exports = {
  SaveUserSign,
  GetLastSign,
  FindAllFriendAssisted,
  SaveFriendBoost,
}