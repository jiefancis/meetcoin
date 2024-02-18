const model = require('../model/db/index');
const _ = require('lodash');
const swipeRepo = require('../model/access/swipe-repo');
const userRepo = require('../model/access/user-repo');
const orderRepo = require('../model/access/order-repo');
const swipeCache = require('../model/redis/swipe-cache');
const walletRepo = require('../model/access/wallet-repo');
const { BaseError, logger } = require('../lib/common-lib');
const { SwipeConfig, BizErrorCode, WalletConfig } = require('../config/constants');

async function Like(userId, targetId){
  const request = await swipeRepo.GetRequest(userId, targetId);
  // 如果发过请求，则幂等处理
  if(request) return;
  await swipeRepo.UpsertRequest(userId, targetId, 0);
  // 增加 Swipe profile 对方的点赞数量
  await swipeRepo.IncrLikeCnt(targetId);
  // 清除Swipe忽略缓存
  await swipeCache.ClearSwipeIgnore(userId);
}

async function SuperLike(userId, targetId){
  const request = await swipeRepo.GetRequest(userId, targetId);
  if( request && request.super_like === 1 ) return;
  if( request && request.status !== SwipeConfig.RequestStatus.Pending ) return;

  const isFree = await swipeCache.UseFreeSuperLike(userId);

  //扣除钱包积分
  if(!isFree){
    model.sequelize.transaction(async (transaction) => {
      await walletRepo.UpdateBalance(
        userId,
        WalletConfig.AmountType.Score, -1 * SwipeConfig.SuperLike.Consume,
        WalletConfig.ItemType.SuperLikeCost, targetId, transaction
      );
    });
  }
  //发送请求
  await swipeRepo.UpsertRequest(userId, targetId, 1);
  // 增加 Swipe profile 对方的点赞数量
  if(!request) await swipeRepo.IncrLikeCnt(targetId);
  // 清除Swipe忽略缓存
  if(!request) await swipeCache.ClearSwipeIgnore(userId);
}

async function HandleRequest(userId, targetId, action){
  const receiveRequest = await swipeRepo.GetRequest(targetId, userId);
  if(!receiveRequest && receiveRequest.status !== SwipeConfig.RequestStatus.Pending) return 0;

  await swipeRepo.UpdateRequest(targetId, userId, action);
  if( action !== SwipeConfig.RequestStatus.Accept ) return 0;

  // 如果已发送请求并且对方已接收，则不再奖励
  const sendRequest = await swipeRepo.GetRequest(userId, targetId);
  if( sendRequest && sendRequest.status === SwipeConfig.RequestStatus.Accept ) return 0;

  const receiverReward = receiveRequest.super_like ? SwipeConfig.SuperLike.ReceiverReward : SwipeConfig.Like.ReceiverReward;
  await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.Score, receiverReward, WalletConfig.ItemType.SwipeRequest, targetId, null);

  const senderReward = receiveRequest.super_like ? SwipeConfig.SuperLike.SenderReward : SwipeConfig.Like.SenderReward;
  await walletRepo.UpdateBalance(targetId, WalletConfig.AmountType.Score, senderReward, WalletConfig.ItemType.SwipeRequest, userId, null);
  return receiverReward;
}

async function PendingRequests(userId, queryOffset){
  const { count, rows: items } = await swipeRepo.FindPendingRequest(userId, queryOffset);
  const senderIds = items.map((item)=>{
    return item.sender;
  });
  const senders = await userRepo.FindUsers(senderIds);
  const senderMap = new Map(senders.map((sender)=>{
    return [sender.id, sender];
  }));
  const offset = queryOffset + items.length;
  const hasMore = count > offset ? 1 : 0;
  return {
    items:items.map((item)=>{
      const user = senderMap.get(item.sender);
      if(!user) return;
      const { user_name, profile_img_url, gender, birthday, photos, country_code, bio} = user;
      return {
        id: item.sender, user_name, profile_img_url,
        gender, birthday, photos, country_code, bio,
        request_ts: item.request_ts, super_like: item.super_like,
        reward: item.super_like ? SwipeConfig.SuperLike.ReceiverReward : SwipeConfig.Like.ReceiverReward
      }}).filter((item)=>{return item !== null}),
    offset: offset,
    total: count,
    has_more: hasMore,
  }
}



function fakeRecommend(){
  const template = {
    "id": "d4fda1ba-8bcf-400f-8ece-dcfd45a9d787",
    "email": "mdv87nfp2w@privaterelay.appleid.com",
    "user_name": "chenyang",
    "profile_img_url": "",
    "snap_chat_id": "12138",
    "gender": 2,
    "birthday": "2005/06/18",
    "display_age": 1,
    "country_code": "CN",
    "bio": "",
    "photos": [
      "https://dev-yetis.s3.ap-southeast-1.amazonaws.com/photo/2023/09/18/07/65dfb266-0c02-48d5-9329-b5a1807779b5.png",
      "https://dev-yetis.s3.ap-southeast-1.amazonaws.com/photo/2023/09/18/07/4e869fb5-e417-403f-bb63-e3accbdb29aa.png",
      "https://dev-yetis.s3.ap-southeast-1.amazonaws.com/photo/2023/09/18/07/477f3254-e24c-4b9a-a846-5d63c98d6f5d.png",
      "https://dev-yetis.s3.ap-southeast-1.amazonaws.com/photo/2023/09/18/07/fa80a1cd-68dc-4687-9597-b8a8033dbbb6.png"
    ],
    "deleted": 0,
    "banned": 0
  };
  const items = [];
  for(let i=0;i<20;i++){
    const item = _.cloneDeep(template);
    items.push(item)
  }
  return items;
}

