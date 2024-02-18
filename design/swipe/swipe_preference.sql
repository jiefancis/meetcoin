CREATE TABLE IF NOT EXISTS swipe_preference (
  user_id VARCHAR(128) PRIMARY KEY,
  age_upper INTEGER NOT NULL DEFAULT 80,
  age_lower INTEGER NOT NULL DEFAULT 0,
  genders JSON,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "swipe_preference" is 'swipe偏好表';

COMMENT ON COLUMN "swipe_preference".user_id is '主键userId';
COMMENT ON COLUMN "swipe_preference".age_upper is '年龄上限';
COMMENT ON COLUMN "swipe_preference".age_lower is '年龄下限';
COMMENT ON COLUMN "swipe_preference".genders is '性别偏好';
COMMENT ON COLUMN "swipe_preference".create_ts is '创建时间';
COMMENT ON COLUMN "swipe_preference".update_ts is '修改时间';