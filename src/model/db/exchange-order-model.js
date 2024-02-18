module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, DECIMAL } = DataTypes;
  return sequelize.define('exchange_order', {
    order_id: { type: INTEGER, primaryKey: true },
    user_id: { type: sequelize.Sequelize.UUID, require: true },
    order_state: { type: INTEGER },
    order_amount: { type: DECIMAL(19, 8) },
    order_coin_type: { type: STRING(16) },
    exchange_name: { type: STRING(32) },
    phone_country: { type: STRING(8) },
    phone_number: { type: STRING(64) },
    email: { type: STRING(128) },
    uid: { type: STRING },
    platform: { type: INTEGER },
    country: { type: STRING },
    deleted: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'exchange_order',
  });
};
