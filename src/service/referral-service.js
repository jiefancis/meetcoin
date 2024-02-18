const referralRepo = require('../model/access/referral-repo');
const walletRepo = require('../model/access/wallet-repo');
const userRepo = require('../model/access/user-repo');
const { BaseError } = require('../lib/common-lib');
const { BizErrorCode, WalletConfig, ReferralConfig } = require('../config/constants');
const model = require("../model/db");

async function GetReferralCode(userId){
  const [obj, created] = await referralRepo.GetReferralCode(userId);
  return obj.referral_code;
}

async function commissionReward(userId, reward, transaction){
  const row = await referralRepo.GetInviterByUserId(userId);
  if(!row) return;
  const inviterId = row.invite_id;
  const commissionReward = reward * ReferralConfig.CommissionRate;
  await walletRepo.UpdateBalance(
    inviterId, WalletConfig.AmountType.Score, commissionReward,
    WalletConfig.ItemType.ReferralCommission, userId, transaction
  );
}

async function AddInvite(userId, referralCode){
  const inviter = await referralRepo.GetInviter(referralCode);
  if(!inviter) throw BaseError(BizErrorCode.ParamsError, 'invalid referral code');
  if(inviter.id === userId) throw BaseError(BizErrorCode.ParamsError, 'can not invite yourself');

  const inviterId = inviter.id;
  const { count } = await referralRepo.FindInvitee(inviterId, 0);
  if(count >= ReferralConfig.MaxInvited) throw BaseError(BizErrorCode.ParamsError, `max invited: ${count}`);
  await model.sequelize.transaction(async (transaction) => {
    await referralRepo.AddInvitee(inviterId, userId, ReferralConfig.RewardNum, transaction);
    await walletRepo.UpdateBalance(
      inviterId, WalletConfig.AmountType.Score, ReferralConfig.RewardNum,
      WalletConfig.ItemType.ReferralReward, userId, transaction
    );
    await commissionReward( inviterId, ReferralConfig.RewardNum, transaction);
  });
}


async function FindPartners(userId, offset){
  const { count, rows } = await referralRepo.FindInvitee(userId, offset);
  const inviteeIds = rows.map((row)=>{
    return row.id;
  });
  const invitees = await userRepo.FindUsers(inviteeIds);
  const inviteeMap = new Map(invitees.map((invitee)=>{
    return [invitee.id, invitee];
  }));

  const items = rows.map((row)=>{
    const invitee = inviteeMap.get(row.id);
    return {
      user:invitee,
      create_ts: row.create_ts,
    }
  });

  return {
    offset: offset + items.length,
    items: items,
    has_more: count > offset + items.length ? 1 : 0
  }
}

async function FindReward(userId, offset){
  const { count, rows }= await walletRepo.FindReferralRewards(userId, offset);
  const items = rows.map((row)=>{
    return {
      item_type: row.item_type,
      reward: row.amount,
      create_ts: row.create_ts,
    }
  });
  return {
    items: items,
    offset: offset + items.length,
    has_more: count > offset + items.length ? 1 : 0,
  }
}


module.exports = {
  GetReferralCode,
  AddInvite,
  FindPartners,
  FindReward,
}