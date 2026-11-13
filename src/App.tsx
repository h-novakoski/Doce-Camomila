import { Agencia } from './agencia/Agencia'
import { Flor, FlorSimbolo } from './components/Flor'
import { inicioDoDia } from './lib/registro'
import { Motorista } from './motorista/Motorista'

// Data do dia da operação: só vira às 3h, igual à lista da agência (decisão 010).
const hoje = new Date(inicioDoDia()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

// Duas rotas, sem seletor entre elas (decisão 004): `/` motorista (QR) e `/agencia` adms.
const caminho = window.location.pathname.replace(/\/+$/, '')

// O app instalado sempre abre em `/`. Se este celular é de adm (última tela usada foi a agência)
// e está aberto como app instalado, vai direto para `/agencia`.
const CHAVE_TELA = 'camomila-tela'
const instalado = window.matchMedia?.('(display-mode: standalone)').matches
let ultimaTela: string | null = null
try { ultimaTela = localStorage.getItem(CHAVE_TELA) } catch { /* sem storage */ }
if (instalado && caminho === '' && ultimaTela === 'agencia') window.history.replaceState(null, '', '/agencia')

const ehAgencia = window.location.pathname.replace(/\/+$/, '') === '/agencia'
try { localStorage.setItem(CHAVE_TELA, ehAgencia ? 'agencia' : 'motorista') } catch { /* sem storage */ }

export function App() {
  return (
    <>
      <FlorSimbolo />
      <div className="wrap">
        <div className="app">
          <header className="bar">
            <Flor />
            <div className="brand"><b>Doce Camomila</b></div>
            <div className="date">{hoje}</div>
          </header>
          {ehAgencia ? <Agencia /> : <Motorista />}
        </div>
      </div>
    </>
  )
}
