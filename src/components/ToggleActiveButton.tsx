'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import ConfirmModal from './ConfirmModal'

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
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleConfirm() {
    setShowModal(false)
    setLoading(true)
    const { error } = await supabase.from(table).update({ is_active: !isActive }).eq('id', id)
    if (error) {
      toast.error('Error al actualizar el estado.')
    } else {
      toast.success(isActive ? 'Membresía desactivada.' : 'Membresía activada.')
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {showModal && (
        <ConfirmModal
          title={isActive ? 'Desactivar membresía' : 'Activar membresía'}
          message={isActive
            ? 'Los miembros con este plan no podrán ser asignados a nuevos registros.'
            : '¿Confirmas que quieres volver a activar esta membresía?'
          }
          confirmLabel={isActive ? 'Desactivar' : 'Activar'}
          variant={isActive ? 'danger' : 'warning'}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
          isActive
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
        }`}
      >
        {loading ? '...' : isActive ? 'Desactivar' : 'Activar'}
      </button>
    </>
  )
}
