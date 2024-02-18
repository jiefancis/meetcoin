module.exports = (sequelize, DateTypes) => {
  const { INTEGER, UUID, DATE } = DateTypes;
  return sequelize.define('referral', {
    id: { type: UUID, primaryKey: true, autoIncrement: true },
    invite_id: { type: UUID, require: true },
    reward_num: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'referral',
  });
};
