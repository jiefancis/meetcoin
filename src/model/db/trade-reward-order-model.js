module.exports = (sequelize, DateTypes) => {
  const { INTEGER, UUID, STRING } = DateTypes;
  return sequelize.define('trade_reward_order', {
    order_id: { type: INTEGER, primaryKey: true },
    user_id: { type: UUID },
    order_state: { type: INTEGER },
    order_amount: { type: INTEGER },
    uid: { type: STRING },
    country: { type: STRING },
    fail_code: { type: INTEGER },
    account: { type: STRING },
    deleted: { type: INTEGER },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'trade_reward_order',
  });
};
