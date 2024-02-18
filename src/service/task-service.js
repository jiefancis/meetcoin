const _ = require('lodash');
const moment = require('moment');
const model = require('../model/db/index');
const taskRepo = require('../model/access/task-repo');
const swipeCache = require('../model/redis/swipe-cache');
const walletRepo = require('../model/access/wallet-repo');
const taskCache = require('../model/redis/task-cache');
const { BaseError, logger } = require('../lib/common-lib');
const {
  WalletConfig, TaskConfig, BizErrorCode
} = require('../config/constants');

async function SignReward(userId, nowDate, options){
  const { appVersion, platform, country } = options;
  const { current_day: signDay, sign_status:signStatus } = await GetSignStatus(userId, nowDate);
  if(signStatus === 1) throw new BaseError(BizErrorCode.ParamsError, 'today already signed');

  const rewards = TaskConfig.SignReward.filter( item => item.day === signDay);
  if (!rewards || rewards.length === 0) return;
  const rewardNum = rewards[0].reward_num;
  await model.sequelize.transaction(async (transaction) => {
    await taskRepo.SaveUserSign(userId, signDay, nowDate, rewardNum,{appVersion, platform, country}, transaction);
    await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.Score, rewardNum, WalletConfig.ItemType.SignInTask, '', transaction);
  });
  return { current_day:signDay, reward: rewardNum };
}

async function GetSignStatus(userId, nowDate){
  const lastSign = await taskRepo.GetLastSign(userId);

  const lastSignDay = lastSign ? lastSign.day : 0;
  const lastSignDate = lastSign ? lastSign.sign_date : '1970-01-01';
  const gap = moment(nowDate).diff(lastSignDate, 'day');

  //默认第一天
  let currDay = 1;
  //gap 为0代表当天
  if(gap === 0) currDay = lastSignDay;
  //gap 为1代表第二天
  if(gap === 1) currDay = lastSignDay + 1;
  //7天签满重置签到
  if(currDay > 7) currDay = 1;
  //gap 为0代表当天
  const signStatus = gap === 0 ? 1 : 0;

  const items = _.cloneDeep(TaskConfig.SignReward);
  return {
    current_day: currDay,
    sign_status: signStatus,
    items: items.map((item)=>{
      let received = item.day < currDay ? 1 : 0;
      if(item.day === currDay) received = signStatus;
      return {
        day: item.day,
        reward: item.reward_num,
        received: received,
      }
    })
  };
}

async function countFriendAssistedCount(userId){
  const assisted = await taskRepo.FindAllFriendAssisted(userId);
  const assistedGroup = _.groupBy(assisted, 'box_type');
  const assistedCountMap = new Map();
  for(let key of Object.keys(assistedGroup)){
    const assisted = assistedGroup[key];
    assistedCountMap.set(key.toString(), assisted.length);
  }
  return assistedCountMap;
}

async function MysteryBox(userId){
  const boxes = _.cloneDeep(TaskConfig.MysteryBox);
  const boxCountMap = await countFriendAssistedCount(userId);
  for (let box of boxes){
    const boxType = box.box_type.toString();
    box.assisted_num = boxCountMap.get(boxType) ? boxCountMap.get(boxType) : 0;
    box.link = `https://www.vexmico.com?user_id=${userId}&box_type=${boxType}`;
  }
  return boxes;
}


async function FriendBoost(userId, boxType, options){
  const { ip } = options;
  const boxes = _.cloneDeep(TaskConfig.MysteryBox);
  const items = boxes.filter( item=>item.box_type === boxType);
  if(items.length === 0) throw new BaseError(BizErrorCode.ParamsError, 'invalid box type');

  const box = items[0];
  const boxCountMap = await countFriendAssistedCount(userId);
  const assistCount = boxCountMap.get(boxType.toString());

  // userid + box type + ip 唯一约束，防止刷奖励
  const success = await taskRepo.SaveFriendBoost(userId, boxType, ip);
  if(!success) return;

  // 成功加上助力后次数是否刚好满足奖励要求次数
  if(assistCount + 1 !== box.require_num) return;

  // 进行并发锁控制，set nx ex 30s
  if(!await taskCache.FriendAssistLock(userId)) return;

  // 具体奖励
  const rewards = box.rewards;
  for(let reward of rewards){
    const { reward_type, reward_num } = reward;
    if(reward_type === TaskConfig.MysteryBoxRewardType.Score){
      await model.sequelize.transaction(async (transaction) => {
        await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.Score, reward_num, WalletConfig.ItemType.AssistTask, '', transaction);
      });
    }else if(reward_type === TaskConfig.MysteryBoxRewardType.Doge){
      await model.sequelize.transaction(async (transaction) => {
        await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.DOGE, reward_num, WalletConfig.ItemType.AssistTask, '', transaction);
      });
    }else if(reward_type === TaskConfig.MysteryBoxRewardType.SuperLike){
      await swipeCache.IncrFreeSuperLike(userId);
    }
  }
}

module.exports = {
  GetSignStatus,
  SignReward,
  MysteryBox,
  FriendBoost,
}