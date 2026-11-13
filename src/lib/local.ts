// O que fica salvo no navegador do motorista (decisão 001). Nada de dados de outros motoristas.
import { DIAS_ANTERIORES, inicioDoDia } from './registro'

export type Motorista = { nome: string; tel: string }
/** Dica do atalho: 'novo' antes do 1º registro, 'mostrar' depois, 'fechada' quando ele dispensa. */
export type Dica = 'novo' | 'mostrar' | 'fechada'

const CHAVE_MOTORISTA = 'camomila-motorista'
const CHAVE_DICA = 'camomila-dica-atalho'
const CHAVE_MINHAS = 'camomila-minhas-sacas'

function ler<T>(chave: string): T | null {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : null
  } catch {
    return null
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // navegador sem storage: segue funcionando, só não lembra na próxima vez
  }
}

export const lerMotorista = () => ler<Motorista>(CHAVE_MOTORISTA)
export const salvarMotorista = (m: Motorista) => gravar(CHAVE_MOTORISTA, m)

export const lerDica = (): Dica => ler<Dica>(CHAVE_DICA) ?? 'novo'
export const salvarDica = (d: Dica) => gravar(CHAVE_DICA, d)

/** Uma saca registrada por este motorista: a chave secreta dela + quando (para limpar depois de 3 dias). */
type Minha = { chave: string; em: number }

/** Guarda só o que está dentro dos 3 dias (decisão 010); o resto some, igual ao servidor. */
function minhasValidas(): Minha[] {
  const desde = inicioDoDia(DIAS_ANTERIORES)
  // formatos antigos (só ids, ou ids do teste local) são descartados
  const lista = (ler<unknown[]>(CHAVE_MINHAS) ?? []).filter(
    (m): m is Minha => typeof m === 'object' && m !== null && 'chave' in m && 'em' in m,
  )
  return lista.filter((m) => m.em >= desde)
}

/** Chaves das sacas que este motorista registrou, para ele avisar falta de pacote depois (decisão 011).
 * Lê e já limpa o que passou dos 3 dias. */
export function lerMinhas(): string[] {
  const validas = minhasValidas()
  gravar(CHAVE_MINHAS, validas)
  return validas.map((m) => m.chave)
}

export const guardarMinha = (chave: string) => gravar(CHAVE_MINHAS, [...minhasValidas(), { chave, em: Date.now() }])
