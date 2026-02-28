'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import ConfirmModal from './ConfirmModal'

export default function CancelSubscriptionButton({
  memberId,
  memberName,
}: {
  memberId: string
  memberName: string
}) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleConfirm() {
    setShowModal(false)
    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('members')
      .update({
        end_date: today,
        status: 'inactive',
      })
      .eq('id', memberId)

    if (error) {
      toast.error('Error al cancelar la suscripción.')
    } else {
      toast.success(`Suscripción de ${memberName} cancelada.`)
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {showModal && (
        <ConfirmModal
          title="Cancelar suscripción"
          message={`La suscripción de ${memberName} terminará hoy y el miembro quedará inactivo.`}
          confirmLabel="Cancelar suscripción"
          variant="danger"
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>
          </svg>
        )}
        Cancelar suscripción
      </button>
    </>
  )
}
