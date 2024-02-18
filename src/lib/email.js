
// ================================== email发送电子邮件 ================================== 

const { default: Dm20151123, SingleSendMailRequest } = require('@alicloud/dm20151123');
const { Config: AliConfig } = require('@alicloud/openapi-client');
const { logger } = require('./common-lib/index');

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

class EmailClient{
  constructor(options){
    this.AWS_KEY = options.AWS_KEY;
    this.AWS_SECRET = options.AWS_SECRET;
    this.AWS_REGION = options.AWS_REGION; // const REGION = "us-east-1";
    this.aws = new SESClient({
      credentials: {
        accessKeyId: this.AWS_KEY,
        secretAccessKey: this.AWS_SECRET,
      },
      region: this.AWS_REGION,
    });
  }

  async SendEmailByAWS(from, to, subject, content){
    const command = new SendEmailCommand({
      Destination: {
        CcAddresses: [],
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: { Charset: 'UTF-8', Data: content, }
        },
        Subject: { Charset: 'UTF-8', Data: subject, }
      },
      Source: from,
      ReplyToAddresses: [],
    });
    return this.aws.send(command);
  }
}


module.exports = {
  EmailClient,
};