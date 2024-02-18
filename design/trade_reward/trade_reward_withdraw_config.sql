CREATE TABLE IF NOT EXISTS "trade_reward_withdraw_config" (
  platform VARCHAR(64) NOT NULL,
  country VARCHAR(32) NOT NULL DEFAULT 'GENERAL',
  amount JSONB NOT NULL,
  "order" SMALLINT NOT NULL DEFAULT 1,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  PRIMARY KEY ("platform","country")
);
COMMENT ON TABLE "trade_reward_withdraw_config" is '提现配置表';

COMMENT ON COLUMN "trade_reward_withdraw_config".platform is '配置所属平台';
COMMENT ON COLUMN "trade_reward_withdraw_config".country is '配置所属国家 GENERAL通用配置';
COMMENT ON COLUMN "trade_reward_withdraw_config".amount is '提现档位 json字段 amount premium repeat false';
COMMENT ON COLUMN "trade_reward_withdraw_config".order is '提现是否按顺序 1余额依赖 2前序依赖';
COMMENT ON COLUMN "trade_reward_withdraw_config".create_ts is '创建时间';
COMMENT ON COLUMN "trade_reward_withdraw_config".update_ts is '更新时间';

INSERT INTO "public"."trade_reward_withdraw_config" ("platform", "country", "amount", "order", "create_ts", "update_ts") VALUES
('android', 'GENERAL', '[{"amount": 1, "repeated": 0, "false_level": 0}, {"amount": 10, "repeated": 0, "false_level": 0}, {"amount": 50, "repeated": 0, "false_level": 0}, {"amount": 100, "repeated": 1, "false_level": 0}, {"amount": 500, "repeated": 1, "false_level": 0}, {"amount": 1000, "repeated": 0, "false_level": 1}]', 2, 1691487308190, 1691487308190);
