import { createClient } from '@/lib/supabase/server'

export default async function CheckPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: member } = await supabase
    .from('members')
    .select('id, name, photo_url, end_date, status, membership_type:membership_types(name)')
    .eq('id', id)
    .single()

  if (!member) {
    return (
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center text-white px-6">
        <div className="text-8xl mb-6">✗</div>
        <h1 className="text-4xl font-black tracking-tight">ACCESO DENEGADO</h1>
        <p className="text-red-200 text-xl mt-3">Miembro no encontrado</p>
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(member.end_date)
  endDate.setHours(0, 0, 0, 0)

  const isExpired = endDate < today
  const allowed = member.status === 'active' && !isExpired

  const membershipName = Array.isArray(member.membership_type)
    ? member.membership_type[0]?.name
    : (member.membership_type as { name: string } | null)?.name

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 text-white ${
      allowed ? 'bg-green-600' : 'bg-red-600'
    }`}>

      {/* Foto */}
      {member.photo_url && (
        <img
          src={member.photo_url}
          alt={member.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-white/30 mb-6"
        />
      )}

      {/* Nombre */}
      <h2 className="text-3xl font-bold text-center mb-2">{member.name}</h2>
      {membershipName && (
        <p className="text-white/70 text-lg mb-8">{membershipName}</p>
      )}

      {/* Resultado */}
      <div className="text-center">
        <div className="text-9xl mb-4">{allowed ? '✓' : '✗'}</div>
        <h1 className="text-5xl font-black tracking-tight">
          {allowed ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
        </h1>
        {!allowed && (
          <p className="text-red-200 text-xl mt-3">
            {member.status === 'inactive'
              ? 'Membresía inactiva'
              : `Venció el ${endDate.toLocaleDateString('es-MX')}`}
          </p>
        )}
        {allowed && (
          <p className="text-green-200 text-lg mt-3">
            Válido hasta {endDate.toLocaleDateString('es-MX')}
          </p>
        )}
      </div>
    </div>
  )
}
