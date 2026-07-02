import ModulePage from '../../components/ModulePage'

const PLATFORMS = [
  { name: 'Meta Ads', sub: 'Facebook + Instagram', accent: '#FF6B35' },
  { name: 'Google Ads', sub: 'Search + Display + YouTube', accent: '#FF6B35' },
  { name: 'LinkedIn Ads', sub: 'B2B + Retargeting', accent: '#FF6B35' },
]

function PlatformRow() {
  return (
    <section style={{ padding: '80px 6vw', borderBottom: '1px solid var(--border)' }}>
      <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>Plataformas</span>
      <h2 style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 'clamp(32px, 4.5vw, 56px)',
        color: 'var(--text)', lineHeight: 1.05, marginBottom: 48,
      }}>
        TRÁFEGO QUE<br />
        <span style={{ color: '#FF6B35' }}>FECHA NEGÓCIO.</span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {PLATFORMS.map((p, i) => (
          <div key={i} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            padding: '24px 32px',
            display: 'grid', gridTemplateColumns: '200px 1fr',
            gap: 32, alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontFamily: 'Anton, sans-serif', fontSize: 20, letterSpacing: '0.02em', color: 'var(--text)',
              }}>
                {p.name}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-3)' }}>
                {p.sub}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Diagnóstico de conta', 'Criação de campanhas', 'A/B copy + creative', 'Otimização semanal', 'Relatório de custo/lead'].map(tag => (
                <span key={tag} style={{
                  fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.08em',
                  padding: '4px 10px',
                  background: `${p.accent}10`, border: `1px solid ${p.accent}25`,
                  color: p.accent, borderRadius: 20,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Trafego() {
  return (
    <ModulePage
      label="04"
      name="AGENTE TRÁFEGO"
      tagline="Mídia paga com inteligência de diagnóstico — não de volume."
      accent="#FF6B35"
      intelligence="Acquisition Intelligence + Funnel Diagnostics + Signal Layer"
      signal="EM BREVE"
      heroDesc="A maioria das contas de mídia paga tem o problema errado: a campanha funciona, mas o funil quebra depois do clique. O Agente de Tráfego monitora toda a jornada — do anúncio ao CRM — e identifica onde o dinheiro está sendo desperdiçado."
      sections={[
        {
          icon: '◈',
          title: 'Diagnóstico de Conta',
          body: 'Auditoria completa da conta existente: o que está queimando verba, onde o funil quebra, qual copy está convertendo e o que o algoritmo está aprendendo errado.',
        },
        {
          icon: '◎',
          title: 'Estratégia por Gargalo',
          body: 'Campanha estruturada pelo gargalo real — não pelo objetivo do Facebook. Se o problema é custo por lead, trabalhamos copy. Se é conversão pós-clique, trabalhamos landing.',
        },
        {
          icon: '▸',
          title: 'Creative Intelligence',
          body: 'Geração de variantes de copy e criativo com testes sistemáticos. A IA identifica padrões de performance e descarta hipóteses sem esperar o budget acabar.',
        },
        {
          icon: '◐',
          title: 'Monitoramento Contínuo',
          body: 'Alertas automáticos de anomalias: custo subindo, CTR caindo, frequência alta. Ajustes executados na hora — não na próxima reunião quinzenal.',
        },
      ]}
      deliverables={[
        {
          name: 'Auditoria de Conta',
          desc: 'Relatório de diagnóstico: o que está errado, o que está funcionando e o plano de ação.',
          time: 'Dia 3',
        },
        {
          name: 'Estrutura de Campanha',
          desc: 'Setup completo de campanhas, audiências e criativos iniciais. Com pixels e rastreamento configurados.',
          time: 'Semana 1',
        },
        {
          name: 'Testes A/B semanais',
          desc: '2–4 variantes de copy e creative por semana. Eliminação sistemática do que não funciona.',
          time: 'Recorrente',
        },
        {
          name: 'Relatório de custo/lead',
          desc: 'Semanal: quanto foi investido, quantos leads gerados, custo por lead e tendência.',
          time: 'Semanal',
        },
        {
          name: 'Otimização contínua',
          desc: 'Ajustes de lances, audiências e criativos sem precisar de aprovação para cada mudança técnica.',
          time: 'Diário',
        },
      ]}
      cta={{
        title: 'TRÁFEGO\nQUE FECHA\nNEGÓCIO.',
        body: 'Entre na lista de interesse. Quando o Agente de Tráfego entrar em beta, você é o primeiro a ser chamado.',
        btnLabel: 'ENTRAR NA LISTA',
      }}
    >
      <PlatformRow />
    </ModulePage>
  )
}
