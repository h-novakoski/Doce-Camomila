// Login das adms com Supabase Auth (decisão 007).
// Elas digitam só o usuário; por trás vira <usuario>@docecamomila.local.
// Quem é adm e o nome de exibição vêm da tabela `admins` (nada fixo no código).
import { supabase } from './supabase'

export type Adm = { nome: string; senhaTrocada: boolean }

const emailDe = (usuario: string) =>
  usuario.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]/g, '')
  + '@docecamomila.local'

async function admDaSessao(): Promise<Adm | null> {
  const { data, error } = await supabase.from('admins').select('nome, senha_trocada').maybeSingle()
  if (error || !data) return null
  return { nome: data.nome, senhaTrocada: data.senha_trocada }
}

/** Adm já conectada neste celular, ou null. */
export async function lerSessao(): Promise<Adm | null> {
  const { data } = await supabase.auth.getSession()
  return data.session ? admDaSessao() : null
}

/** Entra. Devolve a adm, 'senha' (usuário/senha não conferem) ou 'rede' (sem internet). */
export async function entrar(usuario: string, senha: string): Promise<Adm | 'senha' | 'rede'> {
  if (!usuario.trim() || !senha) return 'senha'
  const { error } = await supabase.auth.signInWithPassword({ email: emailDe(usuario), password: senha })
  if (error) return error.status === 400 ? 'senha' : 'rede'
  const adm = await admDaSessao()
  if (!adm) {
    // conta existe no Auth mas não está em `admins`: não entra
    await supabase.auth.signOut()
    return 'senha'
  }
  return adm
}

/** 1º acesso: troca a senha inicial pela da adm. Devolve mensagem de erro, ou null se deu certo. */
export async function criarSenha(nova: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password: nova })
  if (error) {
    if (/weak|short|characters/i.test(error.message)) return 'Senha fraca. Use pelo menos 8 caracteres.'
    if (/different|same/i.test(error.message)) return 'Use uma senha diferente da inicial.'
    return 'Não deu para salvar a senha. Tente de novo.'
  }
  const r = await supabase.rpc('marcar_senha_trocada')
  return r.error ? 'Não deu para salvar a senha. Tente de novo.' : null
}

export async function sair() {
  await supabase.auth.signOut()
}
