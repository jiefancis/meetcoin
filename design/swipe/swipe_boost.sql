CREATE TABLE IF NOT EXISTS "swipe_boost" (
    id serial PRIMARY KEY,
    user_id UUID NOT NULL,
    action SMALLINT NOT NULL,
    chance_num INTEGER NOT NULL,
    consume_flag SMALLINT NOT NULL,
    order_id VARCHAR(32),
    create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "swipe_boost" is 'Boost记录表';
CREATE INDEX idx_swipe_boost_user ON "swipe_boost"("user_id");

COMMENT ON COLUMN "swipe_boost".id is '主键ID';
COMMENT ON COLUMN "swipe_boost".user_id is '用户ID';
COMMENT ON COLUMN "swipe_boost".action is '操作类型: 1: 获得机会，2: 消耗机会';
COMMENT ON COLUMN "swipe_boost".chance_num is '机会数量';
COMMENT ON COLUMN "swipe_boost".consume_flag is '操作来源: 1: 普通机会, 2: Vip机会';
COMMENT ON COLUMN "swipe_boost".order_id is '相关订单ID';
COMMENT ON COLUMN "swipe_boost".create_ts is '创建时间';
