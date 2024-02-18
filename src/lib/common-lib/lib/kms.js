const util = require('util');
const AWS = require('aws-sdk');
const logger = require('./logger');
const constant = require('../config/key-vault');
const NodeRSA = require('node-rsa');
const S2SClient = require('./s2s_client');
const BaseError = require('../config/base-error');
const { ERROR, UpdateRedisChannel } = require('../config/key-vault');
const redis = require('../../../model/redis/index');

module.exports = KMS;

// key-vault s2s client
let keyVaultClient = null;

/**
 * 初始化KMS配置
 * @param awsConfig
 * @param serverConfig { { hostPrefix: string } }
 * @param tenantID
 * @constructor
 */
function KMS(awsConfig, serverConfig, tenantID = null) {
    this.config = serverConfig;
    if (!this.config) throw new BaseError(ERROR.PARAM_ILLEGAL, 'KMS init serverConfig must not be null');
    if (!this.config.hostPrefix) throw new BaseError(ERROR.PARAM_ILLEGAL, 'KMS init serverConfig.hostPrefix must not be null');
    logger.debug('kms sdk serverConfig', this.config);

    keyVaultClient = new S2SClient('key-vault', this.config.hostPrefix);

    this.config.api_path_keypair = '/keypair';
    this.config.api_path_pubkey = '/pubkey';
    this.kms = new AWS.KMS(awsConfig);

    // 每个部署的pod监听key-vault-service的变动更新本地缓存
    if (tenantID) {
        redis.subscribe(util.format(UpdateRedisChannel, tenantID));
        redis.on('message', function (channel, message) {
            logger.info('key vault update message received: ', channel, message);
            try {
                updateLocalKeyInfo(JSON.parse(message));
            } catch (e) {
                logger.error('key update fail: ', message, e);
            }
        });
    }
}

const BASE64 = 'base64';
const UTF8 = 'utf8';
const RSAES_OAEP_SHA_256 = 'RSAES_OAEP_SHA_256';

// <keyId, keyInfo>
// KeyInfo: [tenantId, keyId, keyAlias, securityLevel, publicKey, publicEncrypt, privateDecrypt]
const keyMap = new Map();
// <keyAlias, keyId>
const aliasMap = new Map();

function removeNextLineFlag(str) {
    if (!str) return null;
    return str.replace(/(\\r\\n|\\n|\\r|\r\n|\n|\r)/gm, '');
}

function isSuccess(code) {
    if (!code) return false;
    return 200 === code || '200' === code;
}

/**
 * 创建密钥对 (对称加密/非对称加密)
 * @param data
 * @returns {Promise<null|any>}
 */
KMS.prototype.createKeyPair = async function(data) {
    if (!data) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data must not be null');
    if (!data.tenant_id) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.tenant_id must not be null');
    if (!data.security_level) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.security_level must not be null');
    if (!data.key_alias) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.key_alias must not be null');
    if (!data.key_type) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.key_type must not be null');

    logger.debug('createKeyPair params:', data);

    try {
        const { data: resp } = await keyVaultClient.post(this.config.api_path_keypair, {
            tenant_id: data.tenant_id,
            security_level: data.security_level,
            key_alias: data.key_alias,
            key_type: data.key_type,
        });
        let { tenant_id, key_id, key_alias, public_key, private_key, security_level } = resp;
        if (!public_key) {
            throw new BaseError(ERROR.PRIVATE_KEY_NOT_FOUND, 'createKeyPair public_key is null');
        }
        if (security_level === constant.SecurityLevelEnum.MEM && !private_key) {
            throw new BaseError(ERROR.PRIVATE_KEY_NOT_FOUND, 'createKeyPair private_key is null');
        }
        updateLocalKeyInfo(resp);
        return { tenant_id, key_id, key_alias };
    } catch (error) {
        logger.error(`KMS createKeyPair data:${data}`, error);
        throw error;
    }
}

