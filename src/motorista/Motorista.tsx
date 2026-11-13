import { useState } from 'react'
import { guardarMinha, lerDica, lerMotorista, salvarDica, salvarMotorista, type Dica, type Motorista as DadosMotorista } from '../lib/local'
import { registrarSaca, type Registro } from '../lib/registro'
import { Cadastro } from './Cadastro'
import { MinhasSacas } from './MinhasSacas'
import { Registrar } from './Registrar'
import { Registrado } from './Registrado'

const primeiroNome = (nome: string) => nome.split(' ')[0]

/** Rota `/` (QR da bancada): cadastro → registrar → registrado. */
export function Motorista() {
  const [motorista, setMotorista] = useState<DadosMotorista | null>(lerMotorista)
  const [dica, setDica] = useState<Dica>(lerDica)
  const [ultimo, setUltimo] = useState<{ registro: Registro; mostrarDica: boolean } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [versao, setVersao] = useState(0)

  if (!motorista) {
    return <Cadastro onSalvar={(m) => { salvarMotorista(m); setMotorista(m); window.scrollTo(0, 0) }} />
  }

  const atual = motorista
  const nome = primeiroNome(atual.nome)

  /** Devolve a mensagem de erro para a tela (ex.: sem internet), ou nada se deu certo. */
  async function registrar(saca: string, nx: string): Promise<string | void> {
    setEnviando(true)
    try {
      const registro = await registrarSaca(atual, saca, nx)
      // a chave secreta fica neste celular: é com ela que ele avisa falta de pacote depois
      if (registro.chave) guardarMinha(registro.chave)
      setVersao((v) => v + 1)
      // A dica do atalho só aparece a partir do 2º registro, até ele dispensar.
      setUltimo({ registro, mostrarDica: dica === 'mostrar' })
      if (dica === 'novo') { setDica('mostrar'); salvarDica('mostrar') }
      window.scrollTo(0, 0)
    } catch (falha) {
      return (falha as Error).message
    } finally {
      setEnviando(false)
    }
  }

  function fecharDica() {
    setDica('fechada')
    salvarDica('fechada')
    setUltimo((u) => (u ? { ...u, mostrarDica: false } : u))
  }

  if (ultimo) {
    return (
      <Registrado
        nome={nome}
        registro={ultimo.registro}
        versao={versao}
        mostrarDica={ultimo.mostrarDica}
        onFecharDica={fecharDica}
        onNova={() => { setUltimo(null); window.scrollTo(0, 0) }}
      />
    )
  }

  return (
    <Registrar nome={nome} enviando={enviando} onRegistrar={registrar}>
      <MinhasSacas nome={nome} versao={versao} />
    </Registrar>
  )
}
