// Cliente do Supabase. URL e chave pública vêm do .env.local (local) ou do painel da Cloudflare (produção).
// A chave pública pode ir para o navegador: quem protege os dados é o RLS + as funções (decisão 002).
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !chave) {
  throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY. Veja .env.example.')
}

export const supabase = createClient(url, chave, {
  auth: { persistSession: true, autoRefreshToken: true }, // a adm fica conectada no celular (decisão 007)
})

/** Mensagem curta para mostrar na tela quando uma chamada falha. */
export function mensagemDeErro(erro: { message?: string; code?: string } | null | undefined, padrao: string): string {
  if (!erro) return padrao
  if (!navigator.onLine || /fetch|network|Failed to/i.test(erro.message ?? '')) return 'Sem internet agora. Tente de novo.'
  // P0001 = mensagens escritas por nós nas funções do banco, já pensadas para a tela
  if (erro.code === 'P0001' && erro.message) return erro.message
  return padrao
}
