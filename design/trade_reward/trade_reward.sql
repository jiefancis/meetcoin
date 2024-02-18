CREATE TABLE IF NOT EXISTS "trade_reward" (
  user_id VARCHAR(64) NOT NULL PRIMARY KEY,
  uid VARCHAR(32) NOT NULL,
  remain numeric(12, 4) NOT NULL DEFAULT 0,
  exchange_trade_total numeric(12, 4) NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "trade_reward" is 'trade奖励余额记录';
CREATE INDEX idx_trade_reward_uid ON "trade_reward"("uid");

COMMENT ON COLUMN "trade_reward".user_id is '用户id 主键';
COMMENT ON COLUMN "trade_reward".uid is '用户bingX id';
COMMENT ON COLUMN "trade_reward".remain is '奖励余额';
COMMENT ON COLUMN "trade_reward".exchange_trade_total is '交易所交易总额';
COMMENT ON COLUMN "trade_reward".create_ts is '创建时间';
COMMENT ON COLUMN "trade_reward".update_ts is '更新时间';
