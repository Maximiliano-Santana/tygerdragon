'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${memberName} permanentemente? Esta acción no se puede deshacer.`)) return

    setLoading(true)
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId)

    if (error) {
      alert('Error al eliminar el miembro. Intenta de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-red-500/20"
    >
      {loading ? 'Eliminando...' : 'Eliminar miembro'}
    </button>
  )
}
