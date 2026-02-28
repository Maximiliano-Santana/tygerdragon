'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import ConfirmModal from './ConfirmModal'

export default function RenewButton({
  memberId,
  durationDays,
}: {
  memberId: string
  durationDays: number | null | undefined
}) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleConfirm() {
    setShowModal(false)
    setLoading(true)

    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + (durationDays ?? 30))

    const { error } = await supabase
      .from('members')
      .update({
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
      })
      .eq('id', memberId)

    if (error) {
      toast.error('Error al renovar la suscripción.')
    } else {
      toast.success('Suscripción renovada correctamente.')
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {showModal && (
        <ConfirmModal
          title="Renovar suscripción"
          message={`Se generará un nuevo período de ${durationDays ?? 30} días a partir de hoy.`}
          confirmLabel="Renovar"
          variant="warning"
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          </svg>
        )}
        Renovar suscripción
      </button>
    </>
  )
}
