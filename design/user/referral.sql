CREATE TABLE IF NOT EXISTS "referral" (
  id UUID NOT NULL PRIMARY KEY,
  invite_id UUID NOT NULL,
  reward_num int4 NOT NULL,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "referral" is '邀请记录表';

COMMENT ON COLUMN "referral".id is '被邀请者id';
COMMENT ON COLUMN "referral".invite_id is '邀请人id';
COMMENT ON COLUMN "referral".create_ts is '记录创建时间';
COMMENT ON COLUMN "referral".update_ts is '记录更新时间';