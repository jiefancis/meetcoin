const model = require('../db/index');

async function GetReferralCode(userId){
  return model.referral_code.findOrCreate({
    where:{
      id:userId,
    }
  });
}

async function GetInviter(referralCode){
  return model.referral_code.findOne({
    where:{
      referral_code: referralCode,
    }
  });
}

async function GetInviterByUserId(userId){
  return model.referral.findOne({
    where:{ id: userId }
  });
}

async function AddInvitee(inviterId, inviteeId, rewardNum, transaction){
  await model.referral.create({
    id: inviteeId,
    invite_id: inviterId,
    reward_num: rewardNum,
  }, {transaction});
}


async function FindInvitee(userId, offset){
  return model.referral.findAndCountAll({
    where:{
      invite_id: userId
    },
    order: [['create_ts', 'DESC']],
    offset:offset,
    limit: 20,
  });
}

module.exports = {
  GetReferralCode,
  GetInviter,
  AddInvitee,
  FindInvitee,
  GetInviterByUserId,
}