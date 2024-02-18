module.exports = (sequelize, DateTypes) => {
  const { INTEGER, STRING, FLOAT } = DateTypes;
  return sequelize.define('trade_reward_transaction', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: STRING },
    trans_type: { type: INTEGER },
    action_type: { type: INTEGER },
    amount: { type: FLOAT },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'trade_reward_transaction',
  });
};
