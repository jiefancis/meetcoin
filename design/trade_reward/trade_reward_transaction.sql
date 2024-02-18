CREATE TABLE IF NOT EXISTS "trade_reward_transaction" (
  id serial primary key,
  user_id varchar(512) NOT NULL,
  trans_type SMALLINT NOT NULL,
  amount numeric(12, 4) NOT NULL,
  action_type SMALLINT NOT NULL,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "trade_reward_transaction" is 'trade奖励交易记录表';
CREATE INDEX idx_trade_transaction_action_type ON "trade_reward_transaction"("user_id", "action_type", "create_ts");
CREATE INDEX idx_trade_transaction_trans_type ON "trade_reward_transaction"("user_id", "trans_type");

COMMENT ON COLUMN "trade_reward_transaction".id is '主键ID';
COMMENT ON COLUMN "trade_reward_transaction".user_id is '用户ID';
COMMENT ON COLUMN "trade_reward_transaction".amount is '交易金额';
COMMENT ON COLUMN "trade_reward_transaction".trans_type is '交易动作 1增加 2消耗';
COMMENT ON COLUMN "trade_reward_transaction".action_type is '交易类型 1返佣奖励 2提现消耗 3offer奖励';
COMMENT ON COLUMN "trade_reward_transaction".create_ts is '创建时间';
