import { useRef, useState, type FormEvent } from 'react'
import { entrar, type Adm } from '../lib/sessao'

export function Login({ onEntrar }: { onEntrar: (adm: Adm) => void }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const refUsuario = useRef<HTMLInputElement>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    const r = await entrar(usuario, senha)
    setEnviando(false)
    if (r === 'senha' || r === 'rede') {
      setErro(r === 'rede' ? 'Sem internet agora. Tente de novo.' : 'Usuário ou senha não conferem. Tente de novo.')
      refUsuario.current?.focus()
      return
    }
    setSenha('')
    onEntrar(r)
  }

  return (
    <form className="screen" noValidate onSubmit={enviar}>
      <label htmlFor="iUser">
        Usuário
        <span className="field">
          <input
            id="iUser" ref={refUsuario} autoComplete="username" autoCapitalize="none" placeholder="Usuário"
            aria-describedby="eLogin" value={usuario} onChange={(e) => setUsuario(e.target.value)}
          />
        </span>
      </label>
      <label htmlFor="iPass">
        Senha
        <span className="field">
          <input
            id="iPass" type="password" autoComplete="current-password" placeholder="Senha"
            aria-describedby="eLogin" value={senha} onChange={(e) => setSenha(e.target.value)}
          />
        </span>
      </label>
      <p className="err" id="eLogin" role="alert">{erro}</p>
      <button className="btn primary" type="submit" disabled={enviando}>Entrar</button>
    </form>
  )
}
