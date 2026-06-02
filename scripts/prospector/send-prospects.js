'use strict';
const path = require('path');
const { initWhatsApp, sendWhatsApp, destroyWhatsApp } = require('./outreach-whatsapp');

const SESSION = path.resolve(__dirname, '../../.whatsapp-session');

const PROSPECTS = [
  {
    name: 'Yapal Auto Peças',
    phone: '11930498545',
    message: `Boa tarde! Vi o site da Yapal — 40 anos no mercado, catálogo grande, operação séria. Só que quando um comprador busca "autopeças Diadema" no Google ou tenta encontrar a Yapal no LinkedIn antes de ligar, vocês praticamente não aparecem.

Desenvolvo um sistema de captação digital para empresas do setor automotivo — antes de qualquer proposta, faço uma análise gratuita da presença de vocês e mostro o gap real.

Vale 15 minutos?`,
  },
  {
    name: 'Advocacia WR',
    phone: '11984577747',
    message: `Boa tarde! Pesquisei escritórios de advocacia empresarial em Pinheiros e encontrei o WR. Trabalho sólido — mas o site não tem bio dos advogados, não tem conteúdo publicado e o LinkedIn do escritório não tem atividade.

Enquanto isso, concorrentes estão publicando semanalmente e virando referência no segmento.

Desenvolvo um sistema de geração de lead B2B para escritórios via LinkedIn — sem precisar de time de marketing. Posso mostrar o que seria feito no WR, sem compromisso. Faz sentido conversar?`,
  },
  {
    name: 'Máximo Consultoria — Fernanda',
    phone: '11989121102',
    message: `Fernanda, bom dia! Acessei o site da Máximo — vi que a seção de blog ainda está com texto de rascunho e a área de vídeos está vazia.

Com 20+ anos de mercado e uma operação séria de recrutamento executivo, isso é basicamente deixar a prova social fora do ar.

Desenvolvo um sistema que transforma a autoridade de consultoras como você em geração de lead B2B no automático — sem depender de post manual ou agência. Posso mostrar o que seria feito na Máximo em 15 minutos?`,
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
