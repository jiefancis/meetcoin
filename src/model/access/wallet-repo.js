const model = require('../db/index');
const { tools, logger, BaseError } = require('../../lib/common-lib');
const { WalletConfig, BizErrorCode } = require('../../config/constants');
const BigNumber = require('bignumber.js');
BigNumber.config({ DECIMAL_PLACES: 8 })

async function GetWallet(userId){
  const now = new Date().getTime();
  const [wallet, created] = await model.wallet.findOrCreate({
    where: { user_id: userId },
    defaults: {
      id: tools.snowflake.GenId(),
      user_id: userId,
      create_ts: now,
      update_ts: now,
    },
  });
  return wallet;
}

function getAmountFiled(amountType){
  if(amountType === WalletConfig.AmountType.Score){
    return 'coin_num';
  }else if(amountType === WalletConfig.AmountType.USDT){
    return 'usdt_num';
  }else if(amountType === WalletConfig.AmountType.DOGE){
    return 'doge_num';
  }else{
    throw new BaseError(BizErrorCode.ParamsError, `invalid amountType:${amountType}`);
  }
}

async function UpdateBalance(userId, amountType, amount, itemType, itemId, transaction){
  const amountFiled = getAmountFiled(amountType);

  const wallet = await GetWallet(userId);
  const balance = wallet[amountFiled];

  const remain = BigNumber(balance).plus(amount).toNumber();
  if(remain < 0) throw new BaseError(BizErrorCode.BalanceNotEnough);

  const now = new Date().getTime();
  const sql = `
  update wallet set update_ts = ${now}, ${amountFiled} = ${remain} 
  where user_id = '${userId}' and ${amountFiled} = ${balance};
  `;

  const rst = await model.sequelize.query(sql, {transaction});
  logger.info('UpdateBalance', rst);
  if(!rst || !rst[0] || rst[0]['affectedRows'] === 0) throw new BaseError(BizErrorCode.BalanceNotEnough);
  await model.wallet_trans.create({
    user_id: userId,
    amount: amount,
    amount_type: amountType,
    balance: remain,
    item_type: itemType,
    item_id: itemId,
  },{ transaction });

  return remain;
}

async function FindReferralRewards(userId, offset){
  const itemTypes = [
    WalletConfig.ItemType.ReferralReward,
    WalletConfig.ItemType.ReferralCommission,
  ];
  return model.wallet_trans.findAndCountAll({
    where: {
      user_id: userId,
      item_type: { [model.Sequelize.Op.in]: itemTypes }
    },
    order: [['create_ts', 'DESC']],
    offset: offset,
    limit: 20,
  });
}

async function GetTotalReferralReward(userId){
  const itemTypes = [
    WalletConfig.ItemType.ReferralReward,
  ];
  return model.wallet_trans.sum('amount',{
    where:{
      user_id: userId,
      item_type: { [model.Sequelize.Op.in]: itemTypes }
    }
  });
}


module.exports = {
  GetWallet,
  UpdateBalance,
  FindReferralRewards,
  GetTotalReferralReward,
}
