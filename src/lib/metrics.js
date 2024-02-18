
// ================================== 指标监测 ================================== 

const client = require('prom-client');
const env = process.env.RUN_ENV;

const ApiMetrics = new client.Histogram({
  name: 'meetcoin_api_histogram',
  help: 'meetcoin_api_histogram',
  labelNames: ['api', 'method', 'status', 'code', 'env'],
});

const ConsumerMetrics = new client.Counter({
  name: 'meetcoin_consumer_counter',
  help: 'meetcoin_consumer_counter',
  labelNames: ['event_type', 'env'],
});


function ObserveApi(ctx, seconds){
  try{
    const {url, method, status, body} = ctx;
    if(!url.startsWith('/meetcoin')) return;
    const labels = {
      api: url.split('?')[0],
      method: method, status: status,
      code: body ? body.code : status,
      env: env
    }
    ApiMetrics.observe(labels, seconds);
  } catch (error) {
    return false;
  }
}

function CountConsumeEvent(event_type){
  try{
    ConsumerMetrics.inc({ event_type, env });
  } catch (error) {
    return false;
  }
}


async function Metrics(){
  try {
    return client.register.metrics();
  } catch (err) {
    return ''
  }
}


module.exports = {
  ObserveApi,
  CountConsumeEvent,
  Metrics,
}