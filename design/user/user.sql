CREATE SEQUENCE meetcoin_id_sequence
    INCREMENT 1
    MINVALUE 10000000
    MAXVALUE 99999999
    START 10000000;

CREATE TABLE IF NOT EXISTS "user" (
  id UUID NOT NULL PRIMARY KEY,
  handle int4 NOT NULL DEFAULT nextval('meetcoin_id_sequence'),
  email VARCHAR(255),
  third_account_id VARCHAR(512),
  third_account_source INT NOT NULL DEFAULT 0,
  snap_chat_id VARCHAR(512),
  user_name VARCHAR(128),
  profile_img_url VARCHAR(512),
  gender INTEGER,
  birthday VARCHAR(64),
  display_age INTEGER NOT NULL DEFAULT 0,
  country_code VARCHAR(16) NOT NULL DEFAULT '',
  bio VARCHAR(1024),
  photos JSON,
  deleted SMALLINT NOT NULL DEFAULT 0,
  banned SMALLINT NOT NULL DEFAULT 0,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "user" is '用户表';

COMMENT ON COLUMN "user".id is '用户ID';
COMMENT ON COLUMN "user".email is '用户邮箱';
COMMENT ON COLUMN "user".third_account_id is '第三方ID';
COMMENT ON COLUMN "user".third_account_source is '第三方登录来源 0Email 1Google 2Facebook 3Twitter 4Apple 5Snapchat';
COMMENT ON COLUMN "user".snap_chat_id is 'SnapChat ID';
COMMENT ON COLUMN "user".user_name is '用户昵称';
COMMENT ON COLUMN "user".profile_img_url is '头像链接';
COMMENT ON COLUMN "user".gender is '用户性别 1male 2female';
COMMENT ON COLUMN "user".birthday is '生日日期';
COMMENT ON COLUMN "user".display_age is '是否显示用户年龄';
COMMENT ON COLUMN "user".country_code is '国家编码 US/CN';
COMMENT ON COLUMN "user".bio is '用户简介';
COMMENT ON COLUMN "user".photos is '用户照片';
COMMENT ON COLUMN "user".deleted is '是否删除, 默认0, 0:未删除 1:已删除';
COMMENT ON COLUMN "user".banned is '是否封禁 默认0, 0正常，1封禁';
COMMENT ON COLUMN "user".create_ts is '记录创建时间';
COMMENT ON COLUMN "user".update_ts is '记录更新时间';