/**
 * 创建或更新密钥对 (对称加密/非对称加密)
 * 1. 检查内存是否包含密钥
 *   2.1 如果包含则直接返回 key_id, 则后续可以 调用 encrypt / decrypt 两个方法
 *   2.2 如果不包含则请求远程获取密钥
 *     2.2.1 如果远程存在则直接返回 key_id
 *     2.2.2 如果远程不存在则请求远程创建密钥, 密钥创建完毕后 将密钥放入内存并返回 key_id, 则后续可以调用 encrypt / decrypt 两个方法
 *
 * @param tenantId
 * @param keyAlias
 * @param data { security_level, key_type }
 *  security_level: [MEM / KMS]
 *  key_type: [Symmetric / Asymmetric]
 * @returns {Promise<null|any>}
 */
KMS.prototype.upsertKeyPairByAlias = async function(tenantId, keyAlias, data) {
    if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
    if (!keyAlias) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param alias must not be null');

    const keyId = aliasMap.get(keyAlias);
    if (keyId) {
        const keyInfo = keyMap.get(keyId);
        if (keyInfo && keyInfo.keyId) {
            return { key_id: keyInfo.keyId };
        }
    }

    let key = await this.getKeyPairByAlias(tenantId, keyAlias);

    if (!key) {
        if (!data) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data must not be null');
        if (!data.security_level) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.security_level must not be null');
        if (!data.key_type) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.key_type must not be null');
        data.tenant_id = tenantId;
        data.key_alias = keyAlias;
        key = await this.createKeyPair(data);
    }

    return { key_id: key.key_id };
}

/**
 * 根据别名找到 keypair 密钥对
 * @param tenantId
 * @param keyAlias
 * @returns {Promise<{key_id: any}>}
 */
KMS.prototype.getKeyPairByAlias = async function(tenantId, keyAlias) {
    if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
    if (!keyAlias) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param alias must not be null');

    const keyId = aliasMap.get(keyAlias);
    if (keyId) {
        const keyInfo = keyMap.get(keyId);
        if (keyInfo) {
            return { key_id: keyId, pub_key: keyInfo.publicKey };
        }
    }

    try {
        const url = `${this.config.api_path_keypair}?keyAlias=${keyAlias}&tenantId=${tenantId}`;
        logger.debug(`getKeyPairByAlias tenantId:${tenantId} keyId:${keyId} url:${url}`);
        const { data: resp } = await keyVaultClient.get(url);
        let { key_id, security_level, public_key, private_key } = resp;
        if (!public_key) {
            return null;
        }
        if (security_level === constant.SecurityLevelEnum.MEM && !private_key) {
            return null;
        }
        updateLocalKeyInfo(resp);
        return { key_id: key_id, pub_key: public_key };
    } catch (error) {
        logger.error(`KMS getKeyPairByAlias tenantId:${tenantId} keyId:${keyId}`, error);
        throw error;
    }
}

/**
 * 根据id找到 keypair 密钥对
 * @param tenantId
 * @param keyId
 * @returns {Promise<{key_id: any}>}
 */
