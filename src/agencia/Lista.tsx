import { useEffect, useRef, useState, type FormEvent } from 'react'
import { IconeWhatsApp } from '../components/Flor'
import { LINK_GRUPO_WHATSAPP } from '../lib/config'
import { aoMudar, DIAS_ANTERIORES, inicioDoDia, listarRegistros, marcarResolvido, registrarAchados, type Registro } from '../lib/registro'
import { abrirConversa, abrirWhatsApp, linkWaMe } from '../lib/whatsapp'

const primeiroNome = (nome: string) => nome.split(' ')[0]

/** Os dias guardados (decisão 010): hoje, ontem, anteontem — dia da semana ("Qui") e data ("12/11"). */
function diasDaLista() {
  return Array.from({ length: DIAS_ANTERIORES + 1 }, (_, atras) => {
    const inicio = inicioDoDia(atras)
    const fim = atras === 0 ? Infinity : inicioDoDia(atras - 1)
    const d = new Date(inicio)
    const semana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    const nome = semana[0].toUpperCase() + semana.slice(1)
    const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    return { atras, nome, data, contem: (r: Registro) => r.criadoEm >= inicio && r.criadoEm < fim }
  })
}

type Dia = ReturnType<typeof diasDaLista>[number] & { linhas: Registro[]; pendentes: number }

const pendente = (r: Registro) => r.faltando > 0 && !r.resolvido

/** Botão de um dia: "Qui" em cima, "12/11" embaixo (na busca, a contagem). Hoje é o cartão maior, separado. */
function BotaoDia({ dia, escolhido, buscando, onEscolher }: {
  dia: Dia
  escolhido: boolean
  buscando: boolean
  onEscolher: () => void
}) {
  const ehHoje = dia.atras === 0
  const n = dia.linhas.length
  const classe = [ehHoje && 'hoje', dia.pendentes > 0 && 'tem-falta'].filter(Boolean).join(' ') || undefined
  return (
    <button
      type="button" className={classe} aria-pressed={escolhido} onClick={onEscolher}
      aria-label={`${ehHoje ? 'Hoje, ' : ''}${dia.nome} ${dia.data}` + (buscando ? `, ${n} ${n === 1 ? 'encontrado' : 'encontrados'}` : '')
        + (dia.pendentes > 0 ? `, ${dia.pendentes} com pacote faltando` : '')}
    >
      <b>{dia.nome}</b>
      {buscando ? <span className={'achou' + (n ? '' : ' zero')}>{n}</span> : <small>{dia.data}</small>}
    </button>
  )
}

/** Pinta de amarelo o trecho achado pela busca. */
function Destaque({ texto, busca }: { texto: string; busca: string }) {
  const i = busca ? texto.toLowerCase().indexOf(busca) : -1
  if (i < 0) return <>{texto}</>
  return <>{texto.slice(0, i)}<mark>{texto.slice(i, i + busca.length)}</mark>{texto.slice(i + busca.length)}</>
}

