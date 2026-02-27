import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MembershipType } from '@/lib/types'
import { getBenefitLabel } from '@/lib/benefit-catalog'
import ToggleActiveButton from '@/components/ToggleActiveButton'
import DeleteMembershipTypeButton from '@/components/DeleteMembershipTypeButton'
import Navbar from '@/components/Navbar'

export default async function MembershipTypesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: types, error } = await supabase
    .from('membership_types')
    .select('*')
    .order('duration_days')

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Tipos de membresía</h2>
          <Link
            href="/membership-types/new"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Nuevo tipo
          </Link>
        </div>

        {error ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-red-400 text-sm">Error al cargar las membresías.</p>
            <a href="/membership-types" className="text-orange-400 hover:text-orange-300 text-xs underline">Reintentar</a>
          </div>
        ) : !types || types.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm">
            No hay tipos de membresía. ¡Crea el primero!
          </div>
        ) : (
          <div className="grid gap-4">
            {types.map((type: MembershipType) => (
              <div
                key={type.id}
                className={`bg-zinc-900 rounded-xl border p-4 sm:p-5 flex gap-4 ${
                  type.is_active ? 'border-zinc-800' : 'border-zinc-800 opacity-60'
                }`}
              >
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-lg">{type.name}</h3>
                    {!type.is_active && (
                      <span className="text-xs px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded-full">Inactivo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                    <span>{type.duration_days} días</span>
                    {type.price && <span>${type.price.toLocaleString('es-MX')} MXN</span>}
                  </div>

                  {/* Beneficios */}
                  {type.benefits?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {type.benefits.map((id: string) => (
                        <span
                          key={id}
                          className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-300 border border-orange-500/20 rounded-full"
                        >
                          {getBenefitLabel(id)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600">Sin beneficios configurados</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/membership-types/${type.id}/edit`}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg transition-colors text-center"
                  >
                    Editar
                  </Link>
                  <ToggleActiveButton
                    id={type.id}
                    table="membership_types"
                    isActive={type.is_active}
                  />
                  <DeleteMembershipTypeButton id={type.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
