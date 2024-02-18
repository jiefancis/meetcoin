module.exports = (sequelize, DateTypes) => {
  const { STRING, INTEGER, FLOAT } = DateTypes;
  return sequelize.define('trade_reward', {
    user_id: { type: STRING, primaryKey: true },
    uid: { type: STRING },
    remain: { type: FLOAT },
    exchange_trade_total: { type: FLOAT },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'trade_reward',
  });
};
