import ModulePage from '../../components/ModulePage'

const NETWORKS = [
  { name: 'Instagram', icon: '◈', desc: 'Feed + Reels + Stories com publicação direta via API.' },
  { name: 'LinkedIn', icon: '◎', desc: 'Posts de autoridade, carrosséis e artigos longos.' },
  { name: 'TikTok', icon: '▸', desc: 'Roteiros, legendas e upload automatizado.' },
  { name: 'YouTube', icon: '◐', desc: 'Títulos, descrições, tags e thumbnails.' },
  { name: 'Facebook', icon: '◇', desc: 'Feed e stories sincronizados com Instagram.' },
  { name: 'X / Twitter', icon: '○', desc: 'Threads de autoridade e posts de distribuição.' },
]

function NetworkGrid() {
  return (
    <section style={{ padding: '80px 6vw', borderBottom: '1px solid var(--border)' }}>
      <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>Cobertura</span>
      <h2 style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 'clamp(32px, 4.5vw, 56px)',
        color: 'var(--text)', lineHeight: 1.05, marginBottom: 48,
      }}>
        TODAS AS REDES,<br />
        <span style={{ color: '#00D4FF' }}>UM SISTEMA.</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {NETWORKS.map((n, i) => (
          <div key={i} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            padding: '28px 24px',
          }}>
            <div style={{
              fontFamily: 'monospace', fontSize: 18, color: '#00D4FF', marginBottom: 14, lineHeight: 1,
            }}>
              {n.icon}
            </div>
            <div style={{
              fontFamily: 'Anton, sans-serif', fontSize: 17, letterSpacing: '0.02em',
              color: 'var(--text)', marginBottom: 10,
            }}>
              {n.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>
              {n.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Social() {
  return (
    <ModulePage
      label="03"
      name="AGENTE SOCIAL"
      tagline="Todas as redes operam como sistema de aquisição — não como canal de conteúdo."
      accent="#00D4FF"
      intelligence="Topic Intelligence + Content Engine + Publishing API"
      signal="EM BREVE"
      heroDesc="Conteúdo sem estratégia é ruído. O Agente Social pesquisa o que o mercado quer ouvir, planeja uma pauta alinhada à aquisição, cria as peças e publica com aprovação humana — em até 6 redes simultaneamente. Você aprova. A IA executa."
      sections={[
        {
          icon: '◈',
          title: 'Topic Intelligence',
          body: 'Pesquisa semanal de temas: YouTube, TikTok, LinkedIn, Google Trends. Identifica o que está crescendo, o que está saturado e onde há oportunidade de autoridade.',
        },
        {
          icon: '◎',
          title: 'Pauta Estratégica',
          body: 'Grade editorial semanal com distribuição 70/20/10: 70% problemas universais, 20% build in public, 10% casos específicos. Alinhada ao gargalo de aquisição atual.',
        },
        {
          icon: '▸',
          title: 'Criação Multicanal',
          body: 'Uma ideia, seis formatos. Copy adaptada para cada rede, visual com DNA da marca, legenda e hashtags otimizados. Aprovação por peça antes de publicar.',
        },
        {
          icon: '◐',
          title: 'Publicação e Análise',
          body: 'Publicação direta via API (Meta, LinkedIn). Relatório semanal de performance: alcance, engajamento e — o que importa — leads gerados por canal.',
        },
      ]}
      deliverables={[
        {
          name: 'Diagnóstico de Canal',
          desc: 'Auditoria do que já existe: o que performa, o que afasta e onde está o gap de aquisição.',
          time: 'Semana 1',
        },
        {
          name: 'Grade Editorial',
          desc: 'Pauta mensal com temas, formatos, redes e objetivos de aquisição por publicação.',
          time: 'Semana 1',
        },
        {
          name: 'Peças semanais',
          desc: '8–12 peças por semana entre todas as redes. Feed, reels, carrosséis e stories.',
          time: 'Recorrente',
        },
        {
          name: 'Publicação com aprovação',
          desc: 'Você recebe um preview de cada peça antes da publicação. Um clique para aprovar.',
          time: 'Diário',
        },
        {
          name: 'Relatório de aquisição',
          desc: 'Semanal: o que publicamos, o que performou, o que gerou lead e o que ajustamos.',
          time: 'Semanal',
        },
      ]}
      cta={{
        title: 'SUAS REDES\nEM MODO\nSISTEMA.',
        body: 'Entre na lista de interesse e seja o primeiro a saber quando o Agente Social entrar em operação.',
        btnLabel: 'ENTRAR NA LISTA',
      }}
    >
      <NetworkGrid />
    </ModulePage>
  )
}
