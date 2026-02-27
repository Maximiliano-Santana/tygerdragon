import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import MemberForm from '@/components/MemberForm'
import Navbar from '@/components/Navbar'

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: member, error: memberError },
    { data: membershipTypes, error: typesError },
  ] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single(),
    supabase.from('membership_types').select('*').eq('is_active', true).order('duration_days'),
  ])

  if (!member) notFound()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <Link href={`/members/${id}`} className="inline-block text-zinc-400 hover:text-white text-sm transition-colors">
          ← Volver al miembro
        </Link>
        <h2 className="text-2xl font-bold text-white">Editar miembro</h2>
        {memberError || typesError ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-red-400 text-sm">Error al cargar los datos.</p>
            <a href={`/members/${id}/edit`} className="text-orange-400 hover:text-orange-300 text-xs underline">Reintentar</a>
          </div>
        ) : (
          <MemberForm membershipTypes={membershipTypes ?? []} member={member} />
        )}
      </main>
    </div>
  )
}
