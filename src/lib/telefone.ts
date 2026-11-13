// Regras do telefone do motorista (decisão 001). Todos são do Brasil (+55); o DDD é o motorista quem digita.

/** Máscara enquanto digita: (41) 99999-9999 */
export function formatarTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? '(' + d : ''
  if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2)
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7)
}

/** Só dígitos; tira 55 e 0 do começo. Não inventa DDD. */
export function normalizarTelefone(valor: string): string {
  let d = valor.replace(/\D/g, '')
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  return d
}

/** Celular válido: DDD + 9 dígitos começando com 9. */
export function telefoneValido(normalizado: string): boolean {
  return normalizado.length === 11 && normalizado[2] === '9'
}
