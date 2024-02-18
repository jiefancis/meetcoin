CREATE TABLE IF NOT EXISTS "trade_reward_manual_info" (
  user_id UUID NOT NULL PRIMARY KEY,
  exchange_name VARCHAR(128),
  uid VARCHAR(512),
  email TEXT,
  phone TEXT,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "trade_reward_manual_info" is 'trade活动手动输入提现信息记录表';

COMMENT ON COLUMN "trade_reward_manual_info".user_id is '用户id';
COMMENT ON COLUMN "trade_reward_manual_info".uid is '用户交易所账号uid';
COMMENT ON COLUMN "trade_reward_manual_info".exchange_name is '信息所属交易所';
COMMENT ON COLUMN "trade_reward_manual_info".email is '首次提现的邮箱';
COMMENT ON COLUMN "trade_reward_manual_info".phone is '首次提现的电话';
COMMENT ON COLUMN "trade_reward_manual_info".create_ts is '创建时间';
