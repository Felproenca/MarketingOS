import ModulePage from '../../components/ModulePage'

export default function SiteGeral() {
  return (
    <ModulePage
      label="01"
      name="SITE INTELIGENTE"
      tagline="Seu site diagnosticado e reescrito pela percepção real do mercado."
      accent="#D4FF00"
      intelligence="Perception Engine + Commercial Audit Layer"
      signal="ATIVO"
      heroDesc="A maioria dos sites falha antes de começar: são construídos sem entender o que o cliente sente ao chegar. Mapeamos a percepção real — o que confunde, o que não converte, o que deveria provocar mas não provoca — e entregamos um site novo que resolve isso."
      sections={[
        {
          icon: '◈',
          title: 'Auditoria Comercial',
          body: 'Análise do site atual em 6 camadas: percepção inicial, clareza de oferta, prova social, CTA, funil visual e velocidade. Cada gargalo identificado com evidência — não opinião.',
        },
        {
          icon: '◎',
          title: 'Perception Engine',
          body: 'Sistema de inteligência que mapeia o que o mercado percebe da marca — sem perguntar. Cruza linguagem do setor, concorrentes e sinais digitais para construir o DNA da percepção.',
        },
        {
          icon: '▸▸',
          title: 'Copy de Aquisição',
          body: 'Toda palavra do site é escrita para mover um estado mental específico: de "estou procurando" para "quero falar com eles". Hierarquia de copy construída por intenção, não por formato.',
        },
        {
          icon: '◐',
          title: 'Direção Visual',
          body: 'DNA visual único derivado da percepção mapeada. Paleta, tipografia, espaço e movimento escolhidos para provocar a emoção certa no momento certo. Nenhum template.',
        },
      ]}
      deliverables={[
        {
          name: 'Relatório de Auditoria',
          desc: 'Diagnóstico completo do site atual: o que quebra a confiança, o que não converte e por quê. Com evidências e prioridades.',
          time: 'Dia 2',
        },
        {
          name: 'Perception Map',
          desc: 'JSON estruturado com DNA de percepção da marca: como o mercado enxerga, o que associa e o que ignora.',
          time: 'Dia 3',
        },
        {
          name: 'Copy completa',
          desc: 'Todos os textos do site novos — hero, seções, CTAs, rodapé. Escrita para aquisição, não para preencher espaço.',
          time: 'Dia 7',
        },
        {
          name: 'Site publicado',
          desc: 'Site novo no ar com direção visual única, motion design, copy de aquisição e analytics configurado.',
          time: 'Dia 14',
        },
        {
          name: 'Relatório 30 dias',
          desc: 'Comparativo de performance antes vs. depois: taxa de conversão, tempo na página, bounce rate e leads gerados.',
          time: 'Dia 44',
        },
      ]}
      cta={{
        title: 'SEU SITE\nESTÁ\nCONVERTENDO?',
        body: 'Diagnóstico gratuito de 48h. Mapeamos os 3 maiores gargalos do seu site atual — sem compromisso de contratação.',
        btnLabel: 'QUERO O DIAGNÓSTICO',
      }}
    />
  )
}
