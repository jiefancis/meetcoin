module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER } = DataTypes;
  return sequelize.define('user_online', {
    user_id: { type: STRING(128), primaryKey: true },
    online_ts: { type: INTEGER },
    offline_ts: { type: INTEGER },
    engage_ts: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'user_online',
  });
};
