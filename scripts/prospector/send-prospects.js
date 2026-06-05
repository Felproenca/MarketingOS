'use strict';
const path = require('path');
const { initWhatsApp, sendWhatsApp, destroyWhatsApp } = require('./outreach-whatsapp');

const SESSION = path.resolve(__dirname, '../../.whatsapp-session');

// Rodada: Pet Shops — RJ + SP | 2026-06-05
// Protocolo: Etapa 2 — 1 mensagem, sem PNG, sem pitch, termina com pergunta
// Etapa 3 (diagnóstico completo) só após resposta positiva do lead
const PROSPECTS = [
  {
    name: 'Dom Peludo',
    phone: '11971707434',
    message: `Oi! Vi o perfil do Dom Peludo no Instagram.
Vocês têm o WhatsApp na bio, mas quem manda mensagem fora do horário não recebe nem uma confirmação de que foi recebido. Aí perde agendamento sem saber.
Isso está acontecendo?`,
  },
  {
    name: 'Pet Hero',
    phone: '11992446885',
    message: `Oi! Vi o Pet Hero lá no Instagram.
Vocês têm um bom número de avaliações para o tamanho, mas o WhatsApp tá operando na mão — cada mensagem respondida individualmente. Isso tá segurando o volume de agendamentos de vocês?`,
  },
  {
    name: 'Toca da Raposa',
    phone: '21969776945',
    message: `Oi! Vi a Toca da Raposa na Zona Norte.
Vocês têm um bom volume de avaliações, mas o perfil do Instagram não tá capturando quem passa por lá — sem link de WhatsApp visível, sem chamada para agendamento.
Isso é proposital ou ainda não chegaram nisso?`,
  },
  {
    name: 'Petshop Mania',
    phone: '21964168522',
    message: `Oi! Vi o perfil da Petshop Mania.
Vocês têm uma linha completa de serviços, mas quem chega pelo Instagram não tem um caminho claro — ração, vet e banho misturados sem direcionamento.
Vocês percebem que as pessoas chegam mas não continuam o contato?`,
  },
];

process.on('SIGINT', async () => { await destroyWhatsApp(); process.exit(0); });
process.on('uncaughtException', async (err) => { console.error(err.message); await destroyWhatsApp(); process.exit(1); });

async function main() {
  console.log('\n📤 MarketingOS — Envio de Prospecção Manual');
  console.log(`   Prospects: ${PROSPECTS.length}\n`);

  await initWhatsApp(SESSION);

  for (const p of PROSPECTS) {
    process.stdout.write(`   Enviando para ${p.name} (${p.phone})...`);
    const result = await sendWhatsApp(p.phone, p.message, 4000);
    if (result.success) {
      console.log(` ✓ ${result.chatId}`);
    } else {
      console.log(` ✗ ${result.error}`);
    }
  }

  await destroyWhatsApp();
  console.log('\n✅ Envios concluídos.');
  console.log('💡 Monitore as respostas e registre em clients/felipe-proenca/outputs/prospects/');
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
