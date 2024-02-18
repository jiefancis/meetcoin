const base = require('./base');
const tradeRewardService = require('../../service/trade-reward-service');
const { TradeRewardConfig } = require('../../config/constants');


async function GetActivity(ctx){
  try{
    const userId = ctx.currentUserId;
    const options = base.GetOptions(ctx);
    const rst = await tradeRewardService.GetTradeActivity(userId, options);
    ctx.state.ok(rst);
  } catch (error){
    ctx.state.error(error);
  }
}

async function GetWithdrawAmount(ctx) {
  try {
    const userId = ctx.currentUserId;
    const options = base.GetOptions(ctx);
    const { withdraw_account, items } = await tradeRewardService.GetWithdrawAmounts(userId, options)
    ctx.state.ok({items, withdraw_account});
  } catch (e) {
    ctx.state.error(e);
  }
}

async function GetUserTransactions(ctx) {
  try {
    const userId = ctx.currentUserId;
    let { index, type } = ctx.state.params;
    index = parseInt(index,10)?parseInt(index,10):0;
    type = parseInt(type, 10)?parseInt(type, 10):1;
    const items = await tradeRewardService.GetUserTransactionByType(userId, type, index);
    const hasMore = items ? items.length >= TradeRewardConfig.PageSize : false;
    ctx.state.ok({ items: items, has_more: hasMore });
  } catch (e) {
    ctx.state.error(e);
  }
}


async function WithdrawReward(ctx){
  try {
    const userId = ctx.currentUserId;
    const { amount } = ctx.state.params;
    const options = base.GetOptions(ctx);
    const remain = await tradeRewardService.WithdrawReward(userId, amount, options);
    ctx.state.ok({ remain });
  } catch (e) {
    ctx.state.error(e);
  }
}

async function ManualSubmitInfo(ctx){
  try {
    const userId = ctx.currentUserId;
    const { uid, email, phone_country: phoneCountry, phone_number: phoneNumber } = ctx.state.params;
    await tradeRewardService.SubmitManualInfo(userId, { uid, email, phone_country: phoneCountry, phone_number: phoneNumber })
    ctx.state.ok({});
  } catch (e) {
    ctx.state.error(e);
  }
}

module.exports = {
  GetActivity,
  WithdrawReward,
  GetWithdrawAmount,
  GetUserTransactions,
  ManualSubmitInfo,
};