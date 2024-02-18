module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, DECIMAL } = DataTypes;
  return sequelize.define('wallet_trans', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: STRING(512), require: true },
    amount: { type: DECIMAL(19, 8) },
    amount_type: { type: INTEGER },
    balance: { type: DECIMAL(19, 8) },
    item_id: { type: STRING(512) },
    item_type: { type: INTEGER },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'wallet_trans',
  });
};
