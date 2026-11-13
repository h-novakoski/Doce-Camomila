import { useCallback, useEffect, useRef, useState } from 'react'
import { FlorCheck, IconeWhatsApp } from '../components/Flor'
import { LINK_GRUPO_WHATSAPP } from '../lib/config'
import type { Registro } from '../lib/registro'
import { FaltaDaSaca, MinhasSacas } from './MinhasSacas'

/** Sucesso: saca e NX grandes para conferir, aviso de falta dessa saca, outras sacas de hoje e grupo. */
export function Registrado({ nome, registro, versao, mostrarDica, onFecharDica, onNova }: {
  nome: string
  versao: number
  registro: Registro
  mostrarDica: boolean
  onFecharDica: () => void
  onNova: () => void
}) {
  const refTitulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => { refTitulo.current?.focus() }, [])

  // Enquanto algum aviso de falta mostra "Mandar no grupo", some o "Abrir grupo" de baixo (1 botão de grupo só).
  const [comAviso, setComAviso] = useState<string[]>([])
  const onGrupo = useCallback((id: string, mostrando: boolean) => {
    setComAviso((l) => (mostrando ? (l.includes(id) ? l : [...l, id]) : l.filter((x) => x !== id)))
  }, [])

  return (
    <section className="screen centro">
      <div className="done">
        <FlorCheck />
        <h1 ref={refTitulo} tabIndex={-1}>Registrado, {nome}!</h1>
      </div>
      <div className="ticket">
        <div><small>Saca</small><b>{registro.saca}</b></div>
        <span className="sep" />
        <div><small>NX</small><b>{registro.nx}</b></div>
      </div>
      <FaltaDaSaca id={registro.id} nome={nome} versao={versao} onGrupo={onGrupo} />
      <button className="btn ghost" type="button" onClick={onNova}>Registrar outra saca</button>
      {mostrarDica && (
        <div className="install">
          <p><b>Quer um atalho?</b> Menu do navegador → Adicionar à tela inicial. Sem baixar nada.</p>
          <div className="row">
            <button className="btn ghost" type="button" onClick={onFecharDica}>Agora não</button>
            <button className="btn ghost" type="button" onClick={onFecharDica}>Entendi</button>
          </div>
        </div>
      )}
      <MinhasSacas nome={nome} versao={versao} exceto={registro.id} titulo="Outras sacas de hoje" onGrupo={onGrupo} />
      <div className="group" hidden={comAviso.length > 0}>
        <p>Outro assunto? Fale com a agência no grupo.</p>
        <a className="btn zap" href={LINK_GRUPO_WHATSAPP} target="_blank" rel="noopener">
          <IconeWhatsApp />
          Abrir grupo no WhatsApp
        </a>
      </div>
    </section>
  )
}
