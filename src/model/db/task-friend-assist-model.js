module.exports = (sequelize, DateTypes) => {
  const { INTEGER, STRING, UUID, DATE } = DateTypes;
  return sequelize.define('task_friend_assist', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: UUID },
    ip: { type: INTEGER },
    box_type: { type: INTEGER },
    create_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'task_friend_assist',
  });
};
