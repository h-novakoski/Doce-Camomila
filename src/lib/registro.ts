// Camada de dados dos registros, no Supabase (migrações em supabase/migrations/).
// Motorista (sem login) só usa as funções registrar / minhas_sacas / avisar_falta (decisão 002).
// Adm (com login) lê a tabela e usa registrar_achados / marcar_resolvido.
import type { Motorista } from './local'
import { mensagemDeErro, supabase } from './supabase'

export type Registro = {
  id: string
  nome: string
  tel: string
  saca: string
  nx: string
  criadoEm: number
  /** Pacotes que o motorista avisou que faltam na saca (0 = nenhum). Decisão 011. */
  faltando: number
  /** Quantos dos pacotes faltando a agência já achou. */
  achados: number
  /** A adm marcou a falta como resolvida (ou achou todos). */
  resolvido: boolean
  /** Chave secreta do registro: só existe no celular do motorista que registrou. */
  chave?: string
}

/** Dias guardados além de hoje: 3 dias no total (decisão 010). */
export const DIAS_ANTERIORES = 2

/** Início do "dia" da operação: o dia vira às 3h (decisão 010). `atras` = quantos dias antes de hoje. */
export function inicioDoDia(atras = 0, agora = new Date()): number {
  const d = new Date(agora)
  if (d.getHours() < 3) d.setDate(d.getDate() - 1)
  d.setDate(d.getDate() - atras)
  d.setHours(3, 0, 0, 0)
  return d.getTime()
}

type Linha = {
  id: string; nome: string; tel: string; saca: string; nx: string; criado_em: string
  faltando: number; achados: number; resolvido: boolean
}

const deLinha = (l: Linha): Registro => ({
  id: l.id, nome: l.nome, tel: l.tel, saca: l.saca, nx: l.nx, criadoEm: Date.parse(l.criado_em),
  faltando: l.faltando, achados: l.achados, resolvido: l.resolvido,
})

/** Cada envio é um registro novo, nunca atualiza (decisão 010). Lança Error com mensagem para a tela. */
export async function registrarSaca(motorista: Motorista, saca: string, nx: string): Promise<Registro> {
  const { data, error } = await supabase.rpc('registrar', {
    p_nome: motorista.nome, p_tel: motorista.tel, p_saca: saca, p_nx: nx,
  })
  const linha = (data as { id: string; chave: string; criado_em: string }[] | null)?.[0]
  if (error || !linha) throw new Error(mensagemDeErro(error, 'Não deu para registrar. Tente de novo.'))
  return {
    id: linha.id, chave: linha.chave, nome: motorista.nome, tel: motorista.tel, saca, nx,
    criadoEm: Date.parse(linha.criado_em), faltando: 0, achados: 0, resolvido: false,
  }
}

/** Adm: registros de hoje, ontem e anteontem, mais recentes primeiro. */
export async function listarRegistros(): Promise<Registro[]> {
  const { data, error } = await supabase
    .from('registros')
    .select('id, nome, tel, saca, nx, criado_em, faltando, achados, resolvido')
    .gte('criado_em', new Date(inicioDoDia(DIAS_ANTERIORES)).toISOString())
    .order('criado_em', { ascending: false })
    .limit(3000)
  if (error) throw new Error(mensagemDeErro(error, 'Não deu para carregar a lista. Tente de novo.'))
  return (data as Linha[]).map(deLinha)
}

/** Motorista: as sacas de hoje dele, pelas chaves guardadas no celular. */
export async function listarMinhas(chaves: string[]): Promise<Registro[]> {
  if (chaves.length === 0) return []
  const { data, error } = await supabase.rpc('minhas_sacas', { p_chaves: chaves })
  if (error) throw new Error(mensagemDeErro(error, 'Não deu para carregar suas sacas.'))
  return (data as (Omit<Linha, 'nome' | 'tel'> & { chave: string })[]).map((l) => ({
    ...deLinha({ ...l, nome: '', tel: '' }), chave: l.chave,
  }))
}

/** Motorista avisa (ou atualiza) quantos pacotes faltam. 0 tira o aviso. Precisa da chave da saca. */
export async function avisarFalta(chave: string, quantidade: number) {
  const { error } = await supabase.rpc('avisar_falta', { p_chave: chave, p_quantidade: quantidade })
  if (error) throw new Error(mensagemDeErro(error, 'Não deu para avisar. Tente de novo.'))
}

/** Adm diz quantos dos pacotes faltando estão na agência. Achou todos = resolvido (no banco). */
export async function registrarAchados(r: Registro, achados: number) {
  const { error } = await supabase.rpc('registrar_achados', { p_id: r.id, p_achados: achados })
  if (error) throw new Error(mensagemDeErro(error, 'Não deu para salvar. Tente de novo.'))
}

/** Adm marca (ou desmarca) a falta como resolvida. */
export async function marcarResolvido(r: Registro, resolvido: boolean) {
  const { error } = await supabase.rpc('marcar_resolvido', { p_id: r.id, p_resolvido: resolvido })
  if (error) throw new Error(mensagemDeErro(error, 'Não deu para salvar. Tente de novo.'))
}

/** Adm: avisa quando chega registro ou muda uma falta (tempo real). Devolve a função para parar. */
export function aoMudar(callback: () => void): () => void {
  const canal = supabase
    .channel('registros-' + Math.random().toString(36).slice(2))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'registros' }, () => callback())
    .subscribe()
  return () => { supabase.removeChannel(canal) }
}
