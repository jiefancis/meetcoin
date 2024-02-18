
const WHITE_API = Object.freeze([
  'GET_/meetcoin/v1/health',
  'POST_/meetcoin/v1/user/login',
  'POST_/meetcoin/v1/user/email-code',
  'POST_/meetcoin/v1/referral/task/friend-boost',
  'GET_/meetcoin/v1/referral/task/friend-boost',
]);

const ACCOUNT_SOURCE = Object.freeze({
  Email: 0,
  Apple: 1,
  Google: 2,
  Snapchat: 3,
});

const BizErrorCode = Object.freeze({
  ChatBlockError: {
    code: 601,
    msg: 'Your message is rejected', // 拉黑不允许通信
  },
  ChatChannelClose: {
    code: 602,
    msg: 'channel closed', // 聊天通道关闭状态
  },
  ChatReceiverDel: {
    code: 603,
    msg: 'You can\'t chat with deleted users', // 消息接收方注销账户
  },
  ChatBannedError: {
    code: 604,
    msg: 'Your message is rejected', // 禁言或禁账号
  },
  ChatGiftError: {
    code: 605,
    msg: 'Send gift failed',
  },
  ChatReceiverBanned: {
    code: 606,
    msg: 'Receiver had been banned',
  },
  ChatBalanceError: {
    code: 607,
    msg: 'Balance Not Enough',
  },
  ParamsError: {
    code: 100000,
    msg: 'params error',
  },
  EmailLimited:{
    code: 100020,
    msg: 'try again later'
  },
  InvalidLoginCode: {
    code: 100021,
    msg: 'invalid code',
  },
  GoogleAuthFail: { // Google验证失败
    code: 100022,
    msg: 'google auth fail',
  },
  AppleAuthFail: { // Apple验证失败
    code: 100023,
    msg: 'apple auth fail',
  },
  SnapAuthFail: { // Apple验证失败
    code: 100024,
    msg: 'snap auth fail',
  },
  LikeLimit: { code: 200001, msg: 'swipe like limit' },
  BoostChanceNotEnough: { code: 200002, msg: 'chance not enough' },
  BoostNotEnd: { code: 200003, msg: 'boost not end' },
  BalanceNotEnough:{ code: 300001, msg: 'balance not enough' },
  TradeWithdrawFail: { code: 400001, msg: 'Withdraw fail, please re-try.' },
});


const RedisKeyFormat = Object.freeze({
  EmailLimit: 'meetcoin:email:limit:%s',
  EmailCode: 'meetcoin:email:code:%s',
  UserCache: 'meetcoin:user:%s',
  UserToken: 'meetcoin:user:access_token:%s',
  UnreadChat: 'meetcoin:chat:unread:set:%s',
  UnreadMessage: 'meetcoin:chat:unread:msg:sset:%s:%s',
  UnreadList: 'meetcoin:chat:unread:list:%s',
  SwipeServing: 'meetcoin:swipe:serving:%s',
  SwipeLike: 'meetcoin:swipe:like:%s:%s',
  SwipeSuperLike: 'meetcoin:swipe:superlike:%s:%s',
  SwipePreference: 'meetcoin:swipe:preference:%s',
  SwipeIgnore: 'meetcoin:swipe:ignore:set:%s',
  BoostChance: 'meetcoin:boost:chance:%s',
  FriendAssist: `meetcoin:task:assist:%s`,
});


const LoginEmailSchema = Object.freeze({
  Source: `Yeti <no-reply@yeti.social>`,
  Destination: {
    ToAddresses: [],
  },
  ReplyToAddresses: [],
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data: '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><link rel="stylesheet" type="text/css" id="u0" href="https://zh.rakko.tools/tools/129/lib/tinymce/skins/ui/oxide/content.min.css"><link rel="stylesheet" type="text/css" id="u1" href="https://zh.rakko.tools/tools/129/lib/tinymce/skins/content/default/content.min.css"></head><body id="tinymce" class="mce-content-body" data-id="content" contenteditable="true" spellcheck="false"><div style="border-top: 3px solid #8DCCFF;" data-mce-style="border-top: 3px solid #8DCCFF;"><p><img src="https://yeti-prd.s3.ap-southeast-1.amazonaws.com/resource/yeti.png" alt="" width="78" height="28" data-mce-src="https://yeti-prd.s3.ap-southeast-1.amazonaws.com/resource/yeti.png"></p><div>Your Yeti login code</div><p><span style="font-size: 18pt;" data-mce-style="font-size: 18pt;"><strong>#code#</strong></span></p><div><span style="font-size: 12pt;" data-mce-style="font-size: 12pt;">This is a one-time code that expires in 10 minutes.</span></div><div><span style="font-size: 12pt;" data-mce-style="font-size: 12pt;">Do not share your code with anyone. The Yeti team will never ask for it.</span></div><div><br></div><div><span style="color: #808080; font-size: 10pt;" data-mce-style="color: #808080; font-size: 10pt;">If you didn\'t attempt to sign up but received this email, apologies and please ignore.</span></div><div><br></div><div>Yeti</div></div></body></html>',
      },
    },
    Subject: {
      Charset: 'UTF-8',
      Data: 'Yeti Login Code',
    },
  },
});

