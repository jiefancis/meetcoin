module.exports = (sequelize, DataTypes) => {
  const device = sequelize.define('device', {
    user_id: { type: DataTypes.STRING, primaryKey: true },
    device_id: { type: DataTypes.STRING },
    device_type: { type: DataTypes.STRING },
    create_ts: { type: DataTypes.INTEGER },
    update_ts: { type: DataTypes.INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'device',
  });
  return device;
}