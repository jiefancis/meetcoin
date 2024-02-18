const { logger } = require('../../lib/common-lib');
const walletRepo = require('../../model/access/wallet-repo');
const referralRepo = require('../../model/access/referral-repo');
const referralService = require('../../service/referral-service');
const { ReferralConfig } = require('../../config/constants');


async function Detail(ctx){
  try{
    const userId = ctx.currentUserId;
    const totalReward = await walletRepo.GetTotalReferralReward(userId);
    const { count:partnerCnt } = await referralRepo.FindInvitee(userId, 0);
    const referralCode = await referralService.GetReferralCode(userId);
    const maxReferral = ReferralConfig.MaxReward;

    //TODO: 相关配置链接
    const community_rules_link = '';
    const credit_guides_link = '';
    ctx.state.ok({
      referral_reward: ReferralConfig.RewardNum,
      reward_pool:totalReward,
      max_reward: maxReferral,
      partner_cnt:partnerCnt,
      community_rules_link,
      credit_guides_link,
      referral_code: referralCode,
    });
  } catch (error){
    logger.error('Detail error: ', error);
    ctx.state.error(error);
  }
}

async function Rewards(ctx){
  try{
    const userId = ctx.currentUserId;
    let { offset:queryOffset } = ctx.state.params;
    queryOffset = parseInt(queryOffset, 10) ? parseInt(queryOffset, 10): 0;
    const { items, offset, has_more } = await referralService.FindReward(userId, queryOffset);
    ctx.state.ok({
      items, offset, has_more,
    });
  } catch (error){
    logger.error('Detail error: ', error);
    ctx.state.error(error);
  }
}

async function Partners(ctx){
  try{
    const userId = ctx.currentUserId;
    let { offset:queryOffset } = ctx.state.params;
    queryOffset = parseInt(queryOffset, 10) ? parseInt(queryOffset, 10): 0;
    const { items, offset, has_more} = await referralService.FindPartners(userId, queryOffset);
    ctx.state.ok({
      items, offset, has_more
    });
  } catch (error){
    logger.error('Detail error: ', error);
    ctx.state.error(error);
  }
}

async function FillCodeReport(ctx){
  try{
    const userId = ctx.currentUserId;
    const { invite_code: inviteCode } = ctx.state.params;
    await referralService.AddInvite(userId, inviteCode);
    ctx.state.ok({});
  } catch (error){
    ctx.state.error(error);
  }
}






module.exports = {
  Partners,
  Rewards,
  Detail,
  FillCodeReport,
}
