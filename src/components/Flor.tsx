// Flor da identidade "Miolo" (decisão 005): só no topo e na tela de sucesso.

const PETALAS = [0, 45, 90, 135, 180, 225, 270, 315]

/** Definições reaproveitadas: a flor e o degradê verde do ícone do WhatsApp. */
export function FlorSimbolo() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="zap-degrade" gradientUnits="userSpaceOnUse" x1="0" y1="2.8" x2="0" y2="21">
          <stop offset="0" style={{ stopColor: 'var(--zap-a)' }} />
          <stop offset="1" style={{ stopColor: 'var(--zap-b)' }} />
        </linearGradient>
        <symbol id="flor" viewBox="0 0 48 48">
          <g fill="var(--petal)" stroke="var(--ink)" strokeWidth="1.6">
            {PETALAS.map((r) => (
              <ellipse
                key={r}
                className="p"
                style={{ '--r': `${r}deg` } as React.CSSProperties}
                cx="24" cy="10" rx="5.2" ry="9"
                transform={`rotate(${r} 24 24)`}
              />
            ))}
          </g>
          <circle cx="24" cy="24" r="9" fill="var(--miolo)" stroke="var(--ink)" strokeWidth="1.6" />
          <g fill="var(--ink)" opacity=".35">
            <circle cx="21" cy="21" r="1" /><circle cx="26" cy="20.5" r="1" /><circle cx="27.5" cy="25" r="1" />
            <circle cx="22.5" cy="27" r="1" /><circle cx="24" cy="23.5" r="1" />
          </g>
        </symbol>
      </defs>
    </svg>
  )
}

export function Flor({ className = 'flor' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <use href="#flor" />
    </svg>
  )
}

/** Flor com check, abrindo as pétalas (tela "Registrado"). */
export function FlorCheck() {
  return (
    <svg className="flor bloom" viewBox="0 0 48 48" aria-hidden="true">
      <use href="#flor" />
      <path d="M19.5 24.2l3.2 3.2 6-6.4" fill="none" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const TELEFONE =
  'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'

/**
 * Balão com telefone. `degrade`: verde em degradê (para fundo claro/folha, ex.: lista da agência).
 * Sem `degrade`: usa a cor do texto (para dentro dos botões verdes).
 */
export function IconeWhatsApp({ degrade = false }: { degrade?: boolean }) {
  const cor = degrade ? 'url(#zap-degrade)' : 'currentColor'
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.52 16.02A8.4 8.4 0 1 1 8.85 18.81L3.4 20.9Z" fill="none" stroke={cor} strokeWidth="2.1" strokeLinejoin="round" />
      <path transform="matrix(.43 0 0 .43 7.24 6.04)" d={TELEFONE} fill={cor} />
    </svg>
  )
}
