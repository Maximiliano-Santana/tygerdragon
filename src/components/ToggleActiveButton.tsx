'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ToggleActiveButton({
  id,
  table,
  isActive,
}: {
  id: string
  table: string
  isActive: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggle() {
    const action = isActive ? 'desactivar' : 'activar'
    if (!confirm(`¿Seguro que quieres ${action} este tipo?`)) return
    setLoading(true)
    await supabase.from(table).update({ is_active: !isActive }).eq('id', id)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
      }`}
    >
      {loading ? '...' : isActive ? 'Desactivar' : 'Activar'}
    </button>
  )
}
