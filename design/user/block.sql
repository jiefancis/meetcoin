CREATE TABLE IF NOT EXISTS "block" (
  id serial PRIMARY KEY,
  user_id UUID NOT NULL,
  block_user_id UUID NOT NULL,
  deleted SMALLINT NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "block" is '黑名单表';

COMMENT ON COLUMN "block".id is '主键userId';
COMMENT ON COLUMN "block".user_id is '用户ID';
COMMENT ON COLUMN "block".block_user_id is '拉黑人的ID';
COMMENT ON COLUMN "block".deleted is '是否删除 0:否 1:是';
COMMENT ON COLUMN "block".create_ts is '创建时间';
COMMENT ON COLUMN "block".update_ts is '修改时间';