module.exports = (sequelize, DateTypes) => {
  const { STRING, INTEGER, UUID } = DateTypes;
  return sequelize.define('trade_reward_manual_info', {
    user_id: { type: UUID, primaryKey: true },
    uid: { type: STRING },
    exchange_name: { type: STRING },
    email: { type: STRING },
    phone: { type: STRING },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'trade_reward_manual_info',
  });
};
