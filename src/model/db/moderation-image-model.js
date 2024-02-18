module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER } = DataTypes;
  return sequelize.define('moderation_image', {
    id: { type: INTEGER, autoIncrement:true, primaryKey: true },
    user_id: { type: STRING },
    image_url: { type: STRING },
    s3_url: { type: STRING },
    rek_labels: { type: STRING },
    punish: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'moderation_image',
  });
};
