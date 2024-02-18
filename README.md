# MeetCoin

# 遵循的规范

## 1. API

    接口命名方式为：项目名/版本号/表名

## 2. redis

## 工具库

- [util工具库](https://nodejs.org/docs/latest-v8.x/api/util.html#util_util_format_format_args)

- [ioredis]()

## 3. jsonwebtoksn
```
const sign = require('jsonwebtoken');

const access_token = sign.sign({
    user_id: userId,
    did: deviceID,
    dtype: deviceType,
    app: app,
    exp: Math.floor(Date.now() / 1000) + 2592000, // 90 d
}, jwtKey);

const tokenInfo = sign.verify(access_token, jwtKey);

tokenInfo是这个数据：{
    user_id: userId,
    did: deviceID,
    dtype: deviceType,
    app: app,
    exp: Math.floor(Date.now() / 1000) + 2592000, // 90 d
}

```

## 日志库 winston


## 数据库连接池

- 连接池 pool 的作用是缓存连接，如果 min 值设为 0 ，这个时候连接池中是不会缓存任何连接的

- idle：  一个连接在释放前可空闲的时间
如果空闲的这个时间段内，有其他对数据库操作的请求进来了，这个时候这个连接是可以继续使用的，也就是说恭喜你又是一次物尽其用啊。如果直到空闲之间结束，这个连接仍然没有后续的请求使用，那么不好意思，弃之


- sync()数据库同步 ------ 不建议在生产环境中使用

    UserModel.sync() -- user表同步
    sequelize.sync() -- 全部同步


- findOrCreate 第一次只返回id和where条件里的字段

    为了返回所有字段，可以再get查询
    

- 与redis双写一致性


    什么时候写入redis？（get - update ）

        从数据库读取数据的时候，将未写入redis的数据写入redis

    读取数据的优先级
    
        从redis读取，如果数据不存在，再从数据库读取，读取的数据记得同步到redis

    更新数据库时，如何更新redis?

        数据库update更新用户数据后，从redis删除缓存的该用户数据，下次读取可以直接从数据库读，再缓存到redis
    

## 事务
model.sequelize.transaction(async (transaction))

## 并发

## 权限--中间件
## 异常处理 graceful
## 
    


## 第三方auth登陆token
    api/user.js中LoginRegister方法的token是从前端传参的吗？亦或者是认证后，redirect重定向地址中获取到的呢？

    在lib/third-party-auth中


## 基于Prometheus的node服务监控（可视化：Grafana）

- 对于服务的监控，概括来说需要采集sdk、上报、存储、图形化展示、监控报警

Prometheus是一套成熟且流行的系统和服务监控系统，它几乎满足了监控的所有能力

- 可视化：Grafana


## 电子邮件与手机短信

    
## 定时任务 node-schedule
