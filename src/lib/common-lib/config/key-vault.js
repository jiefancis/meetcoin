const SecurityLevelEnum = Object.freeze({
    MEM: 'MEM',
    KMS: 'KMS',
});

const TenantIdEnum = Object.freeze({
    'REAL': '10001',
    'DUMMY': '10002',
    'CRYPTO_MONKEY': '10003',
});

const TenantNameEnum = Object.freeze({
    '10001': 'REAL',
    '10002': 'DUMMY',
    '10003': 'CRYPTO_MONKEY',
});

const KmsProviderEnum = Object.freeze({
    'MEM': 0,
    'AWS': 1,
    'ALI_CLOUD': 2,
    'TENCENT_CLOUD': 3,
});

const KeyTypeEnum = Object.freeze({
    Symmetric: 'Symmetric', // 0
    Asymmetric: 'Asymmetric', // 1
    HMAC: 'HMAC', // 2
});

const KeySpecEnum = Object.freeze({
    'AES_256_CBC': 10,
    'AES_256_ECB': 11,
    'AES_256_CFB': 12,
    'AES_256_OFB': 13,
    'RSA_2048': 20,
    'RSA_4096': 21,
});

const ERROR = Object.freeze({
    PARAM_ILLEGAL: 990400,
    KEY_ID_NOT_FOUND: 990001,
    NOT_SUPPORT: 990002,
    CRYPTO_INSTANCE_NOT_FOUND: 990003,
    PUB_KEY_NOT_FOUND: 990004,
    PRIVATE_KEY_NOT_FOUND: 990005,
});

const UpdateRedisChannel = 'key:vault:%s:update:channel';

module.exports = {
    SecurityLevelEnum,
    TenantIdEnum,
    TenantNameEnum,
    KmsProviderEnum,
    KeyTypeEnum,
    KeySpecEnum,
    ERROR,
    UpdateRedisChannel,
};
