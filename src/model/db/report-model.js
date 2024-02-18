module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER } = DataTypes;
  return sequelize.define('report', {
    id: { type: INTEGER, autoIncrement:true, primaryKey: true },
    user_id: { type: STRING(128) },
    violator_id: { type: STRING(128) },
    reason: { type: STRING },
    content: { type: STRING },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true, // 模型中的那些数据字段都转成下划线
    tableName: 'report', // 表名
  });
};
