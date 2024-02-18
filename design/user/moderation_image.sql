CREATE TABLE IF NOT EXISTS "moderation_image" (
    id serial NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    image_url VARCHAR(512) NOT NULL DEFAULT '',
    s3_url VARCHAR(512) NOT NULL DEFAULT '',
    rek_labels JSON NOT NULL,
    punish SMALLINT NOT NULL DEFAULT 0,
    create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
    update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "moderation_image" is '图片审核敏感信息表';

COMMENT ON COLUMN "moderation_image".id is '主键ID';
COMMENT ON COLUMN "moderation_image".user_id is '用户ID';
COMMENT ON COLUMN "moderation_image".image_url is '图片链接';
COMMENT ON COLUMN "moderation_image".s3_url is '图片S3链接';
COMMENT ON COLUMN "moderation_image".rek_labels is '是否删除, 默认0, 0:未删除 1:已删除';
COMMENT ON COLUMN "moderation_image".punish is '是否惩罚 0:否 1:是';
COMMENT ON COLUMN "moderation_image".punish_ts is '惩罚时间';
COMMENT ON COLUMN "moderation_image".create_ts is '创建时间';
COMMENT ON COLUMN "moderation_image".update_ts is '更新时间';
