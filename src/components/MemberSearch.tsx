'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export default function MemberSearch({
  defaultValue,
  defaultStatus,
}: {
  defaultValue?: string
  defaultStatus?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((q: string, status: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status && status !== 'all') params.set('status', status)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname])

  return (
    <div className="flex gap-2 flex-1">
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={e => update(e.target.value, defaultStatus ?? 'all')}
        placeholder="Buscar por nombre..."
        className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
      />
      <select
        defaultValue={defaultStatus ?? 'all'}
        onChange={e => update(defaultValue ?? '', e.target.value)}
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
