import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MemberForm from '@/components/MemberForm'
import Navbar from '@/components/Navbar'

export default async function NewMemberPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membershipTypes, error } = await supabase
    .from('membership_types')
    .select('*')
    .eq('is_active', true)
    .order('duration_days')

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <Link href="/dashboard" className="inline-block text-zinc-400 hover:text-white text-sm transition-colors">
          ← Volver al dashboard
        </Link>
        <h2 className="text-2xl font-bold text-white">Nuevo miembro</h2>
        {error ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-red-400 text-sm">Error al cargar los tipos de membresía.</p>
            <a href="/members/new" className="text-orange-400 hover:text-orange-300 text-xs underline">Reintentar</a>
          </div>
        ) : (
          <MemberForm membershipTypes={membershipTypes ?? []} />
        )}
      </main>
    </div>
  )
}
