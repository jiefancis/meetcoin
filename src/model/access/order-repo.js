const model = require('../db/index');
const { GenId } = require('../../lib/common-lib/lib/tools/snowflake');
const { OrderConfig } = require('../../config/constants');

async function FindBoostProduct(){
  return model.product.findAll({
    where:{ category: 1 }
  });
}


async function CreateExchangeOrder(data, transaction){
  if (!data) return null;
  const orderId = GenId();
  await model.exchange_order.create({
    order_id: orderId,
    user_id: data.user_id,
    order_state: OrderConfig.OrderStatus.PENDING,
    order_amount: data.order_amount,
    order_coin_type: data.order_coin_type,
    exchange_name: data.exchange_name,
    phone_country: data.phone_country,
    phone_number: data.phone_number,
    email: data.email,
    uid: data.uid,
    country: data.country,
    platform: data.platform,
  }, { transaction: transaction });
  return orderId;
}

async function FindAllExchangeOrder(userId){
  return model.exchange_order.findAll({
    where:{
      user_id:userId,
    },
    order: [['create_ts', 'DESC']],
  });
}

async function FindExchangeOrder(userId, offset, limit){
  return model.exchange_order.findAndCountAll({
    where:{
      user_id:userId,
    },
    order: [['create_ts', 'DESC']],
    offset: offset,
    limit: limit
  });
}





module.exports = {
  FindBoostProduct,
  CreateExchangeOrder,
  FindAllExchangeOrder,
  FindExchangeOrder,
}