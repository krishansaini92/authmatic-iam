const nodemailer = require('nodemailer');
const { notifications } = require('config');
const { appendVariablesInTemplate } = require('../lib/template');
const logger = require('../services/logger');

const poolConfig = {
  host: 'smtpout.asia.secureserver.net',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: 'krishan@8coders.com',
    pass: '8Coders@2019'
  }
};

const transporter = nodemailer.createTransport(poolConfig);

const sendEmail = async (template, to, variables) => {
  if (!notifications.get('shallSend')) {
    return true;
  }
  const result = await appendVariablesInTemplate(template.body, variables);
  const mailOptions = {
    from: notifications.get('senderEmailId'), // sender address
    to,
    subject: template.subject, // Subject line
    html: result // html body
  };
  // send mail with defined transport object
  const response = await transporter.sendMail(mailOptions);

  logger.debug(`Email send to ${to} with subject - ${template.subject}`);

  return response;
};

module.exports = {
  sendEmail
};
