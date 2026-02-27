'use client'

import { useState } from 'react'

export default function PhotoViewer({ src, name }: { src: string; name: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="shrink-0 focus:outline-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="w-14 h-14 rounded-full object-cover border-2 border-zinc-700 hover:border-orange-500 transition-colors"
        />
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name}
            className="max-w-sm w-full rounded-2xl object-cover shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
