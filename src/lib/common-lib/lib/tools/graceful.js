// =========================== 异常处理 ============================
// =========================== 进程崩溃优雅退出 ===========================
// =========================== 进程崩溃退出之后导致整个应用程序也将崩溃(开多个窗口，某一个窗口崩溃，其它窗口的请求无法正常响应) ===========================

const http = require('http');
const logger = require('../logger');

/**
 * graceful
 * @param { Number } options.killTimeout 超时时间
 * @param { Function } options.onError 产生错误信息会执行该回调函数
 * @param { Array } options.servers Http Server
 * @returns
 */
function graceful(options = {}) {
  options.killTimeout = options.killTimeout || 1000 * 10;
  options.onError = options.onError || function () {};
  options.servers = options.servers || [];
  process.on('uncaughtException', error => handleUncaughtException(error, options));
  process.on('unhandledRejection', error => handleUnhandledRejection(error, options));
}

const throwCount = {
  uncaughtException: 0,
  unhandledRejection: 0,
};

function handleUncaughtException(error, options) {
  throwCount.uncaughtException += 1;
  options.onError(error, 'uncaughtException', throwCount.uncaughtException);

  if (throwCount.uncaughtException > 1) return;
  handleError(options);
}

function handleUnhandledRejection(error, options) {
  throwCount.unhandledRejection += 1;
  options.onError(error, 'unhandledRejection', throwCount.unhandledRejection);

  if (throwCount.unhandledRejection > 1) return;
  handleError(options);
}

function handleError(options) {
  const { servers, killTimeout } = options;
  // 关闭当前请求的链接
  for (const server of servers) {
    logger.info('server instanceof http.Server: ', server instanceof http.Server);
    if (server instanceof http.Server) {
      server.on('request', (req, res) => {
        // 小的细节处理，在关闭服务器之前，后续新接收的 request 全部关闭 keep-alive 特性，通知客户端不需要与该服务器保持 socket 连接了。
        req.shouldKeepAlive = false;
        res.shouldKeepAlive = false;
        // 停止接收新的连接
        if (!res._header) {
          res.setHeader('Connection', 'close');
        }
      });
    }
  }

  // 接着在几秒中之后差不多 ** 所有请求都已经处理完毕后 **，该进程主动退出，其中 timeout 可以根据实际业务场景进行设置
  // 延迟退出
  const timer = setTimeout(() => {
    process.exit(1);
  }, killTimeout);

  if (timer && timer.unref) {
    timer.unref();
  }
}

module.exports = graceful;
