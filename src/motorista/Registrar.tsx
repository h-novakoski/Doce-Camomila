import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

const soNumeros = (v: string) => v.replace(/\D/g, '')

/** Saca e NX lado a lado, os dois obrigatórios, só números. `children` vai embaixo (as sacas de hoje). */
export function Registrar({ nome, enviando, onRegistrar, children }: {
  nome: string
  enviando: boolean
  onRegistrar: (saca: string, nx: string) => Promise<string | void>
  children?: ReactNode
}) {
  const [saca, setSaca] = useState('')
  const [nx, setNx] = useState('')
  const [erro, setErro] = useState('')
  const refSaca = useRef<HTMLInputElement>(null)
  const refNx = useRef<HTMLInputElement>(null)

  useEffect(() => { refSaca.current?.focus() }, [])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    if (!saca) { setErro('Faltou o número da saca.'); refSaca.current?.focus(); return }
    if (!nx) { setErro('Faltou o NX.'); refNx.current?.focus(); return }
    setErro('')
    const falha = await onRegistrar(saca, nx)
    if (falha) setErro(falha)
  }

  return (
    <div className="screen">
      <form className="pilha" noValidate onSubmit={enviar}>
        <h1>Oi, {nome}!</h1>
        <p className="lead">Qual a saca de agora?</p>
        <div className="pair">
          <label htmlFor="iSaca">
            <span className="sr">Saca</span>
            <span className="field">
              <span className="pre" aria-hidden="true">Saca</span>
              <input
                id="iSaca" ref={refSaca} className="code" inputMode="numeric" placeholder="000" autoComplete="off"
                aria-describedby="tReg eReg" value={saca} onChange={(e) => setSaca(soNumeros(e.target.value))}
              />
            </span>
          </label>
          <label htmlFor="iNx">
            <span className="sr">NX</span>
            <span className="field">
              <span className="pre" aria-hidden="true">NX</span>
              <input
                id="iNx" ref={refNx} className="code" inputMode="numeric" placeholder="000" autoComplete="off"
                aria-describedby="tReg eReg" value={nx} onChange={(e) => setNx(soNumeros(e.target.value))}
              />
            </span>
          </label>
        </div>
        <p className="tip" id="tReg">Preencha os dois: saca e NX.</p>
        <p className="err" id="eReg" role="alert">{erro}</p>
        <button className="btn primary" type="submit" disabled={enviando}>Registrar saca</button>
      </form>
      {children}
    </div>
  )
}
