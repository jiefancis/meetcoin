const Router = require('koa-router');
const health = require('../api/health');
const userApi = require('../api/public/user');
const swipeApi = require('../api/public/swipe');
const walletApi = require('../api/public/wallet');
const referralApi = require('../api/public/referral');
const tradeRewardApi = require('../api/public/trade-reward');
const taskApi = require('../api/public/task');

const router = new Router();
// ====================================== 校验服务是否可用 ======================================
router.get('/meetcoin/v1/health', health.check);

// ======================================= /项目名/v1/表名/ =======================================

/**我们的接口大致都是: /项目名/v1/表名/。 ... 那么问题来了，为什么API中要有版本号呢? 这是一种扩展性和复用性设计
 * 
 * 具体表现在：设计好后，已经有用户在使用这个功能或者接口，需求变更
 * */
//  referrence：https://developer.aliyun.com/article/1026082

// 用户模块
router.post('/meetcoin/v1/user/email-code', userApi.SendCode);
router.post('/meetcoin/v1/user/login', userApi.LoginRegister);
router.post('/meetcoin/v1/user/logout', userApi.LogOut);
router.post('/meetcoin/v1/user/delete', userApi.DeleteUser);
router.post('/meetcoin/v1/user/block', userApi.BlockUser);
router.post('/meetcoin/v1/user/unblock',userApi.UnBlock);
router.get('/meetcoin/v1/user/block',userApi.BlockList);
router.post('/meetcoin/v1/user/report', userApi.ReportUser);
router.get('/meetcoin/v1/user/profile', userApi.Profile);
router.post('/meetcoin/v1/user/profile', userApi.UpdateProfile);

// swipe曝光推荐
router.post('/meetcoin/v1/swipe/recommend', swipeApi.Recommend);
router.post('/meetcoin/v1/swipe/like', swipeApi.Like);
router.post('/meetcoin/v1/swipe/super-like', swipeApi.SuperLike);
router.post('/meetcoin/v1/swipe/dislike', swipeApi.DisLike);
router.get('/meetcoin/v1/swipe/requests', swipeApi.FindRequests);
router.post('/meetcoin/v1/swipe/requests', swipeApi.HandleRequests);
router.get('/meetcoin/v1/swipe/boost', swipeApi.BoostConfig);
router.post('/meetcoin/v1/swipe/boost', swipeApi.Boost);
router.post('/meetcoin/v1/swipe/boost/purchase', swipeApi.PayForBoost);

//referral+task
router.get('/meetcoin/v1/referral/detail', referralApi.Detail);
router.get('/meetcoin/v1/referral/rewards', referralApi.Rewards);
router.get('/meetcoin/v1/referral/partners', referralApi.Partners);
router.post('/meetcoin/v1/referral/code', referralApi.FillCodeReport);
router.get('/meetcoin/v1/referral/task/sign', taskApi.GetSignTask);
router.post('/meetcoin/v1/referral/task/sign', taskApi.UpdateSignTask);
router.get('/meetcoin/v1/referral/task/mystery-box', taskApi.MysteryBox);
router.get('/meetcoin/v1/referral/task/friend-boost', taskApi.FriendBoostDetail);
router.post('/meetcoin/v1/referral/task/friend-boost', taskApi.FriendBoost);

//wallet
router.get('/meetcoin/v1/wallet/balance', walletApi.Balance);
router.get('/meetcoin/v1/wallet/exchanges', walletApi.Exchanges);
router.get('/meetcoin/v1/wallet/swap', walletApi.SwapConfig);
router.post('/meetcoin/v1/wallet/swap', walletApi.Swap);
router.get('/meetcoin/v1/wallet/withdraw/records', walletApi.WithDrawRecords);
router.post('/meetcoin/v1/wallet/withdraw', walletApi.WithDraw);

//wallet-trade
router.get('/meetcoin/v1/wallet/trade/activity', tradeRewardApi.GetActivity);
router.get('/meetcoin/v1/wallet/trade/withdraw-amount', tradeRewardApi.GetWithdrawAmount);
router.get('/meetcoin/v1/wallet/trade/transactions', tradeRewardApi.GetUserTransactions);
router.post('/meetcoin/v1/wallet/trade/withdraw', tradeRewardApi.WithdrawReward);
router.post('/meetcoin/v1/wallet/trade/submit-info', tradeRewardApi.ManualSubmitInfo);

module.exports = router.routes();