const horaDe = (r: Registro) =>
  new Date(r.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** Texto do selo de falta: "Faltam 5", "3 de 5 aqui" ou "✓ Resolvido". */
function textoSelo(r: Registro) {
  if (r.resolvido) return '✓ Resolvido'
  if (r.achados > 0) return `${r.achados} de ${r.faltando} aqui`
  return r.faltando === 1 ? 'Falta 1' : `Faltam ${r.faltando}`
}

/** Mensagem ao motorista dizendo quantos dos pacotes faltando a agência achou. */
function msgAchados(r: Registro, adm: string, n: number) {
  const ola = `Oi, ${primeiroNome(r.nome)}! É a ${adm}, da Doce Camomila.`
  const ref = `saca ${r.saca} / NX ${r.nx}`
  if (n >= r.faltando) {
    return r.faltando === 1
      ? `${ola} O pacote que você avisou que faltou na ${ref} está aqui. Pode passar para buscar.`
      : `${ola} Os ${r.faltando} pacotes que você avisou que faltaram na ${ref} estão aqui. Pode passar para buscar.`
  }
  return `${ola} Dos ${r.faltando} pacotes que você avisou que faltaram na ${ref}, ${n === 1 ? '1 está aqui' : `${n} estão aqui`}. Pode passar para buscar.`
}

/**
 * Painel embaixo da linha (decisão 011): a adm diz quantos dos pacotes faltando estão na agência
 * e avisa o motorista no WhatsApp. Achou todos = resolvido.
 */
function PainelAchados({ r, adm, onFechar, onMudou, onErro }: {
  r: Registro; adm: string; onFechar: () => void; onMudou: () => void; onErro: (msg: string) => void
}) {
  const [qtd, setQtd] = useState(String(r.achados || r.faltando))
  const [erro, setErro] = useState('')
  const refQtd = useRef<HTMLInputElement>(null)

  useEffect(() => { refQtd.current?.focus(); refQtd.current?.select() }, [])

  function salvar(e: FormEvent) {
    e.preventDefault()
    const n = Number(qtd)
    if (!qtd || n < 1 || n > r.faltando) {
      setErro(`Digite de 1 a ${r.faltando}.`)
      refQtd.current?.focus()
      return
    }
    // Abre o WhatsApp antes de salvar, ainda dentro do toque (o navegador bloqueia se vier depois).
    abrirConversa(r.tel, msgAchados(r, adm, n))
    registrarAchados(r, n).then(onMudou, (f: Error) => onErro(f.message))
    onFechar()
  }

  async function resolverSemAvisar() {
    try {
      await marcarResolvido(r, true)
    } catch (f) {
      setErro((f as Error).message)
      return
    }
    onMudou()
    onFechar()
  }

  return (
    <form className="painel achados" noValidate onSubmit={salvar}>
      <label htmlFor={'a' + r.id}>
        {r.faltando === 1 ? 'Falta 1' : `Faltam ${r.faltando}`} na saca {r.saca}. Quantos estão aqui?
      </label>
      <span className="field qtd" onClick={() => refQtd.current?.focus()}>
        <input
          id={'a' + r.id} ref={refQtd} className="code" inputMode="numeric" autoComplete="off" placeholder="0"
          style={{ width: `${Math.max(qtd.length, 1) + 0.4}ch` }} aria-describedby={'ea' + r.id}
          value={qtd} onChange={(e) => { setQtd(e.target.value.replace(/\D/g, '').slice(0, 3)); setErro('') }}
        />
        <span className="pos" aria-hidden="true">de {r.faltando}</span>
      </span>
      <p className="err" id={'ea' + r.id} role="alert">{erro}</p>
      <button type="submit" className="btn zap"><IconeWhatsApp />Avisar {primeiroNome(r.nome)}</button>
      <div className="row">
        <button type="button" className="btn ghost" onClick={onFechar}>Cancelar</button>
        <button type="button" className="btn ghost" onClick={resolverSemAvisar}>Resolvido</button>
      </div>
    </form>
  )
}

/** Uma linha da folha. Embaixo do nome, a hora do carregamento. `data` só nos dias anteriores. */
function Linha({ r, adm, busca, nova, data, onResolver, onMudou, onErro }: {
  r: Registro; adm: string; busca: string; nova: boolean; data?: string
  onResolver: (r: Registro) => void; onMudou: () => void; onErro: (msg: string) => void
}) {
  const [painel, setPainel] = useState(false)
  const ref = `saca ${r.saca} / NX ${r.nx}`
  // Hoje: o pacote está na agência. Dias anteriores: a rota já fechou, então a mensagem só diz do que se trata.
  const msg = data
    ? `Oi, ${primeiroNome(r.nome)}! É a ${adm}, da Doce Camomila. É sobre a ${ref} do dia ${data}.`
    : `Oi, ${primeiroNome(r.nome)}! É a ${adm}, da Doce Camomila. Achamos um pacote da ${ref}. Está aqui, pode passar para buscar.`
  return (
    <>
      <div className={'line' + (nova ? ' new' : '')} role="row">
        <div className="name" role="cell">
          <span><Destaque texto={r.nome} busca={busca} /></span>
          <div className="sub">
            <small aria-label={`carregou às ${horaDe(r)}`}>{horaDe(r)}</small>
            {r.faltando > 0 && (
              // Pendente: abre o painel "quantos estão aqui". Resolvido: tocar desfaz (decisão 011).
              <button
                type="button" className={'selo' + (r.resolvido ? ' ok' : r.achados > 0 ? ' parcial' : '')}
                aria-expanded={r.resolvido ? undefined : painel}
                onClick={() => (r.resolvido ? onResolver(r) : setPainel((v) => !v))}
                aria-label={r.resolvido
                  ? `Falta de ${r.faltando} resolvida. Tocar para desfazer`
                  : `${textoSelo(r)}. Tocar para dizer quantos estão aqui`}
              >
                {textoSelo(r)}
              </button>
            )}
          </div>
        </div>
        <div className="codes" role="cell"><Destaque texto={r.saca} busca={busca} /></div>
        <div className="codes" role="cell"><Destaque texto={r.nx} busca={busca} /></div>
        <div className="act" role="cell">
          <a
            className="zapbtn" href={linkWaMe(r.tel, msg)} target="_blank" rel="noopener"
            aria-label={`Chamar ${r.nome} no WhatsApp, ${ref}`}
            onClick={(e) => abrirWhatsApp(e, r.tel, msg)}
          >
            <IconeWhatsApp degrade />
          </a>
        </div>
      </div>
      {painel && !r.resolvido && (
        <div className="line-painel" role="row">
          <div role="cell">
            <PainelAchados r={r} adm={adm} onFechar={() => setPainel(false)} onMudou={onMudou} onErro={onErro} />
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Lista no formato da folha (Motorista | Saca | NX | WhatsApp), um dia por vez (decisão 010).
 * A busca olha os 3 dias: cada botão de dia mostra quantos achados tem nele.
 */
export function Lista({ adm, onSair }: { adm: string; onSair: () => void }) {
  const [registros, setRegistros] = useState<Registro[] | null>(null)
  const [busca, setBusca] = useState('')
  const [diaSel, setDiaSel] = useState(0)
  const [soFaltas, setSoFaltas] = useState(false)
  const [versao, setVersao] = useState(0)
  const [erro, setErro] = useState('')
  // Registros que chegam com a lista aberta ganham a faixa amarela.
  const abertaEm = useRef(Date.now())

  useEffect(() => {
    let ativo = true
    const carregar = () => listarRegistros().then(
      (r) => { if (ativo) { setRegistros(r); setErro('') } },
      (f: Error) => { if (ativo) setErro(f.message) },
    )
    carregar()
    const parar = aoMudar(carregar)
    const aoVoltar = () => { if (!document.hidden) carregar() }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => { ativo = false; parar(); document.removeEventListener('visibilitychange', aoVoltar) }
  }, [versao])

  async function resolver(r: Registro) {
    try {
      await marcarResolvido(r, !r.resolvido)
      setVersao((v) => v + 1)
    } catch (f) {
      setErro((f as Error).message)
    }
  }

  const bruto = busca.trim()
  const q = bruto.toLowerCase().replace(/^nx\s*/, '')
  const todos = registros ?? []
  const totalPendentes = todos.filter(pendente).length
  const filtrandoFaltas = soFaltas && totalPendentes > 0
  const achados = todos.filter(
    (r) => (!q || r.nome.toLowerCase().includes(q) || r.saca.includes(q) || r.nx.includes(q)) && (!filtrandoFaltas || pendente(r)),
  )
  const dias = diasDaLista().map((d) => ({
    ...d, linhas: achados.filter(d.contem), pendentes: todos.filter((r) => d.contem(r) && pendente(r)).length,
  }))
  const dia = dias[diaSel]
  const totalAchados = achados.length
  const buscando = !!q || filtrandoFaltas

  return (
    <section className="screen">
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search" inputMode="search" placeholder="Saca, NX ou nome" aria-label="Buscar por saca, NX ou nome"
          autoComplete="off" value={busca} onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      {totalPendentes > 0 && (
        <button type="button" className="alerta" aria-pressed={filtrandoFaltas} onClick={() => setSoFaltas((v) => !v)}>
          {filtrandoFaltas
            ? 'Mostrar todas as sacas'
            : totalPendentes === 1 ? '⚠ Falta pacote em 1 saca' : `⚠ Falta pacote em ${totalPendentes} sacas`}
        </button>
      )}
      <div className="dias" role="group" aria-label="Escolher o dia">
        <BotaoDia dia={dias[0]} escolhido={diaSel === 0} buscando={buscando} onEscolher={() => setDiaSel(0)} />
        <div className="antes">
          {dias.slice(1).map((d) => (
            <BotaoDia key={d.atras} dia={d} escolhido={diaSel === d.atras} buscando={buscando} onEscolher={() => setDiaSel(d.atras)} />
          ))}
        </div>
      </div>
      <div className="count">
        <span aria-live="polite">
          <b>{dia.linhas.length}</b>{' '}
          {filtrandoFaltas ? 'com falta' : q ? (dia.linhas.length === 1 ? 'encontrado' : 'encontrados') : dia.linhas.length === 1 ? 'registro' : 'registros'}
        </span>
        <span className="who">
          <span>{adm}</span>
          <button className="mini" type="button" onClick={onSair}>Sair</button>
        </span>
      </div>
      <p className="err" role="alert">{erro}</p>
      <div className="sheet" role="table" aria-label={`Registros de ${dia.nome.toLowerCase()} ${dia.data}`}>
        <div className="head" role="row">
          <div role="columnheader">Motorista</div>
          <div role="columnheader">Saca</div>
          <div role="columnheader">NX</div>
          <div role="columnheader"><span className="sr">WhatsApp</span></div>
        </div>
        <div aria-live="polite">
          {registros === null ? null : dia.linhas.length > 0 ? (
            dia.linhas.map((r) => (
              <Linha key={r.id} r={r} adm={adm} busca={q} nova={r.criadoEm > abertaEm.current} data={diaSel > 0 ? dia.data : undefined} onResolver={resolver} onMudou={() => setVersao((v) => v + 1)} onErro={setErro} />
            ))
          ) : (
            <div className="empty">
              {filtrandoFaltas && !q ? (
                <p>Nenhuma falta pendente nesse dia. A bolinha vermelha mostra o dia que tem.</p>
              ) : !q ? (
                <p>{diaSel === 0 ? 'Ninguém registrou saca hoje ainda.' : 'Ninguém registrou saca nesse dia.'}</p>
              ) : totalAchados > 0 ? (
                <p>Nada com “{bruto}” nesse dia. Os números nos dias acima mostram onde tem.</p>
              ) : (
                <>
                  <p>Ninguém com “{bruto}” nesses 3 dias. Confira o número ou tente só o nome.</p>
                  <a className="btn zap" href={LINK_GRUPO_WHATSAPP} target="_blank" rel="noopener">
                    <IconeWhatsApp />Perguntar no grupo
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
