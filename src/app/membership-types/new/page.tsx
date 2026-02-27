import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MembershipTypeForm from '@/components/MembershipTypeForm'

export default async function NewMembershipTypePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 px-6 py-4">
        <Link href="/membership-types" className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Tipos de membresía
        </Link>
      </header>
      <main className="max-w-xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Nuevo tipo de membresía</h2>
        <MembershipTypeForm />
      </main>
    </div>
  )
}
