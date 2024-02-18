CREATE TABLE IF NOT EXISTS "product" (
    product_id serial PRIMARY KEY,
    category INTEGER NOT NULL DEFAULT 0,
    price VARCHAR(32) NOT NULL DEFAULT '',
    boost_chance INTEGER NOT NULL DEFAULT 0,
    create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000),
    update_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);
COMMENT ON TABLE "product" is '产品表';

COMMENT ON COLUMN "product".product_id is '主键ID';
COMMENT ON COLUMN "product".category is '产品类别 1:Boost';
COMMENT ON COLUMN "product".price is '价格';
COMMENT ON COLUMN "product".boost_chance is 'Boost机会次数';
COMMENT ON COLUMN "product".create_ts is '创建时间';
COMMENT ON COLUMN "product".update_ts is '更新时间';


INSERT INTO "product" (product_id, category, price, boost_chance) VALUES (3001, 1, '500', 1);
INSERT INTO "product" (product_id, category, price, boost_chance) VALUES (3001, 1, '1800', 5);
INSERT INTO "product" (product_id, category, price, boost_chance) VALUES (3001, 1, '2800', 10);