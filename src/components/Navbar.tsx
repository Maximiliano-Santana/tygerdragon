'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/dashboard', label: 'Miembros' },
  { href: '/membership-types', label: 'Membresías' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/members')
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            TygerDragon
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-orange-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop logout */}
        <button
          onClick={handleLogout}
          className="hidden md:block text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-zinc-900 border-l border-zinc-800 z-50 md:hidden flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <span className="text-white font-bold text-lg">TygerDragon</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex flex-col px-4 py-4 gap-1 flex-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-4 py-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}
