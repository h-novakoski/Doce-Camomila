// Links do WhatsApp (docs/produto.md): no celular tenta abrir o app direto (whatsapp://),
// e se ele não abrir em ~1,5 s cai no wa.me. No computador vai direto para o wa.me.

/** `tel` null = sem destinatário: o WhatsApp abre a lista "Enviar para…" e a pessoa escolhe (ex.: o grupo). */
export function linkWaMe(tel: string | null, texto: string) {
  return `https://wa.me/${tel ? '55' + tel : ''}?text=${encodeURIComponent(texto)}`
}

const ehCelular = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

/** Use no onClick de um <a href={linkWaMe(...)}>. */
export function abrirWhatsApp(e: { preventDefault: () => void }, tel: string | null, texto: string) {
  if (!ehCelular()) return // deixa o link wa.me seguir normal
  e.preventDefault()
  let saiu = false
  const marcar = () => { if (document.hidden) saiu = true }
  document.addEventListener('visibilitychange', marcar)
  window.location.href = `whatsapp://send?${tel ? `phone=55${tel}&` : ''}text=${encodeURIComponent(texto)}`
  setTimeout(() => {
    document.removeEventListener('visibilitychange', marcar)
    if (!saiu && !document.hidden) window.location.href = linkWaMe(tel, texto)
  }, 1500)
}

/** Abre a conversa fora de um link (ex.: depois de um formulário). Chamar direto no clique, antes de qualquer await. */
export function abrirConversa(tel: string | null, texto: string) {
  if (ehCelular()) abrirWhatsApp({ preventDefault() {} }, tel, texto)
  else window.open(linkWaMe(tel, texto), '_blank', 'noopener')
}
