CREATE TABLE IF NOT EXISTS "trade_reward_order" (
  "order_id" BIGINT PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "order_state" SMALLINT NOT NULL DEFAULT 1,
  "order_amount" int4 NOT NULL,
  uid VARCHAR(256) NOT NULL,
  country VARCHAR(8) NOT NULL,
  fail_code SMALLINT,
  "account" varchar(512) NOT NULL,
  "deleted" int NOT NULL DEFAULT 0,
  "create_ts" BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  "update_ts" BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);

COMMENT ON TABLE "trade_reward_order" is 'trade活动订单表';
CREATE INDEX idx_trade_reward_order_user_id ON "trade_reward_order"("user_id", "order_state", "deleted");
CREATE INDEX idx_trade_reward_order_uid ON "trade_reward_order"("uid");

COMMENT ON COLUMN "trade_reward_order"."order_id" is '订单ID，唯一性 (雪花ID)';
COMMENT ON COLUMN "trade_reward_order"."user_id" is '账户ID';
COMMENT ON COLUMN "trade_reward_order"."order_state" is '交易状态 0: Init 1: Pending 2: Completed 4: Canceled 5: abnormal';
COMMENT ON COLUMN "trade_reward_order"."uid" is 'bingX id';
COMMENT ON COLUMN "trade_reward_order"."country" is '下单时的ip country代号';
COMMENT ON COLUMN "trade_reward_order"."fail_code" is '如果订单失败 失败原因';
COMMENT ON COLUMN "trade_reward_order"."account" is 'bingX账号信息 邮箱/电话';
COMMENT ON COLUMN "trade_reward_order"."deleted" is '是否删除 0:未删除 1:已删除';
COMMENT ON COLUMN "trade_reward_order"."create_ts" is '创建时间';
COMMENT ON COLUMN "trade_reward_order"."update_ts" is '更新时间';
