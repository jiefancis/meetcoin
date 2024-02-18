module.exports = (sequelize, DateTypes) => {
  const { STRING, INTEGER, JSON, FLOAT } = DateTypes;
  const model = sequelize.define('trade_reward_activity', {
    platform: { type: STRING },
    country: { type: STRING },
    act_id: { type: INTEGER },
    offers: { type: JSON },
    active: { type: INTEGER },
    tutorial_links: { type: JSON },
    commission_rate: { type: FLOAT },
    reward_limit: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'trade_reward_activity',
  });
  model.removeAttribute('id');
  return model;
};
