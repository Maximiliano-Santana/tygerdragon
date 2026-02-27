'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Member, MembershipType } from '@/lib/types'
import { toast } from 'sonner'

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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(member?.photo_url ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 400
        let width = img.naturalWidth
        let height = img.naturalHeight
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        canvas.toBlob(
          (blob) => resolve(new File([blob!], `photo.jpg`, { type: 'image/jpeg' })),
          'image/jpeg',
          0.82
        )
      }
      img.src = url
    })
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhotoFile(compressed)
    setPhotoPreview(URL.createObjectURL(compressed))
  }

  async function uploadPhoto(memberId: string): Promise<string | null> {
    if (!photoFile) return null
    const ext = photoFile.name.split('.').pop()
    const path = `${memberId}.${ext}`
    const { error } = await supabase.storage
      .from('member-photos')
      .upload(path, photoFile, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('member-photos').getPublicUrl(path)
    return `${data.publicUrl}?t=${Date.now()}`
  }

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
      const photo_url = await uploadPhoto(member!.id)
      const { error } = await supabase
        .from('members')
        .update({ ...payload, ...(photo_url && { photo_url }) })
        .eq('id', member!.id)

      if (error) {
        toast.error('Error al guardar los cambios.')
        setLoading(false)
        return
      }
      toast.success('Miembro actualizado correctamente.')
      router.push(`/members/${member!.id}`)
    } else {
      const { data, error } = await supabase
        .from('members')
        .insert({ ...payload, status: 'active' })
        .select('id')
        .single()

      if (error || !data) {
        toast.error('Error al crear el miembro.')
        setLoading(false)
        return
      }

      const photo_url = await uploadPhoto(data.id)
      if (photo_url) {
        await supabase.from('members').update({ photo_url }).eq('id', data.id)
      }

      toast.success('Miembro creado correctamente.')
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Foto del miembro</label>
        <div className="flex items-center gap-4">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"
            />
          )}
          <label className="flex-1 flex items-center justify-center px-4 py-2.5 bg-zinc-900 border border-zinc-700 border-dashed rounded-lg text-zinc-400 hover:border-orange-500 hover:text-orange-400 cursor-pointer transition-colors text-sm">
            <span>{photoPreview ? 'Cambiar foto' : 'Subir foto'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
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
