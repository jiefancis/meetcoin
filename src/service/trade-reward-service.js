const _ = require('lodash');
const model = require('../model/db/index');
const tradeRewardRepo = require('../model/access/trade-reward-repo');
const { TradeRewardConfig, TradeWithdrawAmountConfig, BizErrorCode } = require('../config/constants');
const { logger, BaseError } = require('../lib/common-lib');

function convertActivityOffers(activity, tradeTotal = 0){
  if (!activity || !activity.offers) return {};
  const offers = activity.offers;
  if (!offers.start_time || !offers.end_time || !offers.items || offers.items.length === 0) return {};
  const { start_time: startTime, end_time: endTime } = offers;
  const now = Date.now();
  if (startTime > now || endTime < now) return {};
  return {
    start_time: offers.start_time,
    end_time: offers.end_time,
    items: offers.items.map((item) => {
      return {
        trade_requirement: item.trade_requirement,
        reward_num: item.reward_num,
        status: tradeTotal >= item.trade_requirement ? 1 : 0,
      };
    }),
  };
}

async function GetTradeActivity(userId, options){
  const { platform, ip_country_code: ipCountry } = options;
  const uid = await tradeRewardRepo.GetUserSuccessUID(userId);
  const [ activity, wallet, pendingOrder] = await Promise.all([
    tradeRewardRepo.GetActivityDetail(platform, ipCountry),
    tradeRewardRepo.GetUserTradeWallet(userId, uid),
    tradeRewardRepo.GetUserTradePendingOrder(userId)
  ]);

  const orderStatus = pendingOrder
    ? TradeRewardConfig.TradeOrderStatus.Pending
    : TradeRewardConfig.TradeOrderStatus.Enable;
  const remain = wallet ? parseFloat(wallet.remain) : 0;
  const tradeTotal = wallet ? parseFloat(wallet.exchange_trade_total) : 0;

  const res = {
    remain: remain,
    order_status: orderStatus,
    has_uid: uid ? 1 : 0,
    task_link: TradeRewardConfig.TaskLink,
  }
  if( activity ){
    res.offers = convertActivityOffers(activity, tradeTotal);
    res.tutorial_links = activity.tutorial_links || [];
    if(!uid){
      res.exchange_deep_link = '';
      res.uid_help_link = '';
    }
  }
  return res;
}

function checkAmountEnable(config, orderAmounts) {
  if (!config) return [];
  const { amount, order } = config;
  const res = [];
  const amountNumbers = _.sortBy(amount, ['amount']);
  for (let i = 0; i < amountNumbers.length; i += 1) {
    const { amount: amountNumber, repeated, false_level: falseLevel } = amountNumbers[i];
    // 初始条件为余额充足的情况下未提取的档位 or 提现过且可重复提的档位
    const amountWithdrew = orderAmounts[amountNumber];
    let lastAmountWithdrew = true;
    let enable = !amountWithdrew || (amountWithdrew && repeated);
    // 对于通过初始筛选的档位需要根据order(档位依赖)进行附加判断
    // 后续对于enable的各类附加逻辑 均在此处进行
    if (enable) {
      if (order === TradeWithdrawAmountConfig.OrderState.PreAmountDependent && i !== 0) {
        // 前序依赖的话需要判定上一档位是否已经解锁
        const { amount: lastAmount } = amountNumbers[i - 1];
        enable = !!orderAmounts[lastAmount];
        lastAmountWithdrew = !!orderAmounts[lastAmount];
      }
    }

    res.push({
      amount: amountNumber, // 当前档位金额
      enable: enable ? 1 : 0,
      false_level: falseLevel, // 是否为虚假展示档位
      last_amount_withdrew: lastAmountWithdrew, // 对于余额依赖 & 前序依赖的前一档已提现 该字段为true; 前序依赖的前一档未提现为false
    });
  }
  logger.info('trade order withdraw amount: ', res);
  return res;
}

async function GetWithdrawAmounts(userId, options){
  const { platform, ip_country_code: ipCountry } = options;
  const [ amountConfig, orderAmounts, manualWithdrawInfo ] = await Promise.all([
    tradeRewardRepo.GetTradeWithdrawAmount(platform, ipCountry),
    tradeRewardRepo.GetUserWithdrewAmount(userId),
    tradeRewardRepo.GetManualInfo(userId),
  ])
  const amounts = checkAmountEnable(amountConfig, orderAmounts);
  let withdrawAccount = '';
  //TODO: 其它途径提现所得到的账号配置
  if(manualWithdrawInfo){
    if (manualWithdrawInfo.email) {
      withdrawAccount = manualWithdrawInfo.email;
    } else if (manualWithdrawInfo.phone) {
      withdrawAccount = `+${manualWithdrawInfo.phone}`;
    }
  }

  return {
    items: amounts,
    withdraw_account: withdrawAccount,
  };
}


