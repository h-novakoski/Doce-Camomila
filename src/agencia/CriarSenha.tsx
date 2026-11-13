import { useEffect, useRef, useState, type FormEvent } from 'react'
import { criarSenha } from '../lib/sessao'

/** 1º acesso da adm (decisão 007): troca a senha inicial por uma dela, digitada duas vezes. */
export function CriarSenha({ onPronto }: { onPronto: () => void }) {
  const [senha, setSenha] = useState('')
  const [repetir, setRepetir] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const refSenha = useRef<HTMLInputElement>(null)

  useEffect(() => { refSenha.current?.focus() }, [])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    if (senha.length < 8) { setErro('Use pelo menos 8 caracteres.'); refSenha.current?.focus(); return }
    if (senha !== repetir) { setErro('As duas senhas não são iguais.'); return }
    setEnviando(true)
    const falha = await criarSenha(senha)
    setEnviando(false)
    if (falha) { setErro(falha); return }
    onPronto()
  }

  return (
    <form className="screen" noValidate onSubmit={enviar}>
      <h1>Crie sua senha</h1>
      <label htmlFor="iNova">
        Nova senha
        <span className="field">
          <input
            id="iNova" ref={refSenha} type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"
            aria-describedby="eSenha" value={senha} onChange={(e) => { setSenha(e.target.value); setErro('') }}
          />
        </span>
      </label>
      <label htmlFor="iRepetir">
        Repita a senha
        <span className="field">
          <input
            id="iRepetir" type="password" autoComplete="new-password" placeholder="Repita a senha"
            aria-describedby="eSenha" value={repetir} onChange={(e) => { setRepetir(e.target.value); setErro('') }}
          />
        </span>
      </label>
      <p className="err" id="eSenha" role="alert">{erro}</p>
      <button className="btn primary" type="submit" disabled={enviando}>Salvar senha</button>
    </form>
  )
}
