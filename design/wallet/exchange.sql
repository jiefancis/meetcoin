CREATE TABLE IF NOT EXISTS "exchange" (
  exchange_name VARCHAR(64) NOT NULL,
  country VARCHAR(32) NOT NULL,
  platform VARCHAR(32) NOT NULL,
  exchange_banner_url VARCHAR(256) NOT NULL DEFAULT '',
  exchange_status SMALLINT NOT NULL DEFAULT 0,
  exchange_tutorial_link VARCHAR(256) NOT NULL DEFAULT '',
  exchange_deep_link VARCHAR(256) NOT NULL DEFAULT '',
  click_id_required SMALLINT NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 1,
  uid_required SMALLINT NOT NULL DEFAULT 0,
  uid_help_link VARCHAR(256),
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
  PRIMARY KEY ("platform", "country", "exchange_name")
);
COMMENT ON TABLE "exchange" is '交易所V2';

COMMENT ON COLUMN "exchange".exchange_name is '交易所名称';
COMMENT ON COLUMN "exchange".country is '国家两字答谢编码';
COMMENT ON COLUMN "exchange".platform is '移动端平台 android/ios';
COMMENT ON COLUMN "exchange".exchange_banner_url is '交易所图片地址';
COMMENT ON COLUMN "exchange".exchange_status is '交易所状态';
COMMENT ON COLUMN "exchange".exchange_deep_link is '交易所安装链接';
COMMENT ON COLUMN "exchange".exchange_tutorial_link is '交易所教程链接';
COMMENT ON COLUMN "exchange".click_id_required is '是否需要在安装链接后拼接clickId 当前仅BingX为1';
COMMENT ON COLUMN "exchange".rank is '主键条件下交易所排名';
COMMENT ON COLUMN "exchange".uid_required is '提现是否需要填写uid';
COMMENT ON COLUMN "exchange".uid_help_link is '查询uid教程链接';
COMMENT ON COLUMN "exchange".create_ts is '创建时间';
COMMENT ON COLUMN "exchange".update_ts is '更新时间';


INSERT INTO "public"."exchange" ("exchange_name", "country", "platform", "exchange_banner_url", "exchange_status", "exchange_tutorial_link", "exchange_deep_link", "click_id_required", "rank", "uid_required", "uid_help_link", "create_ts", "update_ts") VALUES
('BingX', 'PK', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/en-us/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_pak', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'NG', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/en-us/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_ng', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'US', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/en-us/act/chanelActivity/SOM21DQX/?ch=witcoin_withdraw_us', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'MY', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/en-us/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_my', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'EG', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/ar-ar/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_eg', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'ZA', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/en-us/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_za', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'DE', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/de-de/act/chanelActivity/SOM21DQX/?ch=witcoin_withdraw_de', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'JP', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/ja-jp/act/chanelActivity/SOM21DQX/?ch=witcoin_withdraw_jp', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'NL', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/nl-nl/act/chanelActivity/SOM21DQX/?ch=witcoin_withdraw_nl', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'BR', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/pt-br/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_br', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'AR', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/es-es/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_ar', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'MX', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/es-es/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_mx', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'CO', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/es-es/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_co', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'QA', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/ar-ar/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_qat', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('OKX', 'TW', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('BingX', 'CL', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/es-es/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_chi', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'PT', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/pt-br/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_pt', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'AE', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/ar-ar/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_uae', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'SA', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/ar-ar/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_sa', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'ES', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/es-es/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_es', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'UA', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/uk-ua/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_ua', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'PH', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/en-us/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_ph', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'ID', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/id-id/act/chanelActivity/2XTLL62O/?ch=witcoin_withdraw_id', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('BingX', 'KR', 'android', 'https://prd-witcoin.s3.amazonaws.com/bingx.png', 1, 'https://witcoin.space/withdraw-bingx', 'https://bingx.com/en-us/act/chanelActivity/SOM21DQX/?ch=witcoin_withdraw_kr', 1, 1, 1, 'https://witcoin.space/bingx_uid', 1690870894885, 1690870894885),
('OKX', 'AU', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'HK', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'GB', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'TR', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'TH', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'RU', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'IQ', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'VN', 'ios', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_ios_517288', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'TW', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'AU', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'HK', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'GB', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'TR', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'TH', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'RU', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'IQ', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716),
('OKX', 'VN', 'android', 'https://prd-witcoin.s3.amazonaws.com/okx.png', 1, 'https://witcoin.space/withdraw-okx', 'https://www.okx.com/join?channelid=ACE_aos_517289', 0, 1, 1, 'https://witcoin.space/okx_uid', 1690340968716, 1690340968716);

UPDATE "exchange" SET exchange_tutorial_link='https://yeti.social/withdraw-okx' WHERE exchange_name='OKX';
UPDATE "exchange" SET exchange_tutorial_link='https://yeti.social/withdraw-bingx' WHERE exchange_name='BingX';