async function Recommend(userId, ageUpper, ageLower, genderSelector){
  const excludes = [userId];
  const cache = await swipeCache.GetSwipeIgnore(userId);
  logger.debug(`Recommend`,cache);
  if(!cache || cache.length === 0){
    const requests = await swipeRepo.FindAllRequest(userId);
    excludes.push(...requests.map((request)=>{return request.receiver}));
    const blocks = await userRepo.FindAllBlock(userId);
    excludes.push(...blocks.map((block)=>{return block.block_user_id}));
    const reports = await userRepo.FindViolator(userId);
    excludes.push(...reports.map((report)=>{return report.violator_id}));
    logger.debug(`Recommend excludes:`,excludes);
    await swipeCache.CacheSwipeIgnore(userId, excludes);
  }else{
    excludes.push(...cache);
  }
  const servingIds = await swipeCache.FindServing(userId);
  excludes.push(...servingIds);

  const profiles = await swipeRepo.PreferenceProfiles(ageUpper, ageLower, genderSelector, excludes);
  const pIds = profiles.map((profile)=>{return profile.user_id});
  const users = await userRepo.FindUsers(pIds);
  await swipeCache.CacheServing(userId, pIds);
  return fakeRecommend();
  // return users;
}

async function GetPreference(userId){
  return swipeRepo.GetPreference(userId);
}

async function SavePreference(userId, ageUpper, ageLower, genderSelector){
  const preference = await swipeRepo.GetPreference(userId);

  let refresh = false;
  if(ageUpper !== preference.age_upper) refresh = true;
  if(ageLower !== preference.age_lower) refresh = true;
  if(genderSelector !== preference.genders) refresh = true;
  preference.age_upper = ageUpper;
  preference.age_lower = ageLower;
  preference.genders = genderSelector;

  if( refresh ) await swipeRepo.UpdatePreference(userId, preference);
  return preference;
}

async function BoostDetail(userId){
  const chance = await swipeCache.GetBoostChance(userId);
  const swipeProfile = await swipeRepo.GetSwipeProfile(userId);
  const products = await orderRepo.FindBoostProduct();
  return {
    chance_num: chance,
    boost_end_ts: swipeProfile?swipeProfile.boost_end_ts:0,
    products: products.map((product)=>{
      return {
        product_id: product.product_id,
        price: product.price,
        boost_chance: product.boost_chance,
      }
    })
  }
}


async function boostChanceCheck(userId){
  const chance = await swipeCache.UpdateBoostChance(userId, -1);
  if(chance < 0){
    await swipeCache.UpdateBoostChance(userId, 1);
    return false;
  }
  return true;
}

async function boostScoreCheck(userId){
  await model.sequelize.transaction(async (transaction) => {
    await walletRepo.UpdateBalance(
      userId, WalletConfig.AmountType.Score, SwipeConfig.Boost.ConsumerScore,
      WalletConfig.ItemType.BoostPurchase, '', transaction
    );
  });
  return true;
}


async function Boost(userId){
  const now = new Date().getTime();
  const swipeProfile = await swipeRepo.GetSwipeProfile(userId);
  if(!swipeProfile) throw new BaseError(BizErrorCode.ParamsError, 'profile not exist');
  if(swipeProfile.boost_end_ts > now) throw new BaseError(BizErrorCode.BoostNotEnd, 'boost not end');

  let validate = await boostChanceCheck(userId);
  let consumerFlag = SwipeConfig.Boost.ConsumeFlag.Chance;

  if(!validate){
    validate = await boostScoreCheck(userId);
    consumerFlag = SwipeConfig.Boost.ConsumeFlag.Score;
  }
  if(!validate){
    throw new BaseError(BizErrorCode.BoostChanceNotEnough, 'chance not enough');
  }

  const boostEndTime = now + SwipeConfig.Boost.BoostDuration;
  await swipeRepo.UpsertProfile({ user_id:userId, boost_end_ts: boostEndTime});
  await swipeRepo.AddBoostAction({
    user_id: userId,
    action: SwipeConfig.Boost.BoostAction.Consume,
    chance_num: 1,
    consume_flag: consumerFlag,
    order_id: '',
  }, null);
  //TODO: 没有节点用户，还需不需要自动发请求
  return boostEndTime;
}


async function BoostPurchase(userId, productId){
  const products = await orderRepo.FindBoostProduct();
  const product = products.filter((product)=>{return product.product_id === productId});
  if(product.length === 0) throw BaseError(BizErrorCode.ParamsError, 'invalid product');
  const { price, boost_chance } = product[0];

  const { balance, chance } = await model.sequelize.transaction(async (transaction)=>{
    const balance = await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.Score, `-${price}`, WalletConfig.ItemType.BoostPurchase, '', transaction);
    const chance = await swipeCache.UpdateBoostChance(userId, boost_chance);
    await swipeRepo.AddBoostAction({
      user_id: userId,
      action: SwipeConfig.Boost.BoostAction.Earn,
      chance_num: 1,
      consume_flag: 0,
      order_id: '',
    }, transaction);
    return { balance, chance };
  });
  return { balance, chance }
}

module.exports = {
  Recommend,
  Like,
  SuperLike,
  HandleRequest,
  GetPreference,
  SavePreference,
  PendingRequests,
  Boost,
  BoostDetail,
  BoostPurchase,
}