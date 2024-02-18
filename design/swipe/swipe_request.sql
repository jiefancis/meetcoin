CREATE TABLE IF NOT EXISTS "swipe_request" (
  id serial PRIMARY KEY,
  sender VARCHAR(128) NOT NULL,
  receiver VARCHAR(128) NOT NULL,
  super_like SMALLINT NOT NULL DEFAULT 0,
  status SMALLINT NOT NULL DEFAULT 0,
  request_ts BIGINT NOT NULL DEFAULT 0,
  deleted SMALLINT NOT NULL DEFAULT 0,
  banned SMALLINT NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
CREATE UNIQUE INDEX uk_friend_request ON swipe_request(receiver, sender);

COMMENT ON TABLE "swipe_request" is 'swipe请求表';

COMMENT ON COLUMN "swipe_request".id is '主键ID';
COMMENT ON COLUMN "swipe_request".sender is '发送者ID';
COMMENT ON COLUMN "swipe_request".receiver is '接收者ID';
COMMENT ON COLUMN "swipe_request".super_like is '是否是超级请求 0:不是 1:是';
COMMENT ON COLUMN "swipe_request".status is '请求状态 0:Pending 1:Accept 2:Reject 3:Ignore';
COMMENT ON COLUMN "swipe_request".request_ts is '发起请求的时间';
COMMENT ON COLUMN "swipe_request".deleted is '删除状态: 0:未删除 1:已删除';
COMMENT ON COLUMN "swipe_request".banned is '封禁状态: 0:未封禁 1:已封禁';
COMMENT ON COLUMN "swipe_request".create_ts is '创建时间';
COMMENT ON COLUMN "swipe_request".update_ts is '修改时间';