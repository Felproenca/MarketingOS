import crypto from 'node:crypto'

export function required(name) { const value = process.env[name]; if (!value) throw new Error(`Configuração ausente: ${name}`); return value }
function headers() { const key = process.env.SUPABASE_SECRET_KEY || required('SUPABASE_SERVICE_ROLE_KEY'); return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } }
function url(pathname) { return `${required('SUPABASE_URL').replace(/\/$/, '').replace(/\/rest\/v1$/, '')}/rest/v1/${pathname}` }
function key() { const value = Buffer.from(required('DATA_ENCRYPTION_KEY'), 'base64'); if (value.length !== 32) throw new Error('DATA_ENCRYPTION_KEY deve ser base64 de 32 bytes'); return value }
export function encrypt(value) { const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv); const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]); return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${data.toString('base64')}` }
export function decrypt(value) { const [ivText, tagText, dataText] = String(value).split('.'); const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivText, 'base64')); decipher.setAuthTag(Buffer.from(tagText, 'base64')); return Buffer.concat([decipher.update(Buffer.from(dataText, 'base64')), decipher.final()]).toString('utf8') }
export async function db(pathname, options = {}) { const response = await fetch(url(pathname), { ...options, headers: { ...headers(), ...(options.headers || {}) } }); const text = await response.text(); if (!response.ok) throw new Error(`Supabase HTTP ${response.status}: ${text.slice(0, 240)}`); return text ? JSON.parse(text) : null }
