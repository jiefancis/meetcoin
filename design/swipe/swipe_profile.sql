CREATE TABLE IF NOT EXISTS "swipe_profile" (
  user_id VARCHAR(128) NOT NULL PRIMARY KEY,
  gender INTEGER,
  birthday_ts BIGINT NOT NULL DEFAULT 0,
  country_code VARCHAR(16) NOT NULL DEFAULT '',
  like_cnt INTEGER NOT NULL DEFAULT 0,
  dislike_cnt INTEGER NOT NULL DEFAULT 0,
  online_status INTEGER NOT NULL DEFAULT 0,
  boost_end_ts BIGINT NOT NULL DEFAULT 0,
  deleted SMALLINT NOT NULL DEFAULT 0,
  banned SMALLINT NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "swipe_profile" is 'swipe资料表';

COMMENT ON COLUMN "swipe_profile".user_id is '用户ID';
COMMENT ON COLUMN "swipe_profile".gender is '用户性别 1:Male 2:Female 3:NoBinary';
COMMENT ON COLUMN "swipe_profile".birthday_ts is '生日时间戳';
COMMENT ON COLUMN "swipe_profile".country_code is '国家代码';
COMMENT ON COLUMN "swipe_profile".like_cnt is '右滑数量';
COMMENT ON COLUMN "swipe_profile".dislike_cnt is '左滑数量';
COMMENT ON COLUMN "swipe_profile".online_status is '在线状态 0:离线 1:在线';
COMMENT ON COLUMN "swipe_profile".boost_end_ts is 'Boost 结束时间';
COMMENT ON COLUMN "swipe_profile".deleted is '删除状态: 0:未删除 1:已删除';
COMMENT ON COLUMN "swipe_profile".banned is '封禁状态: 0:未封禁 1:已封禁';
COMMENT ON COLUMN "swipe_profile".create_ts is '创建时间';
COMMENT ON COLUMN "swipe_profile".update_ts is '修改时间';
