import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Member, MembershipType } from '@/lib/types'
import Navbar from '@/components/Navbar'
import MemberSearch from '@/components/MemberSearch'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { q, status } = await searchParams

  let query = supabase
    .from('members')
    .select('*, membership_type:membership_types(id, name, duration_days)')
    .order('name')

  const todayStr = new Date().toISOString().split('T')[0]

  if (q) query = query.ilike('name', `%${q}%`)
  if (status === 'active') {
    query = query.eq('status', 'active').gte('end_date', todayStr)
  } else if (status === 'expired') {
    query = query.eq('status', 'active').lt('end_date', todayStr)
  } else if (status === 'inactive') {
    query = query.eq('status', 'inactive')
  }

  const { data: members } = await query

  // Miembros por vencer en los próximos 7 días
  const today = new Date()
  const in7days = new Date(today)
  in7days.setDate(today.getDate() + 7)

  const expiringSoon = (members ?? []).filter(m => {
    const end = new Date(m.end_date)
    return end >= today && end <= in7days && m.status === 'active'
  })

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* Alerta vencimientos */}
        {expiringSoon.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="text-yellow-400 text-lg mt-0.5 shrink-0">⚠</span>
            <p className="text-yellow-300 text-sm">
              <span className="font-semibold">{expiringSoon.length} membresía{expiringSoon.length > 1 ? 's' : ''}</span>
              {' '}vence{expiringSoon.length > 1 ? 'n' : ''} en los próximos 7 días:{' '}
              {expiringSoon.map(m => m.name).join(', ')}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MemberSearch defaultValue={q} defaultStatus={status} />
          <Link
            href="/members/new"
            className="shrink-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-sm text-center"
          >
            + Agregar miembro
          </Link>
        </div>

        {/* Lista de miembros */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {!members || members.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">
              {q ? 'No se encontraron miembros con ese nombre.' : 'No hay miembros aún. ¡Agrega el primero!'}
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <ul className="md:hidden divide-y divide-zinc-800">
                {members.map((member: Member & { membership_type: MembershipType | null }) => {
                  const isExpired = new Date(member.end_date) < today
                  const isExpiringSoon = expiringSoon.some(m => m.id === member.id)
                  const isActive = member.status === 'active' && !isExpired

                  return (
                    <li key={member.id}>
                      <Link
                        href={`/members/${member.id}`}
                        className="flex items-center justify-between px-4 py-4 hover:bg-zinc-800/30 transition-colors gap-3"
                      >
                        {/* Avatar mobile */}
                        {member.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-zinc-500">{member.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm truncate">{member.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{member.membership_type?.name ?? '—'}</p>
                          <p className={`text-xs mt-1 ${isExpiringSoon ? 'text-yellow-400 font-medium' : isExpired ? 'text-red-400' : 'text-zinc-500'}`}>
                            Vence: {new Date(member.end_date).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {member.status === 'inactive' ? 'Inactivo' : isExpired ? 'Vencido' : 'Activo'}
                          </span>
                          <span className="text-orange-400 text-sm">→</span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Desktop: tabla */}
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Membresía</th>
                    <th className="px-4 py-3 font-medium">Vence</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: Member & { membership_type: MembershipType | null }) => {
                    const isExpired = new Date(member.end_date) < today
                    const isExpiringSoon = expiringSoon.some(m => m.id === member.id)

                    return (
                      <tr key={member.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {member.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={member.photo_url} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-zinc-500">{member.name.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            <span className="font-medium text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{member.membership_type?.name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={isExpiringSoon ? 'text-yellow-400 font-medium' : isExpired ? 'text-red-400' : 'text-zinc-400'}>
                            {new Date(member.end_date).toLocaleDateString('es-MX')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'active' && !isExpired
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {member.status === 'inactive' ? 'Inactivo' : isExpired ? 'Vencido' : 'Activo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/members/${member.id}`}
                            className="text-orange-400 hover:text-orange-300 text-xs font-medium"
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
