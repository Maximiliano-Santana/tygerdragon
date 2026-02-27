import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import QRDisplay from '@/components/QRDisplay'
import DeactivateButton from '@/components/DeactivateButton'
import Navbar from '@/components/Navbar'
import SaveContactButton from '@/components/SaveContactButton'
import DeleteMemberButton from '@/components/DeleteMemberButton'

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('*, membership_type:membership_types(id, name, duration_days)')
    .eq('id', id)
    .single()

  if (!member) notFound()

  const today = new Date()
  const isExpired = new Date(member.end_date) < today
  const isActive = member.status === 'active' && !isExpired

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/check/${member.id}`

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Volver */}
        <Link href="/dashboard" className="inline-block text-zinc-400 hover:text-white text-sm transition-colors">
          ← Volver al dashboard
        </Link>

        {/* Header del miembro */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{member.name}</h2>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {member.status === 'inactive' ? 'Inactivo' : isExpired ? 'Vencido' : 'Activo'}
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/members/${member.id}/edit`}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Editar
            </Link>
            <DeactivateButton memberId={member.id} currentStatus={member.status} />
          </div>
        </div>

        {/* Datos */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {/* Teléfono con botón guardar contacto */}
          <div className="flex items-center px-4 py-3 text-sm">
            <span className="w-28 shrink-0 text-zinc-400">Teléfono</span>
            <span className="text-white flex-1">{member.phone ?? '—'}</span>
            {member.phone && (
              <SaveContactButton
                name={member.name}
                phone={member.phone}
                email={member.email}
              />
            )}
          </div>

          {[
            { label: 'Email', value: member.email ?? '—' },
            { label: 'Membresía', value: member.membership_type?.name ?? '—' },
            { label: 'Inicio', value: new Date(member.start_date).toLocaleDateString('es-MX') },
            { label: 'Vence', value: new Date(member.end_date).toLocaleDateString('es-MX') },
            { label: 'Notas', value: member.notes ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex px-4 py-3 text-sm">
              <span className="w-28 shrink-0 text-zinc-400">{label}</span>
              <span className="text-white break-words min-w-0">{value}</span>
            </div>
          ))}
        </div>

        {/* Zona de peligro — solo visible si inactivo */}
        {member.status === 'inactive' && (
          <div className="border border-red-500/20 rounded-xl p-4 space-y-2">
            <p className="text-xs text-red-400/70 font-medium uppercase tracking-wide">Zona de peligro</p>
            <p className="text-xs text-zinc-500">Al eliminar el miembro se borrará toda su información permanentemente.</p>
            <DeleteMemberButton memberId={member.id} memberName={member.name} />
          </div>
        )}

        {/* QR */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Código QR de acceso</h3>
          <QRDisplay url={qrUrl} memberName={member.name} membershipType={member.membership_type?.name} />
        </div>
      </main>
    </div>
  )
}
