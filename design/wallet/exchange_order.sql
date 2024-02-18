CREATE TABLE IF NOT EXISTS "exchange_order" (
  order_id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL,
  order_state SMALLINT NOT NULL DEFAULT 0,
  order_amount DECIMAL(19,8),
  order_coin_type VARCHAR(16) NOT NULL DEFAULT 'USDT',
  exchange_name VARCHAR(32) NOT NULL,
  phone_country VARCHAR(8),
  phone_number VARCHAR(64),
  email VARCHAR(128),
  uid VARCHAR(256),
  country VARCHAR(8),
  platform VARCHAR(32),
  deleted int NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);

COMMENT ON COLUMN "exchange_order"."order_id" is '订单ID，唯一性 (雪花ID)';
COMMENT ON COLUMN "exchange_order"."user_id" is '账户ID';
COMMENT ON COLUMN "exchange_order"."order_state" is '交易状态 0: Init 1: Pending 2: Completed 4: Canceled 5: Abnormal';
COMMENT ON COLUMN "exchange_order"."order_amount" is '订单金额';
COMMENT ON COLUMN "exchange_order"."order_coin_type" is '订单币类型 USDT';
COMMENT ON COLUMN "exchange_order"."exchange_name" is '交易所名称';
COMMENT ON COLUMN "exchange_order"."phone_country" is '电话号码国家';
COMMENT ON COLUMN "exchange_order"."phone_number" is '电话号码';
COMMENT ON COLUMN "exchange_order"."email" is '邮件地址';
COMMENT ON COLUMN "exchange_order"."uid" is '下单用户交易所账号uid';
COMMENT ON COLUMN "exchange_order"."country" is '下单用户的IP国家';
COMMENT ON COLUMN "exchange_order"."platform" is '下单用户的手机平台';
COMMENT ON COLUMN "exchange_order"."deleted" is '是否删除 0:未删除 1:已删除';
COMMENT ON COLUMN "exchange_order"."create_ts" is '创建时间';
COMMENT ON COLUMN "exchange_order"."update_ts" is '更新时间';
