


// ================================== 飞书推送消息 ================================== 


const logger = require('./logger');
const axios = require('axios').default;
const moment = require('moment');

module.exports = Lark;

function Lark(config) {
    this.config = config;
    if (!this.config) throw new Error('Lark init config must not be null');
    if (!this.config.apiKey) throw new Error('Lark init config.apiKey must not be null');
    if (!this.config.runEnv) throw new Error('Lark init config.runEnv must not be null');
    const url = `https://open.larksuite.com/open-apis/bot/v2/hook/${this.config.apiKey}`;
    logger.info(`lark api url:${url}`);
    this.config.url = url;
}

Lark.prototype.notice0 = async function(data) {
    if (!this.config.runEnv || this.config.runEnv === 'local') return;
    try {
        const ret = await axios.post(this.config.url, data);
        logger.info(`${ret.status} ${ret.statusText} ${JSON.stringify(ret.data)}`);
    } catch (e) {
        logger.error('lark api occur error', e);
    }
}

Lark.prototype.notice = async function(message, serviceName) {
    const data = {
        msg_type: 'interactive',
        card: {
            config: {
                wide_screen_mode: true,
            },
            elements: [
                {
                    fields: [
                        {
                            is_short: true,
                            text: {
                                content: `**发生时间:**\n${moment().format('YYYY-MM-DD HH:mm:ss')}`,
                                tag: 'lark_md',
                            },
                        },
                        {
                            is_short: true,
                            text: {
                                content: `**错误信息:**\n${message}`,
                                tag: 'lark_md',
                            },
                        },
                    ],
                    tag: 'div',
                },
                {
                    tag: 'div',
                    text: {
                        tag: 'lark_md',
                        content: '错误日志查看CloudWatch, 监控查看Grafana',
                    },
                    extra: {
                        tag: 'button',
                        text: {
                            tag: 'lark_md',
                            content: '点击详情',
                        },
                        type: 'primary',
                        url: 'https://g-30361b686b.grafana-workspace.us-east-1.amazonaws.com/d/Er8zuTnVz/real-rds?orgId=1',
                    },
                },
            ],
            header: {
                template: 'turquoise',
                title: {
                    content: `【Witcoin-${process.env.RUN_ENV}】${serviceName} 告警`,
                    tag: 'plain_text',
                },
            },
        },
    };
    await this.notice0(data);
}

Lark.prototype.walletRiskNotice = async function(message, serviceName) {
    const data = {
        msg_type: 'interactive',
        card: {
            config: {
                wide_screen_mode: true,
            },
            elements: [
                {
                    fields: [
                        {
                            is_short: true,
                            text: {
                                content: `**风控内容:**\n${message}`,
                                tag: 'lark_md',
                            },
                        },
                        {
                            is_short: false,
                            text: {
                                content: `**发生时间:**\n${moment().format('YYYY-MM-DD HH:mm:ss')}`,
                                tag: 'lark_md',
                            },
                        },
                    ],
                    tag: 'div',
                },
            ],
            header: {
                template: 'turquoise',
                title: {
                    content: `【Witcoin-${process.env.RUN_ENV}】${serviceName} 告警`,
                    tag: 'plain_text',
                },
            },
        },
    };
    await this.notice0(data);
}
