const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { logger } = require('../../lib/common-lib/index');

const basename = path.basename(__filename);

// ===================== DATABASE CONFIG =====================
const sequelize = new Sequelize({
  host: process.env.MYSQL_HOST,
  // replace your database here
  database: process.env.POSTGRE_DATABASE,
  port: process.env.MYSQL_PORT,
  dialect: 'mysql', // 连接的数据库类型，mysql, postgres, sqlite and mysql
  username: process.env.POSTGRE_USER,
  password: process.env.POSTGRE_PASSWORD,
  logging: false, // logger.info.bind(logger)
  pool: { // 连接池配置
    max: 40,
    min: 0,
    idle: 10000,
  },
});

sequelize.query('select 1', { raw: true }).then(() => {
  logger.info(`connect database: ${process.env.POSTGRE_DATABASE}`);
});

const db = {
  sequelize,
  Sequelize,
  user: undefined,
  block: undefined,
  report: undefined,
  device: undefined,
  user_online: undefined,
  moderation_image: undefined,
  swipe_profile: undefined,
  swipe_preference: undefined,
  swipe_request: undefined,
  swipe_boost: undefined,
  product: undefined,
  wallet: undefined,
  wallet_trans: undefined,
  exchange: undefined,
  exchange_order: undefined,
  trade_reward: undefined,
  trade_reward_transaction: undefined,
  trade_reward_activity: undefined,
  trade_reward_order: undefined,
  trade_reward_withdraw_config: undefined,
  trade_reward_manual_info: undefined,
  task_sign_in: undefined,
  task_friend_assist: undefined,
  referral_code: undefined,
  referral: undefined,
};

// ===================== MODELS =====================
// 定义sequelize model命名规范为xxx-xxx-model.js
fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-8) === 'model.js'))
  .forEach((file) => {
    logger.debug(`load file: ${file}`);
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const model = require(path.join(__dirname, file))(sequelize, Sequelize);
    if (!model) {
      throw new Error(`model ${__dirname} loading fail`);
    }
    db[model.name] = model;
    logger.info(`load model: ${model.name}`);
  });

// #implement your db relations here
// ===================== EXPORT DATABASE =====================
module.exports = db;