KMS.prototype.getKeyPairByKeyId = async function(tenantId, keyId) {
    if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
    if (!keyId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param keyId must not be null');

    const keyInfo = keyMap.get(keyId);
    if (keyInfo) {
        return { key_id: keyId, pub_key: keyInfo.publicKey };
    }

    try {
        const url = `${this.config.api_path_keypair}?keyId=${keyId}&tenantId=${tenantId}`;
        logger.debug(`getKeyPairByAlias tenantId:${tenantId} keyId:${keyId} url:${url}`);
        const { data: resp } = await keyVaultClient.get(url);
        let { key_id, security_level, public_key, private_key } = resp;
        if (!public_key) {
            return null;
        }
        if (security_level === constant.SecurityLevelEnum.MEM && !private_key) {
            return null;
        }
        updateLocalKeyInfo(resp);
        return { key_id: key_id,  pub_key: public_key };
    } catch (error) {
        logger.error(`KMS getKeyPairByAlias tenantId:${tenantId} keyId:${keyId}`, error);
        throw error;
    }
}

/**
 * 1. 先做内存对比, 如果数据一致就直接返回 不再请求http
 * 2. 请求http-key-vault做持久化存储
 * 3. response-ok, 放入内存 <keyId, pubKey>
 * 4. return keyId
 *
 * @param data
 *  pubKey
 *  keyId (userId 根据业务方指定)
 *  tenantId (REAL:10001)
 * @returns {Promise<{key_id, level, key_alias, pub_key}>}
 *  null 失败
 *  keyId 成功
 */
KMS.prototype.createPubKey = async function(data) {
    if (!data) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data must not be null');
    if (!data.key_id) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.key_id must not be null');
    if (!data.key_alias) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.key_alias must not be null');
    if (!data.tenant_id) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.tenant_id must not be null');
    if (!data.pub_key) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data.pub_key must not be null');

    logger.debug('createPubKey params:', data);

    const keyInfo = keyMap.get(data.key_id);
    if (keyInfo && keyInfo.publicKey === data.pub_key) {
        return data;
    }

    try {
        const { data: resp } = await keyVaultClient.post(this.config.api_path_pubkey, {
            key_id: data.key_id,
            key_alias: data.key_alias,
            tenant_id: data.tenant_id,
            pub_key: data.pub_key,
        });
        let { tenant_id, key_alias, key_id, pub_key } = resp;
        if (!pub_key) {
            throw new BaseError(ERROR.PUB_KEY_NOT_FOUND, 'createPubKey pub_key is null');
        }
        updateLocalKeyInfo(resp);
        return data;
    } catch (error) {
        logger.error(`KMS createPubKey data:${data}`, error);
        throw error;
    }
}

/**
 * 根据 keyId 获取公钥
 * 1. 先检查内存是否存在keyId
 * 2. 请求http-key-vault是否存在
 *
 * The value is a DER-encoded X.509 public key
 * https://www.rfc-editor.org/rfc/rfc5280
 *
 * @param keyId
 * @param tenantId
 * @param securityLevel 'MEM' or 'KMS'
 * @returns {Promise<{key_id,pub_key}>} { key_id, pub_key }
 */
KMS.prototype.getPubKey = async function(tenantId, keyId, securityLevel = 'MEM') {
    if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
    if (!keyId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param keyId must not be null');

    const keyInfo = keyMap.get(keyId);
    if (keyInfo) {
        return { key_id: keyId, pub_key: keyInfo.publicKey };
    }

    if (securityLevel === constant.SecurityLevelEnum.MEM) {
        try {
            const url = `${this.config.api_path_pubkey}?keyId=${keyId}&tenantId=${tenantId}`;
            logger.debug(`getPubKey tenantId:${tenantId} keyId:${keyId} url:${url}`);
            const { data: resp } = await keyVaultClient.get(url);
            let { tenant_id, key_alias, key_id, pub_key } = resp;
            if (!pub_key) {
                logger.debug(`getPubKey tenantId:${tenantId} keyId:${keyId} pub_key is null`);
                return null;
            }
            updateLocalKeyInfo(resp);
            return { key_id: keyId, pub_key: pub_key };
        } catch (error) {
            logger.error(`KMS getPubKey tenantId:${tenantId} keyId:${keyId}`, error);
            return null;
        }
    } else if (securityLevel === constant.SecurityLevelEnum.KMS) {
        const params = {
            KeyId: keyId,
        };
        const { PublicKey } = await this.kms.getPublicKey(params).promise();
        return { key_id: keyId, pub_key: PublicKey.toString(BASE64) };
    } else {
        throw new BaseError(ERROR.NOT_SUPPORT, `securityLevel:${securityLevel} not supported`);
    }
}

/**
 * 根据 `key别名` 获取 `密钥keyId`
 * 1. 先检查内存是否存在keyId
 * 2. 请求http-key-vault是否存在
 *
 * @param tenantId
 * @param keyAlias
 * @param securityLevel 'MEM' / 'KMS'
 * @returns { key_id }
 */
KMS.prototype.getPubKeyByAlias = async function(tenantId, keyAlias, securityLevel = 'MEM') {
    if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
    if (!keyAlias) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param keyAlias must not be null');

    const keyId = aliasMap.get(keyAlias);
    if (keyId) {
        const keyInfo = keyMap.get(keyId);
        if (keyInfo.keyId && keyInfo.publicKey && keyInfo.publicEncrypt) {
            return { key_id: keyInfo.keyId };
        }
    }

    if (securityLevel === constant.SecurityLevelEnum.MEM) {
        try {
            const url = `${this.config.api_path_pubkey}?keyAlias=${keyAlias}&tenantId=${tenantId}`;
            logger.debug(`getPubKeyByAlias tenantId:${tenantId} keyAlias:${keyAlias} url:${url}`);
            const { data: resp } = await keyVaultClient.get(url);
            let { tenant_id, key_alias, key_id, pub_key } = resp;
            if (!pub_key) {
                throw new BaseError(ERROR.PUB_KEY_NOT_FOUND, 'getPubKeyByAlias pub_key is null');
            }
            updateLocalKeyInfo(resp);
            return { key_id: key_id };
        } catch (error) {
            logger.error(`KMS getKeyByAlias tenantId:${tenantId} keyAlias:${keyAlias}`, error);
            return null;
        }
    } else if (securityLevel === constant.SecurityLevelEnum.KMS) {
        throw new BaseError(ERROR.NOT_SUPPORT, `securityLevel:${securityLevel} not supported`);
    } else {
        throw new BaseError(ERROR.NOT_SUPPORT, `securityLevel:${securityLevel} not supported`);
    }
}

/**
 * level: MEM ->
 * 1. 检查内存是否包含密钥
 *   2.1 如果包含则直接返回 key_id, 则后续可以 调用 encrypt / decrypt 两个方法
 *   2.2 如果不包含则请求远程获取密钥
 *     2.2.1 如果远程存在则直接返回 key_id
 *     2.2.2 如果远程不存在则请求远程创建密钥, 密钥创建完毕后 将密钥放入内存并返回 key_id, 则后续可以调用 encrypt / decrypt 两个方法
 * level: KMS ->
 *   TODO: @tukeping
 * @param tenantId
 * @param keyAlias
 * @param data
 * @returns {Promise<any>}
 */
// KMS.prototype.upsertPubKeyByAlias = async function(tenantId, keyAlias, data) {
//     if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
//     if (!keyAlias) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param alias must not be null');
//     const keyId = aliasMap.get(keyAlias);
//     if (keyId) {
//         const keyInfo = keyMap.get(keyId);
//         if (keyInfo) {
//             const { publicKey } = keyInfo;
//             return { key_id: keyId }
//         }
//     }
//     if (!data) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param data must not be null');
//     let key = await this.getPubKeyByAlias(tenantId, keyAlias);
//     if (!key) {
//         key = await this.createPubKey(data);
//     }
//     return { key_id: key.key_id };
// }

/**
 * 根据keyId获取密钥
 * @param keyId
 * @returns {Promise<null|{CreationDate: KMS.DateType, KeySpec: KMS.KeySpec, Enabled: KMS.BooleanType, KeyId: KMS.KeyIdType}>}
 */
// KMS.prototype.getKey = async function(keyId) {
//     if (!keyId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param keyId must not be null');
//     const keyInfo = keyMap.get(keyId);
//     if (keyInfo) {
//         return keyInfo;
//     }
//     const params = {
//         KeyId: keyId,
//     };
//     const { KeyMetadata } = await this.kms.describeKey(params).promise();
//     if (!KeyMetadata) return null;
//     else return {
//         KeyId: KeyMetadata.KeyId,
//         CreationDate: KeyMetadata.CreationDate,
//         Enabled: KeyMetadata.Enabled,
//         KeySpec: KeyMetadata.KeySpec,
//     };
// }

/**
 * 加密数据 (公钥加密数据)
 * @param source
 * @param tenantId
 * @param keyId
 * @param encoding 'buffer' or 'base64'
 * @returns {Promise<string>}
 */
KMS.prototype.encrypt = async function(source, tenantId, keyId, encoding = 'base64') {
    if (!source) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param source must not be null');
    if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
    if (!keyId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param keyId must not be null');
    if (!encoding) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param encoding must not be null');

    let keyInfo = keyMap.get(keyId);
    if (!keyInfo) {
        const pubKey = await this.getPubKey(tenantId, keyId);
        if (!pubKey) {
            throw new BaseError(ERROR.KEY_ID_NOT_FOUND, `keyId:${keyId} not found, checkout your keyId`);
        }
        keyInfo = keyMap.get(keyId);
    }

    const { securityLevel, publicEncrypt } = keyInfo;
    if (!securityLevel) {
        throw new BaseError(ERROR.PARAM_ILLEGAL, `keyId:${keyId} not found securityLevel, checkout your keyId's securityLevel`);
    }

    if (constant.SecurityLevelEnum.MEM === securityLevel) {
        if (!publicEncrypt) {
            throw new BaseError(ERROR.CRYPTO_INSTANCE_NOT_FOUND, `keyId:${keyId} not found PublicEncrypt Instance`);
        }
        return publicEncrypt.encrypt(source, encoding);
    } else if (constant.SecurityLevelEnum.KMS === securityLevel) {
        const params = {
            KeyId: keyId,
            Plaintext: source,
            EncryptionAlgorithm: RSAES_OAEP_SHA_256,
        };
        const { CiphertextBlob } = await this.kms.encrypt(params).promise();
        return encoding === BASE64 ? CiphertextBlob.toString(BASE64) : CiphertextBlob;
    }
    throw new BaseError(ERROR.NOT_SUPPORT, `keyId:${keyId} securityLevel:${securityLevel} not supported`);
}

/**
 * 解密数据 (私钥解密数据)
 * @param source
 * @param tenantId
 * @param keyId
 * @param encoding 'buffer' or 'utf8'
 * @returns {Promise<string>}
 */
KMS.prototype.decrypt = async function(source, tenantId, keyId, encoding = 'utf8') {
    if (!source) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param source must not be null');
    if (!tenantId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param tenantId must not be null');
    if (!keyId) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param keyId must not be null');
    if (!encoding) throw new BaseError(ERROR.PARAM_ILLEGAL, 'param encoding must not be null');

    let keyInfo = keyMap.get(keyId);
    if (!keyInfo) {
        const keyPair = await this.getKeyPairByKeyId(tenantId, keyId);
        if (!keyPair) {
            throw new BaseError(ERROR.KEY_ID_NOT_FOUND, `keyId:${keyId} not found, checkout your keyId`);
        }
        keyInfo = keyMap.get(keyId);
    }

    const { securityLevel, privateDecrypt } = keyInfo;
    if (!securityLevel) {
        throw new BaseError(ERROR.PARAM_ILLEGAL, `keyId:${keyId} not found securityLevel, checkout your keyId's securityLevel`);
    }

    if (securityLevel === constant.SecurityLevelEnum.MEM) {
        if (!privateDecrypt) {
            throw new BaseError(ERROR.CRYPTO_INSTANCE_NOT_FOUND, `keyId:${keyId} not found PrivateEncrypt Instance`);
        }
        return privateDecrypt.decrypt(source, encoding);
    } else if (securityLevel === constant.SecurityLevelEnum.KMS) {
        const params = {
            KeyId: keyId,
            CiphertextBlob: Buffer.from(source, BASE64),
            EncryptionAlgorithm: RSAES_OAEP_SHA_256,
        };
        const { Plaintext } = await this.kms.decrypt(params).promise();
        return encoding === UTF8 ? Plaintext.toString() : Plaintext;
    }
    throw new BaseError(ERROR.NOT_SUPPORT, `keyId:${keyId} securityLevel:${securityLevel} not supported`);
}

/**
 * 根据redis接收到的update信息，更新本地缓存中的key info数据
 * @param message { {
 *   tenant_id: string,
 *   key_alias: string,
 *   key_id: string,
 *   public_key?: string,
 *   pub_key?:string,
 *   private_key?: string,
 *   security_level?: string,
 * } }
 */
function updateLocalKeyInfo(message) {
    const { key_alias: alias, key_id: keyID } = message;
    if (!alias || !keyID || (!message.public_key && !message.pub_key)) {
        logger.error('update message invalid');
        return;
    }
    const keyInfo = {
        tenantId: message.tenant_id,
        keyId: message.key_id,
        keyAlias: message.key_alias,
    };
    if (message.public_key) {
        keyInfo.publicKey = removeNextLineFlag(message.public_key);
        keyInfo.publicEncrypt = new NodeRSA(message.public_key);
    }
    if (message.pub_key) {
        keyInfo.publicKey = removeNextLineFlag(message.pub_key);
        keyInfo.publicEncrypt = new NodeRSA(message.pub_key);
    }
    if (message.private_key) {
        keyInfo.private_key = removeNextLineFlag(message.private_key);
        keyInfo.privateDecrypt = new NodeRSA(message.private_key);
    }
    keyInfo.securityLevel = message.security_level || constant.SecurityLevelEnum.MEM;

    aliasMap.set(alias, keyID);
    keyMap.set(keyID, keyInfo);
}
