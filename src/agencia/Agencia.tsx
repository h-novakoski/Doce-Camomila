import { useEffect, useState } from 'react'
import { lerSessao, sair, type Adm } from '../lib/sessao'
import { CriarSenha } from './CriarSenha'
import { Lista } from './Lista'
import { Login } from './Login'

/** Rota `/agencia` (link enviado às adms): login → (1º acesso: crie sua senha) → lista. */
export function Agencia() {
  // undefined = ainda vendo se já está conectada neste celular
  const [adm, setAdm] = useState<Adm | null | undefined>(undefined)

  useEffect(() => { lerSessao().then(setAdm) }, [])

  if (adm === undefined) return null
  if (!adm) return <Login onEntrar={(a) => { setAdm(a); window.scrollTo(0, 0) }} />
  if (!adm.senhaTrocada) return <CriarSenha onPronto={() => setAdm({ ...adm, senhaTrocada: true })} />
  return <Lista adm={adm.nome} onSair={() => { sair(); setAdm(null) }} />
}
