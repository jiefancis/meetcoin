const AWS = require('aws-sdk');
const logger = require('./logger');
const session = require("./session");

module.exports = SNS;

function SNS(config) {
  AWS.config.update(config);
  this.sns = new AWS.SNS();
}

SNS.prototype.publish = async function(topicArn, payload) {
  if (!payload.request_id) {
    payload.request_id = session.getStore();
  }
  logger.info(`sns publish payload: `, payload);
  const message = {
    Message: JSON.stringify(payload),
    TopicArn: topicArn
  }
  await this.sns.publish(message, function (err, data) {
    if (err) {
      logger.error("SNS Push Failed:%o", err.stack);
      throw err;
    } else {
      logger.debug(`sns publish MessageId: `, data.MessageId);
      return data;
    }
  });
}
