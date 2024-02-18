const base = require('./base');
const walletRepo = require('../../model/access/wallet-repo');
const walletService = require('../../service/wallet-service');
const { WalletConfig } = require('../../config/constants');


async function Balance(ctx){
  try {
    const userId = ctx.currentUserId;
    const wallet = await walletRepo.GetWallet(userId);
    ctx.state.ok({
      coin_num:wallet.coin_num,
    });
  } catch (err) {
    ctx.state.error(err);
  }
}

async function Exchanges(ctx){
  try {
    const userId = ctx.currentUserId;
    const options = base.GetOptions(ctx);
    const exchanges = await walletService.FindExchanges(userId, options);
    ctx.state.ok({
      exchanges
    });
  } catch (err) {
    ctx.state.error(err);
  }
}


async function SwapConfig(ctx){
  try {
    const userID = ctx.currentUserId;
    ctx.state.ok({
      coin_to_usdt: WalletConfig.SwapRate,
    });
  } catch (err) {
    ctx.state.error(err);
  }
}


async function Swap(ctx){
  try {
    const userId = ctx.currentUserId;
    const { swap_num: swapNum } = ctx.state.params;
    await walletService.Swap(userId, swapNum);
    ctx.state.ok({});
  } catch (err) {
    ctx.state.error(err);
  }
}

async function WithDraw(ctx){
  try {
    const userId = ctx.currentUserId;
    const { amount, exchange_name, phone_country, phone_number, email } = ctx.state.params;
    const options = base.GetOptions(ctx);
    const orderId = await walletService.WithDraw(userId, { amount, exchange_name, phone_country, phone_number, email }, options)
    ctx.state.ok({order_id:orderId});
  } catch (err) {
    ctx.state.error(err);
  }
}

async function WithDrawRecords(ctx){
  try {
    const userId = ctx.currentUserId;
    let { offset: queryOffset } = ctx.state.params;
    queryOffset = parseInt(queryOffset, 10) ? parseInt(queryOffset, 10) : 0;
    const resp = await walletService.WithDrawRecords(userId, queryOffset);
    ctx.state.ok({
      items:resp.items,
      offset:resp.offset,
      has_more:resp.has_more,
    });
  } catch (err) {
    ctx.state.error(err);
  }
}


module.exports = {
  Balance,
  Exchanges,
  SwapConfig,
  Swap,
  WithDrawRecords,
  WithDraw,
}
