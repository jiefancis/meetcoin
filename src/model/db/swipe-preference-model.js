module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, JSON } = DataTypes;
  return sequelize.define('swipe_preference', {
    user_id: { type: STRING, primaryKey: true },
    age_upper: { type: INTEGER },
    age_lower: { type: INTEGER },
    genders: { type:JSON },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'swipe_preference',
  });
};
