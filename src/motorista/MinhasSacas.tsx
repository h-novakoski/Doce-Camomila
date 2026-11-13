import { useEffect, useRef, useState, type FormEvent } from 'react'
import { IconeWhatsApp } from '../components/Flor'
import { lerMinhas } from '../lib/local'
import { avisarFalta, listarMinhas, type Registro } from '../lib/registro'
import { abrirWhatsApp, linkWaMe } from '../lib/whatsapp'

const hora = (r: Registro) => new Date(r.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const faltam = (n: number) => (n === 1 ? 'Falta 1 pacote' : `Faltam ${n} pacotes`)
const seloTexto = (n: number) => (n === 1 ? 'Falta 1' : `Faltam ${n}`)

/**
 * Carrega as sacas de hoje deste motorista. Recarrega ao voltar para o app e a cada 1 min com a tela aberta
 * (o tempo real do Supabase é só para as adms; o motorista não tem login).
 * Sem internet: mantém o que já estava na tela.
 */
function useMinhas(versao: number) {
  const [sacas, setSacas] = useState<Registro[]>([])
  useEffect(() => {
    let ativo = true
    const carregar = () => listarMinhas(lerMinhas()).then((r) => { if (ativo) setSacas(r) }, () => {})
    carregar()
    const relogio = setInterval(() => { if (!document.hidden) carregar() }, 60_000)
    const aoVoltar = () => { if (!document.hidden) carregar() }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => { ativo = false; clearInterval(relogio); document.removeEventListener('visibilitychange', aoVoltar) }
  }, [versao])
  return [sacas, setSacas] as const
}

/**
 * O aviso de falta de UMA saca (decisão 011): botão → quantidade no teclado numérico → Avisar
 * → "Avisado!" + mandar no grupo. `cheio`: botão largo (tela Registrado); senão, compacto (lista).
 */
function AvisoFalta({ r, nome, cheio, onMudou }: {
  r: Registro
  nome: string
  cheio?: boolean
  onMudou: (faltando: number) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [qtd, setQtd] = useState('')
  const [erro, setErro] = useState('')
  const [avisado, setAvisado] = useState<number | null>(null)
  const refQtd = useRef<HTMLInputElement>(null)
  const corrigindo = r.faltando > 0

  useEffect(() => {
    if (aberto && avisado === null) { refQtd.current?.focus(); refQtd.current?.select() }
  }, [aberto, avisado])

  function abrir() {
    setQtd(r.faltando ? String(r.faltando) : '')
    setErro('')
    setAvisado(null)
    setAberto(true)
  }

  async function avisar(e: FormEvent) {
    e.preventDefault()
    const n = Number(qtd)
    if (qtd === '' || (!corrigindo && n === 0)) { setErro('Digite quantos pacotes faltam.'); refQtd.current?.focus(); return }
    if (!r.chave) { setErro('Essa saca não foi registrada neste celular.'); return }
    try {
      await avisarFalta(r.chave, n)
    } catch (falha) {
      setErro((falha as Error).message)
      return
    }
    onMudou(n)
    setAvisado(n)
  }

  if (r.resolvido) return <span className="selo ok">Resolvido</span>

  if (!aberto) {
    if (corrigindo) {
      return (
        <span className="minha-acoes">
          <span className={'selo' + (r.achados > 0 ? ' parcial' : '')}>
            {r.achados > 0 ? `${r.achados} de ${r.faltando} na agência` : seloTexto(r.faltando)}
          </span>
          <button type="button" className="mini" onClick={abrir}>Atualizar</button>
        </span>
      )
    }
    return cheio
      ? <button type="button" className="btn ghost abrir-falta" onClick={abrir}>Faltou pacote?</button>
      : <button type="button" className="mini" onClick={abrir}>Faltou pacote</button>
  }

  if (avisado !== null) {
    const msg = `Aqui é o ${nome}. ${faltam(avisado)} na saca ${r.saca} / NX ${r.nx}.`
    return (
      <div className="painel" role="status">
        {avisado > 0 ? (
          <>
            <p><b>Avisado!</b> A agência já vê no app.</p>
            <a className="btn zap" href={linkWaMe(null, msg)} target="_blank" rel="noopener" onClick={(e) => abrirWhatsApp(e, null, msg)}>
              <IconeWhatsApp />Mandar no grupo
            </a>
          </>
        ) : (
          <p>Pronto, tiramos o aviso dessa saca.</p>
        )}
        <button type="button" className="btn ghost" onClick={() => setAberto(false)}>Fechar</button>
      </div>
    )
  }

  return (
    <form className="painel" noValidate onSubmit={avisar}>
      <label htmlFor={'q' + r.id}>Quantos pacotes faltam na saca {r.saca}?</label>
      {/* número e "pacotes" juntos no centro; o input tem a largura do número digitado */}
      <span className="field qtd" onClick={() => refQtd.current?.focus()}>
        <input
          id={'q' + r.id} ref={refQtd} className="code" inputMode="numeric" autoComplete="off" placeholder="0"
          style={{ width: `${Math.max(qtd.length, 1) + 0.4}ch` }}
          aria-describedby={'e' + r.id} value={qtd} onChange={(e) => { setQtd(e.target.value.replace(/\D/g, '').slice(0, 3)); setErro('') }}
        />
        <span className="pos" aria-hidden="true">pacotes</span>
      </span>
      <p className="err" id={'e' + r.id} role="alert">{erro}</p>
      <div className="row">
        <button type="button" className="btn ghost" onClick={() => setAberto(false)}>Cancelar</button>
        <button type="submit" className="btn primary">{!corrigindo ? 'Avisar' : qtd === '0' ? 'Não falta' : 'Atualizar'}</button>
      </div>
    </form>
  )
}

/** Tela Registrado: o aviso da saca que acabou de registrar, logo abaixo do ticket. */
export function FaltaDaSaca({ id, nome, versao }: { id: string; nome: string; versao: number }) {
  const [sacas, setSacas] = useMinhas(versao)
  const r = sacas.find((s) => s.id === id)
  if (!r) return null
  return (
    <div className="falta-saca">
      <AvisoFalta r={r} nome={nome} cheio onMudou={(n) => setSacas((l) => l.map((s) => (s.id === id ? { ...s, faltando: n } : s)))} />
    </div>
  )
}

/**
 * As sacas que o motorista registrou hoje, cada uma com "Faltou pacote" (decisão 011).
 * Ele pode avisar a qualquer hora: na bancada, depois de contar, ou no meio da rota.
 * `exceto`: esconde uma saca (a que já aparece em destaque na tela Registrado).
 */
export function MinhasSacas({ nome, versao, exceto, titulo = 'Suas sacas de hoje' }: {
  nome: string
  versao: number
  exceto?: string
  titulo?: string
}) {
  const [todas, setSacas] = useMinhas(versao)
  const sacas = todas.filter((s) => s.id !== exceto)
  if (sacas.length === 0) return null

  return (
    <section className="minhas" aria-labelledby="hMinhas">
      <h2 id="hMinhas">{titulo}</h2>
      {sacas.map((r) => (
        <div className="minha" key={r.id}>
          <div className="minha-linha">
            <div>
              <b>{r.saca}</b> <span>· NX {r.nx}</span>
              <small>{hora(r)}</small>
            </div>
            <AvisoFalta
              r={r} nome={nome}
              onMudou={(n) => setSacas((l) => l.map((s) => (s.id === r.id ? { ...s, faltando: n } : s)))}
            />
          </div>
        </div>
      ))}
    </section>
  )
}
