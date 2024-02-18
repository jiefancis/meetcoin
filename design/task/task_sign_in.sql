CREATE TABLE IF NOT EXISTS task_sign_in (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  day int4 NOT NULL DEFAULT 1,
  sign_date DATE NOT NULL,
  gold_reward int4 NOT NULL DEFAULT 0,
  version varchar(32),
  platform varchar(32),
  country varchar(32),
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "task_sign_in" is '签到表';
CREATE INDEX idx_user_date on "task_sign_in"("user_id","sign_date");

COMMENT ON COLUMN "task_sign_in".id is '自增主键ID';
COMMENT ON COLUMN "task_sign_in".user_id is '签到用户id';
COMMENT ON COLUMN "task_sign_in".day is '连续签到天数';
COMMENT ON COLUMN "task_sign_in".sign_date is '签到的当地日期YYYY-MM-DD';
COMMENT ON COLUMN "task_sign_in".gold_reward is '奖励金币数';
COMMENT ON COLUMN "task_sign_in".version is '版本';
COMMENT ON COLUMN "task_sign_in".platform is '平台';
COMMENT ON COLUMN "task_sign_in".country is '国家';
COMMENT ON COLUMN "task_sign_in".create_ts is '记录创建时间';

