


// ================================== 敏感词汇搜索 ================================== 

/**
 * 字符串搜索算法
 */
const sensitiveWordsData = require('./sensitive-words.json');
const AhoCorasick = require('ahocorasick'); // https://github.com/BrunoRB/ahocorasick
const ac = new AhoCorasick(sensitiveWordsData);

function search(text) {
  return ac.search(text);
}

module.exports = {
  search,
}