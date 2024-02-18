// ============================ node异步模块 ============================
// https://nodejs.cn/api/async_context.html#%E5%BC%82%E6%AD%A5%E4%B8%8A%E4%B8%8B%E6%96%87%E8%B7%9F%E8%B8%AA

const { AsyncLocalStorage } = require('node:async_hooks');

const session = new AsyncLocalStorage();

module.exports = session;


