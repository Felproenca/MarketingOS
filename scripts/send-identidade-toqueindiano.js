'use strict';
const path = require('path');
const { initWhatsApp, sendWhatsAppWithMedia, destroyWhatsApp } = require('./prospector/outreach-whatsapp');

const SESSION = path.resolve(__dirname, '../.whatsapp-session');
const PHONE   = '5521964126520';

const SLIDES_DIR = path.resolve(__dirname, '../clients/toqueindiano/outputs/branding/slides');

const SLIDES = [
  '01-abertura.png',
  '02-produto.png',
  '03-fundadora.png',
  '04-cliente.png',
  '05-transformacao.png',
  '06-tagline.png',
  '07-identidade.png',
  '08-comeco.png',
].map(f => path.join(SLIDES_DIR, f));

const MENSAGEM = `Boa tarde! Depois da nossa conversa de hoje, formalizei a identidade da Toque Indiano.

Quem você é, para quem você vende, como a marca fala — tudo que construímos juntos organizado em um material.

Segue abaixo.`;

process.on('SIGINT', async () => { await destroyWhatsApp(); process.exit(0); });
process.on('uncaughtException', async (err) => { console.error(err.message); await destroyWhatsApp(); process.exit(1); });

async function main() {
  console.log('\nMarketingOS — Envio de Identidade Toque Indiano');
  console.log(`Destino: ${PHONE}`);
  console.log(`Slides:  ${SLIDES.length}\n`);

  await initWhatsApp(SESSION);

  const result = await sendWhatsAppWithMedia(PHONE, MENSAGEM, SLIDES, 2000);

  if (result.success) {
    console.log(`\nEnviado com sucesso → ${result.chatId}`);
  } else {
    console.log(`\nErro no envio: ${result.error}`);
  }

  await destroyWhatsApp();
}

main().catch(err => {
  console.error('\nErro:', err.message);
  process.exit(1);
});
