const plivo = require('plivo');
const { notifications } = require('config');
const { appendVariablesInTemplate } = require('../lib/template');

const client = new plivo.Client(
  notifications.get('plivo.authId'),
  notifications.get('plivo.authToken')
);

const sendSMS = async (template, to, variables) => {
  if (!notifications.get('shallSend')) {
    return true;
  }
  const message = await appendVariablesInTemplate(template, variables);

  const response = await client.messages.create(
    notifications.get('plivo.senderPhoneNumber'),
    `+${to}`,
    message
  );

  return response;
};

module.exports = {
  sendSMS
};
