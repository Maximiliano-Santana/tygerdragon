import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MemberForm from '@/components/MemberForm'

export default async function NewMemberPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membershipTypes } = await supabase
    .from('membership_types')
    .select('*')
    .eq('is_active', true)
    .order('duration_days')

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 px-6 py-4">
        <a href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Volver al dashboard
        </a>
      </header>
      <main className="max-w-xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Nuevo miembro</h2>
        <MemberForm membershipTypes={membershipTypes ?? []} />
      </main>
    </div>
  )
}
