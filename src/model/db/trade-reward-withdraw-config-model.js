module.exports = (sequelize, DateTypes) => {
  const { STRING, INTEGER, ARRAY, JSON } = DateTypes;
  const model = sequelize.define('trade_reward_withdraw_config', {
    platform: { type: STRING },
    country: { type: STRING },
    amount: { type: ARRAY(JSON) },
    order: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'trade_reward_withdraw_config',
  });
  model.removeAttribute('id');
  return model;
};
