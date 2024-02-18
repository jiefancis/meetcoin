
// ================================== email邮件， 可能废弃，主要看email.js文件 ================================== 

const AWS = require('aws-sdk');

module.exports = SES;

function SES(config) {
  this.ses = new AWS.SES(config)
}

SES.prototype.sendEmail = function(recipientEmail, code) {
  let params = {
    Source: 'no-reply@app.nxglabs.io',
    Destination: {
      ToAddresses: [
        recipientEmail,
      ],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `This is code ${code}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `real login code!`,
      }
    },
  };
  return this.ses.sendEmail(params).promise();
}