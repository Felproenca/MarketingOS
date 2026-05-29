'use strict';
const nodemailer = require('nodemailer');

let transporter = null;
let fromAddress = null;

function initEmail(config) {
  fromAddress = config.from || config.user;
  transporter = nodemailer.createTransport({
    host: config.host || 'smtp.gmail.com',
    port: config.port || 587,
    secure: false,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

async function verifyEmail() {
  if (!transporter) throw new Error('Email não configurado. Chame initEmail() primeiro.');
  await transporter.verify();
}

async function sendEmail(to, subject, html, delayMs = 2000) {
  if (!transporter) throw new Error('Email não configurado.');

  await new Promise(r => setTimeout(r, delayMs));

  try {
    const info = await transporter.sendMail({ from: fromAddress, to, subject, html });
    return { success: true, messageId: info.messageId, to };
  } catch (err) {
    return { success: false, error: err.message, to };
  }
}

module.exports = { initEmail, verifyEmail, sendEmail };
