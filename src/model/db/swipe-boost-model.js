module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, JSON } = DataTypes;
  return sequelize.define('swipe_boost', {
    id: { type: INTEGER, primaryKey: true, autoIncrement:true },
    user_id: { type: STRING },
    action: { type:INTEGER },
    chance_num: { type: INTEGER },
    consume_flag: { type: INTEGER },
    order_id: { type: STRING },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'swipe_boost',
  });
};
