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
      className={`flex items-center justify-center gap-2 px-3 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
          : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
      }`}
    >
      {loading ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : isActive ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
        </svg>
      )}
      <span className="hidden md:inline text-sm">
        {isActive ? 'Desactivar' : 'Activar'}
      </span>
    </button>
  )
}
