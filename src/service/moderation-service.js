const AWS = require('aws-sdk');
const { AWSRekConfig } = require('../config/aws-config');
const { ModerationConfig } = require('../config/constants');
const { logger } = require('../lib/common-lib');
const rekognition = new AWS.Rekognition(AWSRekConfig);
const moderationRepo = require('../model/access/moderation-repo');

const BucketName = process.env.S3_BUCKET;
async function rekLabels(s3Name, confidence){
  try{
    const params = {
      Image: {
        S3Object: { Bucket: BucketName, Name: s3Name },
      },
      MinConfidence: confidence,
    };
    const response = await rekognition.detectModerationLabels(params).promise();
    logger.debug('detect_image', response);
    return response.ModerationLabels;
  } catch (error){
    logger.error('detect_image error', error);
    return [];
  }
}

function getS3Name(url) {
  return url.substring(url.indexOf(ModerationConfig.ImageDetect.S3ImagePrefix) + 1, url.length);
}


async function DetectImage(userId, url) {
  logger.debug(`DetectImage: userId:${userId}, ${url}`);
  const record = await moderationRepo.FindRekRecord(url);
  if(record) return record.punish;

  const s3Name = getS3Name(url);
  const labels = await rekLabels(s3Name, ModerationConfig.ImageDetect.DetectConfidence);
  let punish = ModerationConfig.PunishStatus.Normal;
  for(let label of labels){
    if (ModerationConfig.DetectImage.IgnoreLabels.includes(label.Name)) { continue; }
    punish = ModerationConfig.PunishStatus.Punished;
  }
  await moderationRepo.CreateRekRecord({
    user_id: userId,
    image_url: url,
    s3_url: s3Name,
    rek_labels: JSON.stringify(labels),
    punish: punish,
  })
  return punish;
}


module.exports = {
  DetectImage,
}