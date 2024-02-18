CREATE TABLE IF NOT EXISTS task_friend_assist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  ip VARCHAR(32) NOT NULL,
  box_type int4 NOT NULL,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "task_friend_assist" is '签到表';
CREATE INDEX idx_task_friend_assist_user_ip on "task_friend_assist"("user_id","ip");
CREATE UNIQUE INDEX uk_task_friend_assist_ubi ON "task_friend_assist" ("user_id","box_type","ip");

COMMENT ON COLUMN "task_friend_assist".id is '自增主键ID';
COMMENT ON COLUMN "task_friend_assist".user_id is '用户ID';
COMMENT ON COLUMN "task_friend_assist".ip is '助力好友IP';
COMMENT ON COLUMN "task_friend_assist".box_type is '助力宝箱类型';
COMMENT ON COLUMN "task_friend_assist".create_ts is '记录创建时间';

