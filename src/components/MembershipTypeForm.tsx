'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MembershipType } from '@/lib/types'
import { BENEFIT_CATALOG, BENEFIT_CATEGORIES } from '@/lib/benefit-catalog'

export default function MembershipTypeForm({ membershipType }: { membershipType?: MembershipType }) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!membershipType

  const [form, setForm] = useState({
    name: membershipType?.name ?? '',
    duration_days: membershipType?.duration_days?.toString() ?? '',
    price: membershipType?.price?.toString() ?? '',
    benefits: membershipType?.benefits ?? [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleBenefit(id: string) {
    setForm(prev => ({
      ...prev,
      benefits: prev.benefits.includes(id)
        ? prev.benefits.filter(b => b !== id)
        : [...prev.benefits, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      name: form.name,
      duration_days: parseInt(form.duration_days),
      price: form.price ? parseFloat(form.price) : null,
      benefits: form.benefits,
    }

    if (isEditing) {
      const { error } = await supabase
        .from('membership_types')
        .update(payload)
        .eq('id', membershipType!.id)
      if (error) { setError('Error al guardar.'); setLoading(false); return }
    } else {
      const { error } = await supabase
        .from('membership_types')
        .insert({ ...payload, is_active: true })
      if (error) { setError('Error al crear.'); setLoading(false); return }
    }

    router.push('/membership-types')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Datos básicos */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required
            placeholder="Ej. Mensual, Plan Estudiante..."
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Duración (días) *</label>
            <input
              type="number"
              value={form.duration_days}
              onChange={e => setForm(p => ({ ...p, duration_days: e.target.value }))}
              required
              min={1}
              placeholder="30"
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Precio (opcional)</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              min={0}
              step={0.01}
              placeholder="350.00"
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-zinc-300">Beneficios incluidos</label>
          {form.benefits.length > 0 && (
            <span className="text-xs text-orange-400">{form.benefits.length} seleccionados</span>
          )}
        </div>

        <div className="space-y-4">
          {BENEFIT_CATEGORIES.map(category => (
            <div key={category}>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{category}</p>
              <div className="grid grid-cols-2 gap-2">
                {BENEFIT_CATALOG.filter(b => b.category === category).map(benefit => {
                  const selected = form.benefits.includes(benefit.id)
                  return (
                    <button
                      key={benefit.id}
                      type="button"
                      onClick={() => toggleBenefit(benefit.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                        selected
                          ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                        selected ? 'bg-orange-500 text-white' : 'border border-zinc-600'
                      }`}>
                        {selected ? '✓' : ''}
                      </span>
                      {benefit.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
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
          {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear membresía'}
        </button>
      </div>
    </form>
  )
}
