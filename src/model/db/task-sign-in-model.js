module.exports = (sequelize, DateTypes) => {
  const { INTEGER, STRING, UUID, DATE } = DateTypes;
  return sequelize.define('task_sign_in', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: UUID, },
    day: { type: INTEGER },
    sign_date: { type: DATE },
    gold_reward: { type: INTEGER },
    version: { type: STRING },
    platform: { type: STRING },
    country: { type: STRING },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'task_sign_in',
  });
};