async function SubmitManualInfo(userID, params, exchangeName = 'BingX'){
  const { uid, email, phone_country: phoneCountry, phone_number: phoneNumber } = params;
  if (!uid) throw new BaseError(BizErrorCode.ParamsError, 'UID invalid, please check the tutorial and re-submit.');
  if (!email && !phoneCountry && !phoneNumber) throw new BaseError(BizErrorCode.ParamsError, 'Withdraw account info invalid, please re-submit.');
  const manualInfo = {
    user_id: userID,
    exchange_name: exchangeName,
    uid,
  };
  if (email) {
    manualInfo.email = email;
  } else if (phoneNumber && phoneCountry) {
    manualInfo.phone = `${phoneCountry} ${phoneNumber}`;
  } else {
    throw new BaseError(BizErrorCode.ParamsError, 'Withdraw account info invalid, please re-submit.');
  }
  await tradeRewardRepo.SaveManualInfo(manualInfo);
}


async function checkWithdrawParams(userId, amount, options) {
  const { withdraw_account: withdrawAccount, items } = await GetWithdrawAmounts(userId, options);
  if (!withdrawAccount) throw new BaseError(BizErrorCode.ParamsError, 'We cannot find your withdraw account, please contact our support.');
  // TODO:提现黑名单机制
  // const blocked = await userRepo.CheckWithdrawBlacklist(userID, withdrawAccount);
  // if (blocked) throw new BaseError(BizErrorCode.ParamsError, 'This withdrawal account has been banned for violating community guidelines.');
  // 查看发起的提现档位是否用户在当前交易所有效的档位
  const validAmount = items.filter(item =>
    item.amount === amount
    && item.enable
  );
  if (!validAmount || validAmount.length !== 1 || !validAmount[0]) throw new BaseError(BizErrorCode.ParamsError, 'Your selected amount is not invalid!');
  const amountConfig = validAmount[0];
  const { false_level: isFalse, last_amount_withdrew: lastAmountWithdrew } = amountConfig;

  // 假档位不予通过
  if (isFalse) throw new BaseError(BizErrorCode.ParamsError, 'Today\'s withdrawal schedule is full, please try again tomorrow');
  if (!lastAmountWithdrew) {
    throw new BaseError(BizErrorCode.ParamsError, `Please complete the previous withdrawal level before advancing to the next`);
  }
  return withdrawAccount;
}


async function WithdrawReward(userId, amount, options){
  const account = await checkWithdrawParams(userId, amount, options);
  const { ip_country_code: IPCountry } = options;
  const transType = TradeRewardConfig.TransType.Minus;
  const actionType = TradeRewardConfig.ActionType.Withdraw;
  const updatedWallet = await model.sequelize.transaction(async (transaction) => {
    const wallet = await tradeRewardRepo.UpdateRemain(userId, amount, transType, actionType, 0, transaction);
    if (!wallet) throw new BaseError(BizErrorCode.TradeWithdrawFail);
    const orderDoc = {
      user_id: userId,
      order_amount: amount,
      uid: wallet.uid,
      country: IPCountry,
      account,
    };
    await tradeRewardRepo.CreateOrder(orderDoc, transaction);
    return wallet;
  });
  if (!updatedWallet) throw new BaseError(BizErrorCode.TradeWithdrawFail);
  return updatedWallet.remain;
}

async function GetUserTransactionByType(userId, type, index = 0) {
  const limit = TradeRewardConfig.PageSize;
  const offset = index * TradeRewardConfig.PageSize;
  const rawTrans = await tradeRewardRepo.GetUserTransactionByType(userId, type, limit, offset);
  return rawTrans.map((item)=>{
    return {
      amount: item.amount,
      type: item.trans_type,
      create_ts: item.create_ts,
    };
  })
}


module.exports = {
  GetTradeActivity,
  GetWithdrawAmounts,
  SubmitManualInfo,
  WithdrawReward,
  GetUserTransactionByType,
}