module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, DECIMAL } = DataTypes;
  return sequelize.define('wallet', {
    id: { type: STRING(512), primaryKey: true },
    user_id: { type: STRING(512), require: true },
    coin_num: { type: INTEGER },
    usdt_num: { type: DECIMAL(19, 8) },
    doge_num: { type: DECIMAL(19, 8) },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'wallet',
  });
};
