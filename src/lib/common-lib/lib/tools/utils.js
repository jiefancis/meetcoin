const _ = require('lodash');
const fs = require("fs");
const moment = require('moment');
const archiver = require('archiver');
const crypto = require('crypto');
const util = require('util');

const userDelKey = 'real:user:del:%s';

/**
 *
 * @param length
 * @returns {string}
 */
function genRandomCode(length) {
  const chars = 'abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890';
  const str = _.sampleSize(chars, length || 12); // lodash v4: use _.sampleSize
  return str.join('');
}

function randomGender(arr1, arr2) {
  let sum = 0,
    factor = 0,
    random = Math.random();

  for (let i = arr2.length - 1; i >= 0; i--) {
    sum += arr2[i]; // 统计概率总和
  }
  random *= sum; // 生成概率随机数
  for (let i = arr2.length - 1; i >= 0; i--) {
    factor += arr2[i];
    if (random <= factor) {
      return arr1[i];
    }
  }
  return null;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genRoomIdV2(f_id, t_id) {
  f_id = parseInt(f_id, 10);
  t_id = parseInt(t_id, 10);
  if (f_id > t_id) {
    return `lemon_roomid_${t_id}_${f_id}`;
  }
  return `lemon_roomid_${f_id}_${t_id}`;
}

function checkIsBot(userId) {
  return userId >= 4000000 && userId < 10000000;
}


function enumerateDaysBetweenDates(startDate, endDate) {
  const dates = [startDate];

  if (startDate === endDate) {
    return dates;
  }

  const currDate = moment(startDate).startOf('day');
  const lastDate = moment(endDate).startOf('day');

  while (currDate.add(1, 'days').diff(lastDate) < 0) {
    dates.push(currDate.clone().format('YYYY-MM-DD'));
  }
  dates.push(endDate);
  return dates;
}

function arrayToMap(arr, key) {
  return arr.reduce((map, obj) => {
    // eslint-disable-next-line no-param-reassign
    map[obj[key]] = obj;
    return map;
  }, {});
}

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

function pageable(items, offset, count) {
  const ret = {
    items,
  };
  if (items.length > 0) {
    ret.offset = offset + items.length;
  }
  ret.has_more = (count > offset + items.length) ? 1 : 0;
  ret.total_count = count;
  return ret;
}

function GenerateConvID(senderID, receiverID) {
  const jointID = [senderID, receiverID].sort().join('');
  const hash = crypto.createHash('md5');
  hash.update(jointID);
  return hash.digest('hex');
}

async function SetUserDel(redisClient, userID) {
  if (!redisClient || !userID) {
    return null;
  }
  const key = util.format(userDelKey, userID);
  try {
    const setDelRes = await redisClient.set(key, 'del');
    if (setDelRes === null) {
      return false;
    }
  } catch (e) {
    return false
  }
  return true;
}

async function GetUserDel(redisClient, userID) {
  if (!redisClient || !userID) {
    return null;
  }
  const key = util.format(userDelKey, userID);
  try {
    const delStatus = await redisClient.get(key);
    if (!delStatus) {
      return false;
    }
  } catch (e) {
    return false
  }
  return true;
}


module.exports = {
  randomGender,
  getRandomInt,
  genRoomIdV2,
  checkIsBot,
  enumerateDaysBetweenDates,
  arrayToMap,
  zipDirectory,
  genRandomCode,
  pageable,
  GenerateConvID,
  GetUserDel,
  SetUserDel
}
