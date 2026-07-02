export type StepStatus = 'pending' | 'running' | 'done' | 'error'

export interface MissionStep {
  id: string
  label: string
  status: StepStatus
  log?: string
  completedAt?: string
}

export type MissionMode = 'prospeccao' | 'premium' | 'conteudo' | 'aquisicao'
export type MissionStatus = 'draft' | 'running' | 'done' | 'error' | 'paused'

export interface Mission {
  id: string
  nome: string
  slug: string
  modo: MissionMode
  status: MissionStatus
  createdAt: string
  updatedAt: string
  empresa: string
  urlAtual?: string
  instagram?: string
  nicho: string
  cidade?: string
  oferta: string
  publico: string
  tom: string
  objetivo: string
  observacoes?: string
  steps: MissionStep[]
  referencias?: Reference[]
  previewUrl?: string
  dossiePath?: string
}

export interface Reference {
  id: string
  nome: string
  url?: string
  categoria: 'hero' | 'motion' | 'copy' | 'layout' | 'visual' | 'conversao'
  setor: string[]
  o_que_aproveitar: string[]
  tags: string[]
  thumbnail?: string
}

export interface MotionPattern {
  id: string
  codigo: string
  nome: string
  descricao: string
  uso: string
  indicado: string[]
  framerSnippet?: string
}

export interface CopyPattern {
  id: string
  nome: string
  estrutura: string
  exemplo_ruim: string
  exemplo_bom: string
  quando_usar: string
  nichos: string[]
}

export interface Client {
  slug: string
  nome: string
  nicho: string
  status: 'ativo' | 'prospecto' | 'inativo' | 'demo'
  cidade?: string
  missoes: number
  updatedAt: string
}

export interface Signal {
  id: string
  empresa: string
  nicho: string
  evento: string
  fonte: string
  score: number
  status: 'novo' | 'abordado' | 'negociando' | 'fechado' | 'perdido'
  detectadoEm: string
}
