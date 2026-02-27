'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Member, MembershipType } from '@/lib/types'

export default function MemberForm({
  membershipTypes,
  member,
}: {
  membershipTypes: MembershipType[]
  member?: Member
}) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!member

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    name: member?.name ?? '',
    phone: member?.phone ?? '',
    email: member?.email ?? '',
    notes: member?.notes ?? '',
    membership_type_id: member?.membership_type_id ?? '',
    start_date: member?.start_date ?? today,
    end_date: member?.end_date ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => {
      const next = { ...prev, [name]: value }
      // Calcula end_date automaticamente cuando cambia tipo o start_date
      if (name === 'membership_type_id' || name === 'start_date') {
        const typeId = name === 'membership_type_id' ? value : prev.membership_type_id
        const startDate = name === 'start_date' ? value : prev.start_date
        const type = membershipTypes.find(t => t.id === typeId)
        if (type && startDate) {
          const end = new Date(startDate)
          end.setDate(end.getDate() + type.duration_days)
          next.end_date = end.toISOString().split('T')[0]
        }
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      notes: form.notes || null,
      membership_type_id: form.membership_type_id || null,
      start_date: form.start_date,
      end_date: form.end_date,
    }

    if (isEditing) {
      const { error } = await supabase
        .from('members')
        .update(payload)
        .eq('id', member!.id)

      if (error) { setError('Error al guardar.'); setLoading(false); return }
      router.push(`/members/${member!.id}`)
    } else {
      const { data, error } = await supabase
        .from('members')
        .insert({ ...payload, status: 'active' })
        .select('id')
        .single()

      if (error || !data) { setError('Error al crear el miembro.'); setLoading(false); return }
      router.push(`/members/${data.id}`)
    }

    router.refresh()
  }

  const fields = [
    { name: 'name', label: 'Nombre completo *', type: 'text', required: true, placeholder: 'Juan Pérez' },
    { name: 'phone', label: 'Teléfono', type: 'tel', required: false, placeholder: '555 123 4567' },
    { name: 'email', label: 'Correo electrónico', type: 'email', required: false, placeholder: 'juan@email.com' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {fields.map(f => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-zinc-300 mb-1">{f.label}</label>
          <input
            type={f.type}
            name={f.name}
            value={form[f.name as keyof typeof form]}
            onChange={handleChange}
            required={f.required}
            placeholder={f.placeholder}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Tipo de membresía</label>
        <select
          name="membership_type_id"
          value={form.membership_type_id}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
        >
          <option value="">Sin membresía</option>
          {membershipTypes.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.duration_days} días{t.price ? ` · $${t.price}` : ''})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Fecha de inicio *</label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Fecha de vencimiento *</label>
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Notas</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Observaciones opcionales..."
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear miembro'}
        </button>
      </div>
    </form>
  )
}
