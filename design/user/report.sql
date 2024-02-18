CREATE TABLE IF NOT EXISTS "report" (
  id serial NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  violator_id UUID NOT NULL,
  reason VARCHAR(32) NOT NULL,
  content VARCHAR(250) NOT NULL,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "report" is '举报表';

COMMENT ON COLUMN "report".id is '主键userId';
COMMENT ON COLUMN "report".user_id is '举报人ID';
COMMENT ON COLUMN "report".violator_id is '被举报人ID';
COMMENT ON COLUMN "report".reason is '举报类型';
COMMENT ON COLUMN "report".content is '举报原因';
COMMENT ON COLUMN "report".create_ts is '记录创建时间';
COMMENT ON COLUMN "report".update_ts is '记录更新时间';