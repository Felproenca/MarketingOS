import ModulePage from '../../components/ModulePage'

const PIPELINE = [
  { step: '01', label: 'SINAL', desc: 'Lead interage: comenta, visita o site, abre e-mail, responde story.' },
  { step: '02', label: 'SCORE', desc: 'IA pontua o sinal: temperatura, histórico e potencial de compra.' },
  { step: '03', label: 'ABORDAGEM', desc: 'Mensagem personalizada gerada automaticamente. Você aprova em 1 clique.' },
  { step: '04', label: 'FOLLOW-UP', desc: 'Sequência de nurturing automática com gate de aprovação humana.' },
  { step: '05', label: 'PIPELINE', desc: 'Lead qualificado entra no CRM com histórico completo de interações.' },
]

function PipelineViz() {
  return (
    <section style={{ padding: '80px 6vw', borderBottom: '1px solid var(--border)' }}>
      <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>Pipeline</span>
      <h2 style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 'clamp(32px, 4.5vw, 56px)',
        color: 'var(--text)', lineHeight: 1.05, marginBottom: 48,
      }}>
        SINAL → CLIENTE.<br />
        <span style={{ color: '#4DFF91' }}>SISTEMA, NÃO SORTE.</span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {PIPELINE.map((p, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '80px 140px 1fr',
            gap: 0, alignItems: 'stretch',
          }}>
            {/* Step number */}
            <div style={{
              background: i % 2 === 0 ? 'var(--bg-2)' : 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.04em',
              color: 'var(--text-3)', padding: '24px 0',
            }}>
              {p.step}
            </div>
            {/* Label */}
            <div style={{
              background: i % 2 === 0 ? 'var(--bg-2)' : 'var(--bg)',
              border: '1px solid var(--border)', borderLeft: 'none',
              display: 'flex', alignItems: 'center',
              padding: '0 24px',
            }}>
              <span style={{
                fontFamily: 'Anton, sans-serif', fontSize: 16, letterSpacing: '0.04em',
                color: '#4DFF91',
              }}>
                {p.label}
              </span>
            </div>
            {/* Desc */}
            <div style={{
              background: i % 2 === 0 ? 'var(--bg-2)' : 'var(--bg)',
              border: '1px solid var(--border)', borderLeft: 'none',
              padding: '24px 32px',
              display: 'flex', alignItems: 'center',
              fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65,
            }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Aquisicao() {
  return (
    <ModulePage
      label="05"
      name="AGENTE AQUISIÇÃO"
      tagline="O sistema que sabe de onde vai vir o próximo cliente — antes de você precisar buscar."
      accent="#4DFF91"
      intelligence="Acquisition Funnel + DM Engine + Signal Intelligence"
      signal="EM BREVE"
      heroDesc="Aquisição imprevisível é o maior custo de uma empresa. Não porque falta esforço — porque falta sistema. O Agente de Aquisição monitora todos os sinais de interesse, pontua automaticamente e executa o follow-up certo, na hora certa, com aprovação sua."
      sections={[
        {
          icon: '◈',
          title: 'Signal Intelligence',
          body: 'Monitora em tempo real: comentários, DMs, visitas ao site, abertura de e-mails e engajamento em conteúdo. Qualquer sinal de interesse é capturado e pontuado.',
        },
        {
          icon: '◎',
          title: 'Score de Leads',
          body: 'Cada lead recebe uma pontuação dinâmica baseada em comportamento, histórico e potencial de compra. Você foca nos quentes — o sistema cuida dos mornos.',
        },
        {
          icon: '▸',
          title: 'DM Engine',
          body: 'Mensagem personalizada gerada pela IA com contexto do lead, tom da marca e objetivo da conversa. Você aprova com um clique — ou edita e manda.',
        },
        {
          icon: '◐',
          title: 'Funil Automático',
          body: 'Sequência de follow-up com lógica de comportamento. Lead abriu mas não respondeu? Cadência diferente. Lead respondeu? Próximo passo configurado para fechar.',
        },
      ]}
      deliverables={[
        {
          name: 'Mapeamento de Sinais',
          desc: 'Auditoria de onde os leads estão e quais sinais estão sendo ignorados atualmente.',
          time: 'Semana 1',
        },
        {
          name: 'Setup do Score',
          desc: 'Critérios de pontuação configurados para o seu ICP: o que caracteriza um lead quente.',
          time: 'Semana 1',
        },
        {
          name: 'DM Engine ativo',
          desc: 'Sistema de abordagem funcionando: captura o sinal, gera a mensagem, espera aprovação.',
          time: 'Semana 2',
        },
        {
          name: 'Cadência de follow-up',
          desc: 'Sequência de 5–7 pontos de contato com lógica de comportamento e aprovação por etapa.',
          time: 'Semana 2',
        },
        {
          name: 'Dashboard de pipeline',
          desc: 'Painel com leads por temperatura, conversas ativas, histórico e taxa de resposta.',
          time: 'Semana 2',
        },
      ]}
      cta={{
        title: 'AQUISIÇÃO\nOBSERVÁVEL\nE AJUSTÁVEL.',
        body: 'Entre na lista de interesse. O Agente de Aquisição entra em beta com vagas limitadas.',
        btnLabel: 'QUERO A VAGA NO BETA',
      }}
    >
      <PipelineViz />
    </ModulePage>
  )
}
