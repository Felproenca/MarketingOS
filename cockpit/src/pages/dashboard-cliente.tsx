/**
 * Dashboard Cliente — Painel de Controle Automático
 * Mostra: Agenda + Funis + Dados + Insights
 * Dispara: Pipeline automático
 */

import React, { useState, useEffect } from 'react'

export default function DashboardCliente() {
  const [clientId, setClientId] = useState('forca-da-terra')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const ACTIVE_CLIENTS = [
    { id: 'forca-da-terra', name: 'Força da Terra' },
    { id: 'fortunato', name: 'Fortunato' },
    { id: 'bruno-capelli', name: 'Bruno Capelli' },
    { id: 'toqueindiano', name: 'Toque Indiano' },
  ]

  const triggerPipeline = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/orchestrator/master-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_single',
          clientId,
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🎯 Dashboard de Conteúdo Automático</h1>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Selecione seu negócio:</h2>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', minWidth: '200px' }}
        >
          {ACTIVE_CLIENTS.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <button
          onClick={triggerPipeline}
          disabled={loading}
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Gerando conteúdo...' : '🚀 Gerar Conteúdo Automático'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#c33' }}>
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#efe', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>✅ Sucesso!</h3>
          <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>

          {result.ok && (
            <div style={{ marginTop: '20px' }}>
              <h4>📊 Resumo do Ciclo:</h4>
              <ul>
                <li>⏱️ Tempo total: {result.duration}ms</li>
                <li>🎯 Estágio de funil: <strong>{result.funnelStage}</strong></li>
                <li>📋 Brief ID: {result.briefId}</li>
                <li>🎨 Conteúdo ID: {result.contentId}</li>
                <li>📱 Post ID: {result.postId}</li>
                <li>✨ Publicado em: {new Date(result.publishedAt).toLocaleString('pt-BR')}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3>📈 Como funciona?</h3>
        <ol>
          <li><strong>Análise de dados:</strong> Sistema coleta dados do seu Instagram e Google Ads</li>
          <li><strong>Detecção automática:</strong> Identifica qual estágio do funil está faltando conteúdo</li>
          <li><strong>Geração:</strong> Cria conteúdo visual + copy automático</li>
          <li><strong>Publicação:</strong> Publica direto no Instagram com hashtags otimizadas</li>
          <li><strong>Rastreamento:</strong> Acompanha performance e realimenta o sistema</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>📱 Próximos passos:</h3>
        <ul>
          <li>✅ Dashboard: Você está aqui!</li>
          <li>⏳ Agenda editorial: Ver todos os conteúdos propostos</li>
          <li>⏳ Funis: Acompanhar qual estágio cada conteúdo está</li>
          <li>⏳ Insights: Ver performance de cada post</li>
          <li>⏳ Analytics: Gráficos de crescimento e ROI</li>
        </ul>
      </div>
    </div>
  )
}
