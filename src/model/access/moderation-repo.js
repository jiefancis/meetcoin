const model = require('../db/index');

async function CreateRekRecord(record){
  const now = new Date().getTime();
  await model.moderation_image.create({
    user_id: record.user_id,
    image_url: record.image_url,
    s3_url: record.s3_url,
    rek_labels: record.rek_labels,
    punish: record.punish,
    create_ts: now,
    update_ts: now,
  })
}

async function FindRekRecord(url){
  return model.moderation_image.findOne({
    where:{
      image_url:url,
    }
  });
}

module.exports = {
  CreateRekRecord,
  FindRekRecord,
}