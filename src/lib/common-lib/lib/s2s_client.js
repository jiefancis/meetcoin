
// ================================== 服务端api ================================== 

const logger = require('./logger');
const rp = require('request-promise');
const encodeLib = require('./encode_lib');
const session = require('./session');

module.exports = ServerApi;

function ServerApi(service, host) {
    const baseHost = host ? host : process.env.S2S_HOST;
    this.S2S_HOST = baseHost + '/' + service + '/s2s';
    this.service = service;
}

ServerApi.prototype.post = async function post(uri, data) {
    if (!uri.startsWith('/')) uri = '/' + uri;
    const url = `${this.S2S_HOST}${uri}`;
    logger.info('s2s_post ==> ', url);
    const options = {
        method: 'POST',
        uri: url,
        body: {
            data: data,
        },
        resolveWithFullResponse: true,
        headers: {
            'x-req-encrypt': 0,
            'x-req-source': this.service,
            'x-request-id': session.get('requestId'),
        },
        json: true,
    };
    try {
        const res = await rp(options);
        if (res.headers['x-res-encrypt'] === '1' && res.body.code === 200) {
            return {
                code: res.body.code,
                data: encodeLib.decode(res.body.data),
            };
        }
        return res.body;
    } catch (error) {
        throw new Error(error);
    }
}

ServerApi.prototype.get = async function get(uri, data) {
    if (!uri.startsWith('/')) uri = '/' + uri;
    const url = `${this.S2S_HOST}${uri}`;
    logger.info('s2s_get ==> ', url);
    const options = {
        method: 'GET',
        uri: url,
        resolveWithFullResponse: true,
        headers: {
            'x-req-encrypt': 0,
            'x-req-source': this.service,
            'x-request-id': session.get('requestId'),
        },
        json: true,
    };
    try {
        const res = await rp(options);
        if (res.headers['x-res-encrypt'] === '1' && res.body.code === 200) {
            return {
                code: res.body.code,
                data: encodeLib.decode(res.body.data),
            };
        }
        return res.body;
    } catch (error) {
        throw new Error(error);
    }
}

