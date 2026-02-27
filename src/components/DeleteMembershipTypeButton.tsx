'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import ConfirmModal from './ConfirmModal'

export default function DeleteMembershipTypeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleConfirm() {
    setShowModal(false)
    setLoading(true)
    const { error } = await supabase.from('membership_types').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar la membresía.')
    } else {
      toast.success('Membresía eliminada.')
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {showModal && (
        <ConfirmModal
          title="Eliminar tipo de membresía"
          message="Los miembros que tengan este plan asignado quedarán sin tipo de membresía. Esta acción no se puede deshacer."
          confirmLabel="Sí, eliminar"
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
      >
        {loading ? '...' : 'Eliminar'}
      </button>
    </>
  )
}
