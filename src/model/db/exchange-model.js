module.exports = (sequelize, DateTypes) => {
  const { INTEGER, STRING } = DateTypes;
  const model = sequelize.define('exchange', {
    exchange_name: { type: STRING },
    country: { type: STRING },
    platform: { type: STRING },
    exchange_banner_url: { type: STRING },
    exchange_status: { type: INTEGER },
    exchange_deep_link: { type: STRING },
    exchange_tutorial_link: { type: STRING },
    click_id_required: { type: INTEGER },
    rank: { type: INTEGER },
    uid_required: { type: INTEGER },
    uid_help_link: { type: STRING },
    create_ts: { type: INTEGER },
    update_ts: { type: INTEGER },
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'exchange',
  });
  model.removeAttribute('id');
  return model;
};
