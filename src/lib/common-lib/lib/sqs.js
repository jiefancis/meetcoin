const AWS = require('aws-sdk');
const logger = require('./logger');
const { v4: uuid } = require('uuid');
const session = require('./session');
const Consumer = require('sqs-consumer');

module.exports = SQS;

function SQS(config) {
  AWS.config.update(config);
  this.sqs = new AWS.SQS();
}

SQS.prototype.sendMessage = async function(queueURL, payload, callback) {
  try {
    if (!payload.request_id) {
      payload.request_id = session.getStore();
    }
    const message = {
      MessageBody: JSON.stringify(payload),
      QueueUrl: queueURL,
    };
    await this.sqs.sendMessage(message, (error, data) => {
      if (error) {
        throw new Error(error.message);
      }
      if (callback) {
        callback(data);
      }
    });
    return true;
  } catch (e) {
    logger.error(`send message occur exception payload:${payload}`, e);
    return false;
  }
}

SQS.prototype.addConsumer = async function(queueURL, callback) {
  if (!callback) throw new Error(`queueURL:${queueURL} addConsumer callback:${callback} must not be null`);
  const app = Consumer.create({
    queueUrl: queueURL,
    handleMessage: async (message, done) => {
      try {
        // SNS -> SQS, message body should be parse & extract message
        let cbMessage;
        if (message.Body) {
          const body = JSON.parse(message.Body);
          if (body.Message) {
            cbMessage = JSON.parse(body.Message);
          } else if (body) {
            cbMessage = body
          }
        } else {
          cbMessage = message;
        }

        // 通过cls为consumer设置生产者携带的request id
        const requestID = cbMessage.request_id || uuid();
        await session.run(requestID, async () => {
          return callback(cbMessage);
        });
        done()
      } catch (err) {
        logger.error(`consumer callback error: `, err);
        done(err);
      }
    },
    sqs: this.sqs,
  });

  app.on('error', (err) => {
    logger.error('error event', err.message);
  });

  app.on('processing_error', (err) => {
    logger.error('processing_error event', err.message);
  });

  app.on('timeout_error', (err) => {
    logger.error('timeout_error event', err.message);
  });

  app.start();
}
