
// ===================================== 控制台打印或日志文件 ===================================== 

const winston = require('winston');
const session = require('./session');
const { format, transports } = require('winston');
const jsonStringify = require('fast-safe-stringify');

const argv = process.argv;
const mode = argv[2] === '--mode' ? argv[3] : '';
const isProd = (mode && mode === 'prod');

const requestId = format((info) => {
  // 每次自动获取 requestId
  info.requestId = session.getStore();
  return info;
});

const logLikeFormat = {
  transform(info) {
    const { message } = info;
    const args = info[Symbol.for('splat')];
    const strArgs = args ? args.map(jsonStringify).join(' ') : '';
    info['message'] = `${message} ${strArgs}`;
    return info;
  },
};

const prodFormat = format.combine(
  requestId(),
  format.json({
    maximumDepth: 3,
  }),
  logLikeFormat,
);

const printFormat = format.printf(({level, message, requestId, timestamp}) => {
  return isProd
    ? `${level}(${process.pid}) ${requestId || ''} ${message}`
    :`${level}(${process.pid}) ${requestId || ''} ${timestamp} ${message}`;
})

const devFormat = format.combine(
  requestId(),
  format.json({
    maximumDepth: 3,
  }),
  format.colorize({
    all: true,
    colors: { info: 'blue', error: 'red' },
  }),
  format.timestamp({
    format: 'MMM-DD-YYYY HH:mm:ss',
  }),
  logLikeFormat,
  printFormat,
);

const logger = winston.createLogger({
  transports: [
    new transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: isProd ? prodFormat : devFormat,
    }),
  ],
});

module.exports = logger;
