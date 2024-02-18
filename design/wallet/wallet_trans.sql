CREATE TABLE IF NOT EXISTS wallet_trans (
  id serial NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  amount_type INTEGER NOT NULL DEFAULT 0,
  amount DECIMAL(19,8) NOT NULL DEFAULT 0,
  balance DECIMAL(19,8) NOT NULL DEFAULT 0,
  item_type INTEGER NOT NULL DEFAULT 0,
  item_id VARCHAR(512),
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "wallet" is '钱包交易表';

COMMENT ON COLUMN "wallet".id is '主键ID';
COMMENT ON COLUMN "wallet".user_id is '用户ID';
COMMENT ON COLUMN "wallet".amount_type is '交易类型 1: MeetCoin分数';
COMMENT ON COLUMN "wallet".amount is '交易数量';
COMMENT ON COLUMN "wallet".balance is '余额';
COMMENT ON COLUMN "wallet".item_type is '相关类型';
COMMENT ON COLUMN "wallet".item_id is '相关ID';
COMMENT ON COLUMN "wallet".create_ts is '创建时间';
COMMENT ON COLUMN "wallet".update_ts is '更新时间';