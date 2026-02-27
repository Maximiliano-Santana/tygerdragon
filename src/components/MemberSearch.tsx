'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

export default function MemberSearch({
  defaultValue,
  defaultStatus,
}: {
  defaultValue?: string
  defaultStatus?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [status, setStatus] = useState(defaultStatus ?? 'all')

  const navigate = useCallback((q: string, s: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (s && s !== 'all') params.set('status', s)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname])

  function handleSearch(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => navigate(q, status), 400)
  }

  function handleStatus(s: string) {
    setStatus(s)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    navigate(defaultValue ?? '', s)
  }

  return (
    <div className="flex gap-2 flex-1">
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Buscar por nombre..."
        className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
      />
      <select
        value={status}
        onChange={e => handleStatus(e.target.value)}
        className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
      >
        <option value="all">Todos</option>
        <option value="active">Activos</option>
        <option value="expired">Vencidos</option>
        <option value="inactive">Inactivos</option>
      </select>
    </div>
  )
}
