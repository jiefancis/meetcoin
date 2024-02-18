CREATE TABLE IF NOT EXISTS device (
  user_id VARCHAR(128) NOT NULL PRIMARY KEY,
  device_id VARCHAR(512),
  device_type VARCHAR(32),
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
ALTER TABLE device COMMENT '用户设备表';

COMMENT ON COLUMN "device".user_id is '主键userId';
COMMENT ON COLUMN "device".device_id is '设备ID';
COMMENT ON COLUMN "device".device_type is '设备类型';
COMMENT ON COLUMN "device".create_ts is '记录创建时间';
COMMENT ON COLUMN "device".update_ts is '记录更新时间';