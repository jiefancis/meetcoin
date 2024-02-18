module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, JSON } = DataTypes;
  return sequelize.define('user', {
    id: { type: sequelize.Sequelize.UUID, defaultValue: sequelize.Sequelize.UUIDV4, primaryKey: true },
    email: { type: STRING(255) },
    third_account_id: { type: STRING(128) },
    third_account_source: { type: INTEGER },
    snap_chat_id: { type: STRING(128) },
    user_name: { type: STRING(128) },
    profile_img_url: { type: STRING(64) },
    gender: { type: INTEGER },
    birthday: { type: STRING(64) },
    display_age: { type: INTEGER },
    country_code: { type: STRING(8) },
    bio: {type: STRING(1024)},
    photos: { type: JSON },
    deleted: { type: INTEGER },
    banned: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'user',
  });
};
