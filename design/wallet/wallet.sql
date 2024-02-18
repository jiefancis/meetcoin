CREATE TABLE IF NOT EXISTS wallet (
  id VARCHAR(512) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  coin_num BIGINT NOT NULL DEFAULT 0,
  usdt_num NUMERIC(19, 8) NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "wallet" is '钱包表';


COMMENT ON COLUMN "wallet".id is '主键ID';
COMMENT ON COLUMN "wallet".user_id is '用户ID';
COMMENT ON COLUMN "wallet".coin_num is 'Meecoin 分数';
COMMENT ON COLUMN "wallet".usdt_num is 'USDT';
COMMENT ON COLUMN "wallet".create_ts is '创建时间';
COMMENT ON COLUMN "wallet".update_ts is '更新时间';

ALTER TABLE "wallet" ADD COLUMN doge_num INTEGER NOT NULL DEFAULT 0;
COMMENT ON COLUMN "wallet".doge_num is 'DOGE';