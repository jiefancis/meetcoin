const AwsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_KEYID,
  secretAccessKey: process.env.AWS_SECRET,
};

const AWSRekConfig = {
  region: 'ap-southeast-1',
  accessKeyId: process.env.AWS_KEYID,
  secretAccessKey: process.env.AWS_SECRET,
};

module.exports = {
  AWSConfig: AwsConfig,
  AWSRekConfig,
};
