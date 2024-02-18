process.title = 'meetcoin-service';


const dotenv = require('dotenv');
const argv = process.argv;
const mode = argv[2] === '--mode' ? argv[3] : '';
// 按优先级由高到低的顺序加载.env文件
dotenv.config({ path: '.env' }); // 加载.env
if (mode) dotenv.config({ path: `.env.${mode}` }); // 加载.env.${mode}
const { logger, tools } = require('./src/lib/common-lib');
logger.info(`load env file: .env`);
logger.info(`load env file: .env.${mode}`);

logger.info(process.env.GOOGLE_APP_ID);
logger.info(process.env.GOOGLE_APP_SECRET);

const Koa = require('koa');
const http = require('http');
const cros = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const { graceful } = tools;
const { Access, SetRequest, Authentication, UpdateContext, Init } = require('./src/middleware/index');
const apiRoutes  = require('./src/router');

const app = new Koa();


const metrics = require('./src/lib/metrics');
app.use(async(ctx, next)=>{
  if (ctx.url === '/meetcoin/v1/metrics') {
    ctx.body = await metrics.Metrics();
    return;
  }
  await next();
});


app.use(SetRequest);
app.use(cros());
app.use(Access);
app.use(Authentication);
app.use(UpdateContext);
app.use(bodyParser());
app.use(Init);
app.use(apiRoutes);

app.on('error', async (evenErr, ctx) => {
  logger.error('error occurred:', evenErr, ctx);
});

// ===================================== app.listen 与 server.listen =====================================
/***
 * http.createServer(app.callback())可以在http和https上开启多个相同的应用程序
 * 
 * app.listen则只能开启一个
 */
const port = parseInt(process.env.PORT, 10) || 3000;
const server = http.createServer(app.callback());

server.listen(port, () => {
  // require('./src/consumer/index');
  // require('./src/consumer/pubnub');
  logger.info(`Server is running on ${port}`);
});

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});


graceful(
  {
    killTimeout: 1000 * 10,
    onError: async (error, type, handleCount) => {
      logger.error(`${type} occurred ${handleCount} times: `, error);
    },
    servers: [server],
  },
);

module.exports = server;