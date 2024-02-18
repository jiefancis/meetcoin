module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER } = DataTypes;
  return sequelize.define('block', {
    id: { type: INTEGER, autoIncrement:true, primaryKey: true },
    user_id: { type: STRING(128) },
    block_user_id: { type: STRING(128) },
    deleted: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true, // 表中字段映射到数据库时，使用下划线，在js中还是驼峰属性
    tableName: 'block',
  });
};
