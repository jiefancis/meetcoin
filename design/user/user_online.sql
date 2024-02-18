CREATE TABLE IF NOT EXISTS "user_online" (
  user_id VARCHAR(128) NOT NULL PRIMARY KEY,
  online_ts BIGINT NOT NULL DEFAULT 0,
  offline_ts BIGINT NOT NULL DEFAULT 0,
  engage_ts BIGINT NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "user_online" is '用户在线表';

COMMENT ON COLUMN "user_online".user_id is '用户ID';
COMMENT ON COLUMN "user_online".online_ts is '最后在线时间';
COMMENT ON COLUMN "user_online".offline_ts is '最后离线时间';
COMMENT ON COLUMN "user_online".engage_ts is '活跃时间';
COMMENT ON COLUMN "user_online".create_ts is '记录创建时间';
COMMENT ON COLUMN "user_online".update_ts is '记录更新时间';