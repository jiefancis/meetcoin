const exchangeRepo = require('../model/access/exchange-repo');
const walletRepo = require('../model/access/wallet-repo');
const orderRepo = require('../model/access/order-repo');
const { logger, BaseError, tools } = require('../lib/common-lib');
const { OrderConfig, WalletConfig } = require('../config/constants');
const model = require('../model/db');
const moment = require('moment');
const _ = require('lodash');
const BigNumber = require('bignumber.js');
BigNumber.config({ DECIMAL_PLACES: 8 });

/**
 * 交易所订单按状态分类
 * @param orders 已经按照create_time DESC排序
 * @returns {{fail: *[], abnormal: *[], completeBeforeSevenDay: *[], pending: *[], completeInSevenDay: *[]}}
 */
function exchangeOrderCategorize(orders) {
  const orderCate = {
    completeInSevenDay: [],
    completeBeforeSevenDay: [],
    pending: [],
    fail: [],
    abnormal: [],
  };
  if (!orders || orders.length === 0) return orderCate;
  const nowMoment = moment();
  for (let i = 0; i < orders.length; i += 1) {
    const order = orders[i];
    const { order_state: orderState, update_ts: updateTime } = order;
    // 失败订单只关注最近的一笔
    if (orderState === OrderConfig.OrderStatus.FAIL && i === 0) orderCate.fail.push(order);
    if (orderState === OrderConfig.OrderStatus.ABNORMAL && i === 0) orderCate.abnormal.push(order);
    if (orderState === OrderConfig.OrderStatus.PENDING) orderCate.pending.push(order);
    if (orderState === OrderConfig.OrderStatus.COMPLETED) {
      const diff = nowMoment.diff(moment(parseInt(updateTime, 10)), 'days');
      if (diff <= 7) {
        orderCate.completeInSevenDay.push(order);
      } else {
        orderCate.completeBeforeSevenDay.push(order);
      }
    }
  }
  logger.debug('exchange order categorized map: ', orderCate);
  return orderCate;
}


async function FindExchanges(userId, options){
  const { platform, ip_country_code:ipCountryCode } = options;
  const exchanges = await exchangeRepo.FindExchanges(platform, ipCountryCode);

  const orders = await orderRepo.FindAllExchangeOrder(userId);
  const groupOrder = _.groupBy(orders, 'exchange_name');

  const retItems = [];
  for(let i = 0; i < exchanges.length; i += 1){
    const item = exchanges[i];
    const { exchange_name: exchangeName } = item;
    const exchangeOrders = groupOrder[exchangeName];
    const orderCate = exchangeOrderCategorize(exchangeOrders);
    if (orderCate.fail.length > 0) {
      // 最新一笔订单失败, 客户端显示resubmit，并根据fail_code展示失败原因；fail_code由自动打款侧写入
      item.exchange_order_status = OrderConfig.OrderStatus.FAIL;
    } else if (orderCate.abnormal.length > 0) {
      // 名下有每日筛选标记为异常的订单，客户端显示re-register
      item.exchange_order_status = OrderConfig.OrderStatus.ABNORMAL;
    } else if (orderCate.completeInSevenDay.length > 0) {
      // 7天那有打款成功的订单，计算距离下一次可申请提现的天数
      item.exchange_order_status = OrderConfig.OrderStatus.COMPLETED;
      const { update_ts: updateTime } = orderCate.completeInSevenDay[0];
      const diff = Math.max(moment().diff(moment(parseInt(updateTime, 10)), 'days'), 1);
      item.count_down_day = Math.max(7 - diff, 1);
    } else if (orderCate.pending.length > 0) {
      // 名下有待处理的订单，客户端显示In review
      item.exchange_order_status = OrderConfig.OrderStatus.PENDING;
    }
    retItems.push(item);
    if (i === 0 && orders.length === 0) {
      // 对于从未有个订单记录的新用户，只返回rank最高的交易所
      break;
    }
  }

  return retItems.map(ex => ({
    exchange_name: ex.exchange_name,
    exchange_banner_url: ex.exchange_banner_url,
    exchange_status: ex.exchange_status,
    exchange_deep_link: ex.exchange_deep_link,
    exchange_order_status: ex.exchange_order_status?ex.exchange_order_status:0,
    exchange_source: ex.source?ex.source:'',
    exchange_rank: ex.rank,
    count_down_day: ex.count_down_day?ex.count_down_day:-1,
    tutorial_url: ex.exchange_tutorial_link,
  }));
}


// ================================== 托管式事务，用于用户提现 ================================== 
async function WithDraw(userId, params, options){
  const { amount, exchange_name:exchangeName, phone_country:phoneCountry, phone_number:phoneNumber, email, uid } = params;
  const { platform, ip_country_code:ipCountryCode } = options;
  return model.sequelize.transaction(async (transaction) =>{
    const orderId = await orderRepo.CreateExchangeOrder({
      user_id: userId,
      order_amount: amount,
      order_coin_type: WalletConfig.AmountType.USDT,
      exchange_name: exchangeName,
      phone_country: phoneCountry,
      phone_number: phoneNumber,
      email: email || '',
      uid: uid || '',
      country: ipCountryCode,
      platform: platform,
    }, transaction);
    await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.USDT, -1 * amount, WalletConfig.ItemType.WithDraw, orderId, transaction);
    return orderId;
  });
}


async function WithDrawRecords(userId, queryOffset){
  const { count, rows } = await orderRepo.FindExchangeOrder(userId, queryOffset, 20);
  const items = rows.map((order)=>{
    return {
      order_id: order.order_id,
      order_amount: order.order_amount,
      order_state: order.order_state,
      create_ts: order.create_ts,
    }
  });
  return {
    items: items,
    offset: queryOffset + items.length,
    total: count,
    has_more: queryOffset + items.length < count ? 1 : 0,
  }
}

async function Swap(userId, swapNum){
  const swapRate = 1/WalletConfig.SwapRate.Score2USDT;
  await model.sequelize.transaction(async (transaction) =>{
    await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.Score, -1*swapNum, WalletConfig.ItemType.Swap, '', transaction);
    const usdtAmount = BigNumber(swapNum).multipliedBy(swapRate).toString();
    await walletRepo.UpdateBalance(userId, WalletConfig.AmountType.USDT, usdtAmount, WalletConfig.ItemType.Swap, '', transaction);
  });
}





module.exports = {
  FindExchanges,
  WithDraw,
  WithDrawRecords,
  Swap,
}