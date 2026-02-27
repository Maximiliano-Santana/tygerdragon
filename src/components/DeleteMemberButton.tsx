'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import ConfirmModal from './ConfirmModal'

export default function DeleteMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleConfirm() {
    setShowModal(false)
    setLoading(true)
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId)

    if (error) {
      toast.error('Error al eliminar el miembro. Intenta de nuevo.')
      setLoading(false)
      return
    }

    toast.success(`${memberName} eliminado correctamente.`)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      {showModal && (
        <ConfirmModal
          title="Eliminar miembro"
          message={`¿Eliminar a ${memberName} permanentemente? Se borrará toda su información y no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-red-500/20"
      >
        {loading ? 'Eliminando...' : 'Eliminar miembro'}
      </button>
    </>
  )
}
