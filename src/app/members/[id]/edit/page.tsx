import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MemberForm from '@/components/MemberForm'

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: member }, { data: membershipTypes }] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single(),
    supabase.from('membership_types').select('*').eq('is_active', true).order('duration_days'),
  ])

  if (!member) notFound()

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 px-6 py-4">
        <a href={`/members/${id}`} className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Volver al miembro
        </a>
      </header>
      <main className="max-w-xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Editar miembro</h2>
        <MemberForm membershipTypes={membershipTypes ?? []} member={member} />
      </main>
    </div>
  )
}
