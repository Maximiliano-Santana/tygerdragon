'use client'

interface Props {
  name: string
  phone?: string | null
  email?: string | null
}

export default function SaveContactButton({ name, phone, email }: Props) {
  function handleSave() {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      phone ? `TEL:${phone}` : null,
      email ? `EMAIL:${email}` : null,
      'END:VCARD',
    ].filter(Boolean).join('\n')

    const blob = new Blob([lines], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleSave}
      title="Guardar contacto"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <line x1="12" y1="11" x2="12" y2="17"/>
        <line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
      Guardar contacto
    </button>
  )
}
