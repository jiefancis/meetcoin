module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER, BIGINT } = DataTypes;
  return sequelize.define('swipe_request', {
    id: { type: INTEGER, primaryKey: true, autoIncrement:true },
    sender: { type: STRING, require: true },
    receiver: { type: STRING, require: true },
    status: { type: INTEGER },
    super_like: { type: INTEGER },
    request_ts: { type: INTEGER },
    banned: { type: INTEGER},
    deleted: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'swipe_request',
  });
};
