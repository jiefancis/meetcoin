const model = require('../db/index');
const { ExchangeConfig } = require('../../config/constants');

async function FindExchanges(platform, ipCountry){
  return model.exchange.findAll({
    where: {
      platform,
      country: ipCountry,
      exchange_status: ExchangeConfig.ActiveStatus.ACTIVED,
    },
    order: [['rank', 'ASC']],
  });
}


module.exports = {
  FindExchanges,
}