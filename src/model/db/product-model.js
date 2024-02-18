module.exports = (sequelize, DataTypes) => {
  const { STRING, INTEGER } = DataTypes;
  return sequelize.define('product', {
    product_id: { type: INTEGER, primaryKey: true },
    category: { type: INTEGER },
    price: { type: STRING(32) },
    boost_chance: { type: INTEGER },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'product',
  });
};
