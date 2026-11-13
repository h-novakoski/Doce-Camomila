import { useRef, useState, type FormEvent } from 'react'
import { formatarTelefone, normalizarTelefone, telefoneValido } from '../lib/telefone'
import type { Motorista } from '../lib/local'

/** 1ª vez: nome + WhatsApp, com confirmação do número antes de salvar. */
export function Cadastro({ onSalvar }: { onSalvar: (m: Motorista) => void }) {
  const [nome, setNome] = useState('')
  const [tel, setTel] = useState('')
  const [erro, setErro] = useState('')
  const [campoErrado, setCampoErrado] = useState<'nome' | 'tel' | null>(null)
  const [pendente, setPendente] = useState<Motorista | null>(null)
  const refNome = useRef<HTMLInputElement>(null)
  const refTel = useRef<HTMLInputElement>(null)
  const refSim = useRef<HTMLButtonElement>(null)

  function continuar(e: FormEvent) {
    e.preventDefault()
    const n = nome.trim()
    const t = normalizarTelefone(tel)
    if (!n) {
      setErro('Faltou seu nome.')
      setCampoErrado('nome')
      refNome.current?.focus()
      return
    }
    if (!telefoneValido(t)) {
      setErro('Esse número não fechou. Use DDD + 9 dígitos, ex.: (41) 99999-9999.')
      setCampoErrado('tel')
      refTel.current?.focus()
      return
    }
    setErro('')
    setCampoErrado(null)
    setPendente({ nome: n, tel: t })
    requestAnimationFrame(() => refSim.current?.focus())
  }

  function corrigir() {
    setPendente(null)
    refTel.current?.focus()
  }

  return (
    <form className="screen" noValidate onSubmit={continuar}>
      <h1>Oi! Primeira vez por aqui?</h1>
      <p className="lead">Só desta vez. Da próxima, é só digitar a saca.</p>
      <label htmlFor="iNome">
        Seu nome
        <span className="field">
          <input
            id="iNome" ref={refNome} autoComplete="given-name" placeholder="Nome" aria-describedby="eCad"
            aria-invalid={campoErrado === 'nome' || undefined}
            value={nome} onChange={(e) => setNome(e.target.value)}
          />
        </span>
      </label>
      <label htmlFor="iTel">
        Seu WhatsApp (com DDD)
        <span className="field">
          <span className="pre" aria-hidden="true">+55</span>
          <input
            id="iTel" ref={refTel} className="code" type="tel" inputMode="numeric" autoComplete="tel-national"
            placeholder="(41) 99999-9999" aria-describedby="eCad"
            aria-invalid={campoErrado === 'tel' || undefined}
            value={tel}
            onChange={(e) => { setTel(formatarTelefone(e.target.value)); setPendente(null) }}
          />
        </span>
      </label>
      <p className="err" id="eCad" role="alert">{erro}</p>
      {pendente ? (
        <div className="confirm">
          <div>Esse é seu WhatsApp?</div>
          <div className="num">{formatarTelefone(pendente.tel)}</div>
          <div className="row">
            <button type="button" className="btn ghost" onClick={corrigir}>Corrigir</button>
            <button type="button" className="btn primary" ref={refSim} onClick={() => onSalvar(pendente)}>Sim</button>
          </div>
        </div>
      ) : (
        <button className="btn primary" type="submit">Continuar</button>
      )}
      <p className="priv">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span>Seu número é só para a agência te avisar de pacote. Tudo some depois de 3 dias.</span>
      </p>
    </form>
  )
}
