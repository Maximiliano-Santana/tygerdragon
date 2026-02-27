'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeactivateButton({
  memberId,
  currentStatus,
}: {
  memberId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isActive = currentStatus === 'active'

  async function handleToggle() {
    const action = isActive ? 'desactivar' : 'activar'
    if (!confirm(`¿Seguro que quieres ${action} a este miembro?`)) return

    setLoading(true)
    await supabase
      .from('members')
      .update({ status: isActive ? 'inactive' : 'active' })
      .eq('id', memberId)

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
          : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
      }`}
    >
      {loading ? '...' : isActive ? 'Desactivar' : 'Activar'}
    </button>
  )
}
