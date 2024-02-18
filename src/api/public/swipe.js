const { logger } = require('../../lib/common-lib');
const swipeService = require('../../service/swipe-service');

async function SuperLike(ctx){
  try{
    const { like_user_id:targetId } = ctx.state.params;
    const userId = ctx.currentUserId;
    await swipeService.SuperLike(userId, targetId);
    ctx.state.ok({});
  } catch (error){
    logger.error('SuperLike error: ', error);
    ctx.state.error(error);
  }
}

async function Like(ctx){
  try{
    const { like_user_id:targetId } = ctx.state.params;
    const userId = ctx.currentUserId;
    await swipeService.Like(userId, targetId);
    ctx.state.ok({});
  } catch (error){
    logger.error('Like error: ', error);
    ctx.state.error(error);
  }
}

async function DisLike(ctx){
  try{
    const { dislike_user_id:targetId } = ctx.state.params;
    const userId = ctx.currentUserId;
    ctx.state.ok({});
  } catch (error){
    logger.error('DisLike error: ', error);
    ctx.state.error(error);
  }
}


async function Recommend(ctx){
  try{
    const userId = ctx.currentUserId;
    let { age_upper:ageUpper, age_lower:ageLower, genders:genderSelector } = ctx.state.params;
    const preference = await swipeService.SavePreference(userId, ageUpper, ageLower, genderSelector);
    ageUpper = preference.age_upper;
    ageLower = preference.age_lower;
    genderSelector = preference.genders;
    const items = await swipeService.Recommend(userId, ageUpper, ageLower, genderSelector);
    ctx.state.ok({ items });
  } catch (error){
    logger.error('Recommend error: ', error);
    ctx.state.error(error);
  }
}


async function BoostConfig(ctx){
  try {
    const userId = ctx.currentUserId;
    const { chance_num, boost_end_ts, products } = await swipeService.BoostDetail(userId);
    ctx.state.ok({
      chance_num,
      boost_end_ts,
      products
    });
  } catch (err) {
    ctx.state.error(err);
  }
}


async function Boost(ctx){
  try{
    const userId = ctx.currentUserId;
    const boost_end_ts = await swipeService.Boost(userId);
    ctx.state.ok({
      boost_end_ts:boost_end_ts,
    });
  } catch (error){
    logger.error('Booster error: ', error);
    ctx.state.error(error);
  }
}

async function PayForBoost(ctx){
  try{
    const userId = ctx.currentUserId;
    const { product_id: productId } = ctx.state.params;
    const { balance, chance } = await swipeService.BoostPurchase(userId, productId);
    ctx.state.ok({balance, chance});
  } catch (error){
    logger.error('Booster error: ', error);
    ctx.state.error(error);
  }
}


async function FindRequests(ctx){
  try{
    const userId = ctx.currentUserId;
    let { offset:queryOffset } = ctx.state.params;
    queryOffset = parseInt(queryOffset)?parseInt(queryOffset):0;
    const rst = await swipeService.PendingRequests(userId, queryOffset);
    ctx.state.ok(rst);
  } catch (error){
    logger.error('Booster error: ', error);
    ctx.state.error(error);
  }
}

async function HandleRequests(ctx){
  try{
    const userId = ctx.currentUserId;
    const { action, user_id:targetId } = ctx.state.params;
    const reward = await swipeService.HandleRequest(userId, targetId, action);
    ctx.state.ok({
      reward:reward,
    });
  } catch (error){
    logger.error('Booster error: ', error);
    ctx.state.error(error);
  }
}


module.exports = {
  Like,
  DisLike,
  Recommend,
  SuperLike,
  BoostConfig,
  Boost,
  HandleRequests,
  FindRequests,
  PayForBoost
}