const UserConfig = Object.freeze({
  DeleteStatus: Object.freeze({
    Deleted:1,
    Normal:0,
  }),
  BannedStatus: Object.freeze({
    Banned:1,
    Normal:0,
  }),
  EmailPerHour: 10,
});

const ModerationConfig = Object.freeze({
  PunishStatus: Object.freeze({
    Punished:1,
    Normal:0
  }),
  ImageDetect: Object.freeze({
    DetectConfidence: 50,
    IgnoreLabels:[
      'Female Swimwear Or Underwear',
      'Male Swimwear Or Underwear',
      'Tobacco Products',
      'Smoking',
      'Drinking',
      'Alcoholic Beverages',
      'Suggestive',
    ],
    S3ImagePrefix:'/photo',
  })
});

const SwipeConfig = Object.freeze({
  // FreeLike: 10,
  // LikeCost: 1,
  // SuperLikeCost: 1,
  RequestStatus: Object.freeze({
    Pending: 0,
    Accept: 1,
    Reject: 2,
    Ignore: 3,
  }),
  SuperLike: Object.freeze({
    SenderReward: 50,
    ReceiverReward: 100,
    Consume: 100,
  }),
  Like: Object.freeze({
    SenderReward: 10,
    ReceiverReward: 10,
  }),
  Boost: Object.freeze({
    ConsumerScore: 500,
    BoostDuration: 30 * 60* 1000,
    BoostAction: Object.freeze({
      Earn:1,
      Consume:2,
    }),
    ConsumeFlag: Object.freeze({
      Chance: 0,
      Score: 1,
    })
  })
});


const WalletConfig = Object.freeze({
  AmountType: Object.freeze({
    Score: 1,
    USDT: 2,
    DOGE: 3,
  }),
  ItemType: Object.freeze({
    SuperLikeCost: 1,
    SwipeRequest: 2,
    Swap:3,
    WithDraw:4,
    BoostPurchase: 5,
    SignInTask:6,
    AssistTask:7,
    ReferralReward: 8,
    ReferralCommission: 9,
    ReportPunish: 10,
  }),
  SwapRate: Object.freeze({
    Score2USDT: 20000
  }),
  CommissionRate: 0.1,
})

const ExchangeConfig = Object.freeze({
  ActiveStatus: Object.freeze({
    ACTIVED: 1,
    EXPIRED: 0,
  }),
})

const OrderConfig = Object.freeze({
  OrderStatus:Object.freeze({
    INIT: 0,
    PENDING: 1,
    COMPLETED: 2,
    CANCELED: 3,
    FAIL: 4,
    ABNORMAL: 5,
  })
});

const TradeRewardConfig = Object.freeze({
  PageSize: 15,
  TaskLink: 'https://bingx.com/spot',
  TradeOrderStatus: {
    Enable: 1,
    Pending: 2,
  },
  TransType: {
    Add: 1,
    Minus: 2,
  },
  ActionType: {
    CommissionReward: 1,
    Withdraw: 2,
    OfferReward: 3,
  },
  TransSymbol: {
    1: '+',
    2: '-',
  },
})

const TradeWithdrawAmountConfig = Object.freeze({
  OrderState: {
    RemainDependent: 1,     // 档位提现余额依赖
    PreAmountDependent: 2,  // 档位提现前置依赖
  },
  GeneralCountryName: 'GENERAL',  // withdraw_config中提现档位通用配置的country字段值
});

const TaskConfig = Object.freeze({
  SignReward:[
    { day: 1, reward_num: 100, },
    { day: 2, reward_num: 200, },
    { day: 3, reward_num: 300, },
    { day: 4, reward_num: 500, },
    { day: 5, reward_num: 800, },
    { day: 6, reward_num: 1000, },
    { day: 7, reward_num: 1500, },
  ],
  MysteryBox:[
    {
      box_type: 1,
      rewards:[
        { reward_type:1, reward_num:1000 },
        { reward_type:2, reward_num:5 },
        { reward_type:3, reward_num:1 }
      ],
      require_num: 3,
      assisted_num: 12,
    },
  ],
  MysteryBoxRewardType:{
    Score:1,
    Doge:2,
    SuperLike: 3,
  }
});


const ReferralConfig = Object.freeze({
  RewardNum: 500,
  MaxInvited: 40,
  MaxReward: 200000,
})


module.exports = {
  WHITE_API,
  ACCOUNT_SOURCE,
  BizErrorCode,
  RedisKeyFormat,
  UserConfig,
  LoginEmailSchema,
  ModerationConfig,
  SwipeConfig,
  WalletConfig,
  ExchangeConfig,
  OrderConfig,
  TradeRewardConfig,
  TradeWithdrawAmountConfig,
  TaskConfig,
  ReferralConfig,
}