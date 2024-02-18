module.exports = (sequelize, DateTypes) => {
  const { STRING, INTEGER } = DateTypes;
  return sequelize.define('referral_code', {
    id: { type: sequelize.Sequelize.UUID, primaryKey: true },
    referral_code: { type: STRING },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'referral_code',
  });
};
