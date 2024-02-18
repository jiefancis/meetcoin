const admin = require('firebase-admin');

module.exports = FCM;

/**
 * FCM初始化
 * @param serviceAccount.type {string}
 * @param serviceAccount.project_id {string}
 * @param serviceAccount.private_key_id {string}
 * @param serviceAccount.private_key {string}
 * @param serviceAccount.client_email {string}
 * @param serviceAccount.client_id {string}
 * @param serviceAccount.auth_uri {string}
 * @param serviceAccount.token_uri {string}
 * @param serviceAccount.auth_provider_x509_cert_url {string}
 * @param serviceAccount.client_x509_cert_url {string}
 * @constructor
 */
function FCM(serviceAccount) {
  this.fcmClient = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * toDevice 向单个设备发送fcm系统推送
 * @param registrationToken {string}
 * @param payload {object}
 * @param options {object}
 * @returns {Promise<void>}
 */
FCM.prototype.toDevice = async function(registrationToken, payload, options = {}) {
  return this.fcmClient.messaging().sendToDevice(registrationToken, payload, options)
};

/**
 * toDeviceGroup 向一个设备组发送fcm系统推送
 * @param notificationKey {string}
 * @param payload {object}
 * @returns {Promise<void>}
 */
FCM.prototype.toDeviceGroup = async function(notificationKey, payload) {
  return this.fcmClient.messaging().sendToDeviceGroup(notificationKey, payload);
};

/**
 * toTopic 向一个主题发送fcm系统推送
 * @param topic {string}
 * @param payload {object}
 * @returns {Promise<void>}
 */
FCM.prototype.toTopic = async function(topic, payload) {
  return this.fcmClient.messaging().sendToTopic(topic, payload);
};

/**
 * toCondition
 * @param condition {string}
 * @param payload {object}
 * @returns {Promise<void>}
 */
FCM.prototype.toCondition = async function(condition, payload) {
  return this.fcmClient.messaging().sendToCondition(condition, payload);
};

/**
 * subscribeToTopic 将设备订阅一个主题
 * @param registrationToken {string}
 * @param topic {string}
 * @returns {Promise<void>}
 */
FCM.prototype.subscribeToTopic = async function(registrationToken, topic) {
  return this.fcmClient.messaging().subscribeToTopic(registrationToken, topic);
};

/**
 * unsubscribeFromTopic 解除订阅主题
 * @param registrationToken {string}
 * @param topic {string}
 * @returns {Promise<void>}
 */
FCM.prototype.unsubscribeFromTopic = async function(registrationToken, topic) {
  return this.fcmClient.messaging().unsubscribeFromTopic(registrationToken, topic);
};
