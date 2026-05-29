'use strict';

function render(template, lead, extra = {}) {
  const vars = {
    nome: lead.name || 'olá',
    cidade: lead.city || extra.city || '',
    categoria: lead.category || '',
    site: lead.website || '',
    telefone: lead.phone || (lead.phones?.[0] || ''),
    ...extra,
  };

  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

const DEFAULT_WHATSAPP = `Olá, {{nome}}! 👋

Vi que vocês são de {{cidade}} e fiquei curioso para conhecer melhor o trabalho de vocês.

Trabalho com marketing digital e ajudo negócios como o de vocês a crescerem online — seja com presença nas redes, campanhas pagas ou estratégia de conteúdo.

Posso compartilhar algumas ideias sem compromisso?

Abraços!`;

const DEFAULT_EMAIL_SUBJECT = `Uma ideia para {{nome}}`;

const DEFAULT_EMAIL_HTML = `<p>Olá, <strong>{{nome}}</strong>!</p>

<p>Encontrei o negócio de vocês e gostaria de trocar uma ideia rápida sobre marketing digital.</p>

<p>Trabalho ajudando empresas de {{cidade}} a crescerem online — com estratégia de conteúdo, presença em redes sociais e campanhas que geram resultado real.</p>

<p>Posso enviar algumas sugestões personalizadas para vocês, sem nenhum compromisso?</p>

<p>Responda esse email ou me chame no WhatsApp.</p>

<p>Abraços!</p>`;

module.exports = { render, DEFAULT_WHATSAPP, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_HTML };
