'use strict';

const path = require('path');
const { generateDemo } = require('../demo-pipeline/demo-generator');
const { extractBrand } = require('../demo-pipeline/brand-extractor');

// Palavras que indicam interesse real (humano engajado)
const INTEREST_SIGNALS = [
  'sim', 'quero', 'queria', 'interess', 'gost', 'legal', 'show', 'ótimo', 'otimo',
  'claro', 'pode', 'manda', 'mande', 'ver', 'vejo', 'curioso', 'como', 'o que',
  'funcionaria', 'funciona', 'conta', 'fala', 'mais', 'bacana', 'incrível', 'incrivel',
];

// Palavras que indicam pergunta sobre preço/processo → oferecer call
const CALL_SIGNALS = [
  'quanto', 'preço', 'preco', 'valor', 'custa', 'custo', 'contrato', 'plano',
  'funciona como', 'como funciona', 'o que é', 'o que e', 'explica',
];

// Palavras que indicam bot / resposta automática → ignorar
const BOT_SIGNALS = [
  'atendimento automático', 'atendimento automatico', 'horário de atendimento',
  'horario de atendimento', 'fora do horário', 'fora do horario',
  'nossa equipe', 'em breve', 'aguarde', 'obrigado por entrar em contato',
  'obrigada por entrar em contato', 'recebemos sua mensagem', 'protocolo',
  'número de protocolo', 'bot', 'assistente virtual', 'chatbot',
];

function classifyMessage(text) {
  const lower = text.toLowerCase();

  if (BOT_SIGNALS.some(s => lower.includes(s))) return 'bot';
  if (CALL_SIGNALS.some(s => lower.includes(s))) return 'wants_call';
  if (INTEREST_SIGNALS.some(s => lower.includes(s))) return 'interested';

  // Mensagem muito curta e genérica (ex: "oi", "ok", "👍") → tratar como interesse
  if (text.trim().length < 20) return 'interested';

  return 'interested'; // default: engaja
}

function shortName(fullName) {
  if (!fullName) return 'vocês';
  return fullName.split(/[,\-\|(\[]/)[0].trim().split(' ').slice(0, 2).join(' ');
}

async function handleReply(contact, messageText, sendFn) {
  const intent = classifyMessage(messageText);
  const name = shortName(contact.name);

  console.log(`   💬 ${name} → intent: ${intent} | step: ${contact.step}`);

  // Bot detectado — ignora silenciosamente
  if (intent === 'bot') {
    console.log(`   🤖 Bot detectado — ignorando`);
    return { action: 'ignored', nextStep: contact.step };
  }

  // Já enviou demo — oferece call
  if (contact.step === 'demo_sent') {
    if (intent === 'wants_call' || intent === 'interested') {
      await sendFn(`Fico feliz que curtiu! 🙌\n\nMelhor te mostrar ao vivo como o sistema funcionaria especificamente para a ${name}. São só 15 minutos.\n\nQual dia e horário fica melhor pra você essa semana?`);
      return { action: 'call_offered', nextStep: 'call_offered' };
    }
  }

  // Já ofereceu call — não insiste
  if (contact.step === 'call_offered') {
    return { action: 'waiting', nextStep: 'call_offered' };
  }

  // Primeiro reply — classifica e age
  if (contact.step === 'sent' || contact.step === 'replied') {

    if (intent === 'wants_call') {
      await sendFn(`Boa pergunta! Melhor te mostrar ao vivo — fica muito mais claro do que explicar por aqui.\n\nSão só 15 minutos e você já vai sair sabendo exatamente o que o sistema faria pela ${name}. 📅\n\nQual dia fica bom pra você essa semana?`);
      return { action: 'call_offered', nextStep: 'call_offered' };
    }

    if (intent === 'interested') {
      // Primeiro responde com engajamento
      if (contact.step === 'sent') {
        await sendFn(`Oi! Que bom que viu 👋\n\nO sistema lê a identidade visual de vocês e gera conteúdo pronto pra publicar — sem precisar de designer ou agência. Cada post já sai com a cor, o nome e o estilo da ${name}.\n\nQuer que eu mostre um exemplo completo com a marca de vocês?`);
        return { action: 'engaged', nextStep: 'replied' };
      }

      // Segunda resposta positiva → envia demo
      if (contact.step === 'replied') {
        await sendFn(`Gerando agora... 🔄`);

        try {
          const segment = contact.segment || 'clinica';
          const brand = contact.website
            ? await extractBrand(contact.website)
            : { name: contact.name, color: '#2563eb', extracted: false, signals: {}, content: {} };

          brand.name = brand.name || contact.name;

          const date = new Date().toISOString().slice(0, 10);
          const slug = (contact.name || 'lead').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
          const demoDir = path.resolve(__dirname, '../../agency/demos', slug);
          const prefix = `${date}-bot-${slug}`;

          const [demoFile] = await generateDemo(segment, brand, demoDir, prefix, contact);

          const { MessageMedia } = require('whatsapp-web.js');
          const media = MessageMedia.fromFilePath(demoFile);
          await sendFn(media);
          await new Promise(r => setTimeout(r, 1500));
          await sendFn(`Esse é um exemplo do que o sistema geraria toda semana para a ${name}. 👆\n\nSe quiser ver como funciona ao vivo, me fala um horário bom essa semana 📅`);

          return { action: 'demo_sent', nextStep: 'demo_sent' };
        } catch (err) {
          console.error(`   ✗ Erro ao gerar demo: ${err.message}`);
          await sendFn(`Deixa eu gerar um exemplo personalizado pra vocês e te mando em seguida. Me passa o site ou Instagram da ${name}?`);
          return { action: 'demo_error', nextStep: 'replied' };
        }
      }
    }
  }

  return { action: 'noop', nextStep: contact.step };
}

module.exports = { handleReply };
