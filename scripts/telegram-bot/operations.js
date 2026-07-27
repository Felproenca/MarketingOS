'use strict';

const CLIENTS = {
  toqueindiano: {
    label: 'Toque Indiano',
    objective: 'Transformar audiencia e conteudo publicado em conversas comerciais e vendas rastreaveis.',
    primaryMetric: 'vendas atribuiveis ao digital',
    funnel: ['alcance', 'visita ao perfil', 'clique no WhatsApp', 'conversa', 'pedido', 'pagamento'],
    priorities: [
      'Instalar rastreamento minimo: links UTM, origem no WhatsApp e planilha de pedidos.',
      'Auditar 20 conversas recentes para localizar a quebra entre interesse e pagamento.',
      'Executar uma oferta de produto/colecao com CTA, prazo e roteiro de atendimento.',
    ],
    blockers: [
      'Sem acesso delegado aos dados do Instagram e WhatsApp.',
      'Historico de vendas digitais nao consolidado.',
      'Atendimento concentrado em uma pessoa.',
    ],
  },
  fortunato: {
    label: 'Fortunato',
    objective: 'Validar tecnicamente um funil simples e produzir prova mensuravel para evoluir o piloto.',
    primaryMetric: 'pessoas que avancam do conteudo para o canal de relacionamento',
    funnel: ['alcance', 'visita', 'captura', 'WhatsApp/comunidade', 'interesse qualificado', 'conversao'],
    priorities: [
      'Definir uma unica oferta de entrada e uma promessa verificavel.',
      'Instrumentar site, links, Instagram e canal de relacionamento antes de publicar mais.',
      'Criar uma campanha coerente: conteudo, pagina/CTA, captura e follow-up.',
    ],
    blockers: [
      'Dashboard, automacoes e eventos de conversao ainda nao implantados.',
      'Funil e pecas sem uma narrativa unica.',
      'Acessos delegados aos canais ainda pendentes.',
    ],
  },
};

const ALIASES = {
  toque: 'toqueindiano',
  'toque-indiano': 'toqueindiano',
  toqueindiano: 'toqueindiano',
  fortunato: 'fortunato',
};

function resolveClient(value) {
  return ALIASES[String(value || '').trim().toLowerCase()] || null;
}

module.exports = { CLIENTS, resolveClient };
