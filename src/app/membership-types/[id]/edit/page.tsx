import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import MembershipTypeForm from '@/components/MembershipTypeForm'

export default async function EditMembershipTypePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membershipType } = await supabase
    .from('membership_types')
    .select('*')
    .eq('id', id)
    .single()

  if (!membershipType) notFound()

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 px-6 py-4">
        <Link href="/membership-types" className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Tipos de membresía
        </Link>
      </header>
      <main className="max-w-xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Editar tipo de membresía</h2>
        <MembershipTypeForm membershipType={membershipType} />
      </main>
    </div>
  )
}
