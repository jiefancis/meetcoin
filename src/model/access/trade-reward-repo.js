const _ = require('lodash');
const model = require('../db/index');
const { logger, BaseError } = require('../../lib/common-lib')
const { GenId } = require('../../lib/common-lib/lib/tools/snowflake');
const {
  OrderConfig, TradeWithdrawAmountConfig, TradeRewardConfig, BizErrorCode
} = require('../../config/constants');

async function GetActivityDetail(platform, country){
  return model.trade_reward_activity.findOne({
    where: {
      platform,
      country,
      active: 1,
    },
  });
}

async function GetUserTradeWallet(userID, uid) {
  if (!userID || !uid) return null;
  const defaultWallet = {
    user_id: userID,
    uid,
  };
  const [wallet, ] = await model.trade_reward.findOrCreate({
    where: {
      user_id: userID,
    },
    defaults: defaultWallet,
  });
  logger.info(`${userID} trade reward wallet: `, wallet);
  return wallet;
}

async function GetUserTradePendingOrder(userID) {
  const order = await model.trade_reward_order.findOne({
    where: {
      user_id: userID,
      order_state: OrderConfig.OrderStatus.PENDING,
      deleted: 0,
    },
  });
  logger.info('user pending order: ', order);
  return order;
}

async function GetTradeWithdrawAmount(platform, IPCountry){
  const country = [ TradeWithdrawAmountConfig.GeneralCountryName ];
  if (IPCountry) country.push(IPCountry);
  const configs = await model.trade_reward_withdraw_config.findAll({
    where: {
      platform,
      country: { [model.Sequelize.Op.in]: country },
    },
  });

  if (!configs || configs.length === 0) return null;
  const countryConfig = configs.filter(item => item.country === IPCountry);
  const generalConfig = configs.filter(item => item.country === 'GENERAL');
  let config;
  if (countryConfig && countryConfig.length === 1) {
    config = countryConfig[0];
  } else if (generalConfig && generalConfig.length === 1) {
    config = generalConfig[0];
  }
  logger.info(`${IPCountry} ${platform} withdraw config: `, config);
  return config || null;
}

async function GetUserWithdrewAmount(userId){
  const orderAmounts = await model.trade_reward_order.findAll({
    where: {
      user_id: userId,
      order_state: OrderConfig.OrderStatus.COMPLETED,
      deleted: 0,
    },
    attributes: [
      [ model.Sequelize.fn('DISTINCT', model.Sequelize.col('order_amount')), 'order_amount' ],
    ],
  });
  if (!orderAmounts || orderAmounts.length === 0) return {};
  const amountMap = _.groupBy(orderAmounts, function(o) { return parseInt(o.order_amount, 10) });
  logger.debug(`${userId} amount history: `, amountMap);
  return amountMap;
}

async function SaveManualInfo(info){
  try {
    await model.sequelize.transaction(async (transaction) => {
      await model.trade_reward_manual_info.create(info, { transaction });
      const { uid, user_id: userID, exchange_name: exchangeName } = info;
      // await userCache.CacheUserUID(userID, exchangeName, uid);
    });
  } catch (e) {
    logger.error('Save manual info fail: ', e);
    // throw new BaseError(BizErrorCode.ManualSubmitInfoInvalid);
  }
}

async function GetManualInfo(userId){
  return await model.trade_reward_manual_info.findOne({
    where: {
      user_id: userId,
    },
  });
}


async function GetUserSuccessUID(userId, exchangeName = 'BingX') {
  const order = await model.exchange_order.findOne({
    where: {
      user_id: userId,
      exchange_name: exchangeName,
      order_state: OrderConfig.OrderStatus.COMPLETED,
      uid: {
        [model.Sequelize.Op.and]: {
          [model.Sequelize.Op.not]: null,
          [model.Sequelize.Op.not]: '',
        },
      },
    },
  });
  let uid = order ? order.uid : null;
  if(!uid){
    const manualInfo = await model.trade_reward_manual_info.findOne({
      where: {
        user_id: userId,
      },
    });
    uid = manualInfo ? manualInfo.uid : null;
  }
  return uid;
}


async function UpdateRemain(userId, amount, transType, actionType, tradeNum = 0, tx = null){
  const transSymbol = TradeRewardConfig.TransSymbol[transType];
  const updatedDoc = {
    remain: model.Sequelize.literal(`remain ${transSymbol} ${amount}`),
    update_ts: Date.now(),
  };
  if (tradeNum && tradeNum > 0) {
    updatedDoc.exchange_trade_total = model.Sequelize.literal(`exchange_trade_total + ${tradeNum}`);
  }
  const filter = {
    user_id: userId,
  };
  if (transType === TradeRewardConfig.TransType.Minus) {
    filter.remain = { [model.Sequelize.Op.gte]: amount };
  }
  const [length, rows] = await model.trade_reward.update(updatedDoc, {
    where: filter,
    returning: true,
    transaction: tx,
  });
  if (length === 0 || !rows || rows.length === 0 || !rows[0]) throw new BaseError(BizErrorCode.TradeWithdrawFail);
  if (amount > 0) {
    const transDoc = {
      user_id: userId,
      trans_type: transType,
      action_type: actionType,
      amount,
    };
    await model.trade_reward_transaction.create(transDoc, { transaction: tx });
  }
  logger.info('updated trade wallet: ', rows[0]);
  return rows[0];
}

async function CreateOrder(doc, tx = null) {
  const orderID = GenId();
  const rawDoc = _.set(doc, 'order_id', orderID);
  const order = await model.trade_reward_order.create(rawDoc, {
    transaction: tx,
  });
  logger.info('reward withdraw order created: ', order);
  if (!order) throw new BaseError(BizErrorCode.TradeWithdrawFail, '');
}


async function GetUserTransactionByType(userID, type, limit, offset) {
  const rawTrans = await model.trade_reward_transaction.findAll({
    where: {
      user_id: userID,
      trans_type: type,
    },
    limit,
    offset,
    order: [['create_ts', 'DESC']],
  });
  logger.debug('trans record: ', rawTrans);
  return rawTrans;
}

module.exports = {
  GetActivityDetail,
  GetUserTradeWallet,
  GetUserTradePendingOrder,
  GetTradeWithdrawAmount,
  GetUserWithdrewAmount,
  SaveManualInfo,
  GetManualInfo,
  GetUserSuccessUID,
  UpdateRemain,
  CreateOrder,
  GetUserTransactionByType,
}