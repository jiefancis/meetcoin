module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, JSON } = DataTypes;
  return sequelize.define('swipe_profile', {
    user_id: { type: STRING, primaryKey: true },
    gender: { type: INTEGER },
    birthday_ts: { type: INTEGER },
    country_code: { type: STRING},
    like_cnt: { type: INTEGER },
    dislike_cnt: { type: INTEGER },
    online_status: { type: INTEGER },
    boost_end_ts: { type: INTEGER },
    deleted: { type: INTEGER },
    banned: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'swipe_profile',
  });
};
