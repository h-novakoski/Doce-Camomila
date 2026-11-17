// Registro do dia em planilha (decisão 012): um arquivo .xlsx formatado (cabeçalho, larguras, falta em vermelho).
// No celular abre o "compartilhar" do aparelho (WhatsApp, Drive…); no computador baixa o arquivo.
import type { Registro } from './registro'
import { ehCelular } from './whatsapp'

const dois = (n: number) => String(n).padStart(2, '0')

const BORDA = '#D9D9D9'
const cabecalho = (value: string, align: 'left' | 'center' = 'center') => ({
  value, align, fontWeight: 'bold' as const, color: '#FFFFFF', backgroundColor: '#3A3A3A',
  alignVertical: 'center' as const, height: 24,
})
// "@" = texto: a planilha não tira zero à esquerda nem transforma em fórmula o que o motorista digitou.
const texto = (value: string, align: 'left' | 'center' = 'center') => ({
  value, align, type: String, format: '@', borderColor: BORDA, alignVertical: 'center' as const, height: 20,
})
/** Quantidade: vazio quando é 0 (mais fácil de bater o olho); falta em vermelho. */
const quantidade = (n: number, falta = false) =>
  n > 0
    ? {
        value: n, type: Number, align: 'center' as const, borderColor: BORDA, alignVertical: 'center' as const,
        ...(falta ? { fontWeight: 'bold' as const, color: '#B3261E', backgroundColor: '#FDE7E5' } : {}),
      }
    : { value: '', type: String, borderColor: BORDA }

/** Sem telefone: só o que vai para o relatório. Ordem da folha: do primeiro carregamento ao último. */
async function montarXlsx(registros: Registro[], data: string): Promise<Blob> {
  // Só carrega a biblioteca quando a adm toca no botão: o motorista nunca baixa isso.
  const { default: writeExcelFile } = await import('write-excel-file/universal')
  const linhas = [...registros]
    .sort((a, b) => a.criadoEm - b.criadoEm)
    .map((r) => [
      texto(data),
      texto(new Date(r.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })),
      texto(r.nome, 'left'),
      texto(r.saca),
      texto(r.nx),
      quantidade(r.faltando, true),
      quantidade(r.achados),
    ])
  const titulos = [
    cabecalho('Data'), cabecalho('Hora'), cabecalho('Motorista', 'left'), cabecalho('Saca'), cabecalho('NX'),
    cabecalho('Faltando'), cabecalho('Achados'),
  ]
  return writeExcelFile([titulos, ...linhas], {
    sheet: 'Sacas do dia',
    columns: [{ width: 12 }, { width: 8 }, { width: 28 }, { width: 9 }, { width: 9 }, { width: 11 }, { width: 11 }],
    stickyRowsCount: 1,
  }, { fontSize: 12 }).toBlob()
}

/** `inicio` = início do dia da operação (de `inicioDoDia`). Chamar direto no clique. */
export async function compartilharPlanilha(registros: Registro[], inicio: number) {
  const d = new Date(inicio)
  const nome = `sacas-${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}.xlsx`
  const data = `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`
  const arquivo = new File([await montarXlsx(registros, data)], nome, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  if (ehCelular() && navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: `Sacas do dia ${data}` })
      return
    } catch (f) {
      if ((f as Error).name === 'AbortError') return // a pessoa fechou o compartilhar
    }
  }
  const url = URL.createObjectURL(arquivo)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
