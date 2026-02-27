'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteMembershipTypeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('¿Eliminar este tipo de membresía? Los miembros que lo tengan asignado quedarán sin tipo.')) return
    setLoading(true)
    await supabase.from('membership_types').delete().eq('id', id)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  )
}
