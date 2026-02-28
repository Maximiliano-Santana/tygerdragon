'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function QRScannerButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const router = useRouter()

  const handleClose = useCallback(() => {
    stopRef.current?.()
    stopRef.current = null
    setIsOpen(false)
    setScanning(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    async function startScanner() {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser')
        const reader = new BrowserQRCodeReader()

        if (cancelled || !videoRef.current) return

        setScanning(true)

        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result) return

            const text = result.getText()
            try {
              const url = new URL(text)
              const match = url.pathname.match(/^\/check\/([^/]+)$/)
              if (match) {
                controls.stop()
                setIsOpen(false)
                router.push(`/members/${match[1]}`)
              }
              // Si el QR no coincide con el patrón, seguir escaneando
            } catch {
              // No es una URL válida, seguir escaneando
            }
          }
        )

        stopRef.current = () => controls.stop()
      } catch {
        if (!cancelled) {
          toast.error('No se pudo acceder a la cámara. Verifica los permisos.')
          setIsOpen(false)
          setScanning(false)
        }
      }
    }

    startScanner()

    return () => {
      cancelled = true
      stopRef.current?.()
      stopRef.current = null
    }
  }, [isOpen, router])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Escanear QR"
        className="flex items-center justify-center p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/>
          <rect width="5" height="5" x="3" y="16" rx="1"/>
          <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
          <path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/>
          <path d="M16 12h1"/><path d="M21 12v.01"/>
          <path d="M12 21v-1"/>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Escanear QR de miembro</h3>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Visor de cámara */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />

              {/* Overlay con esquinas */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-52 h-52">
                  {/* Esquinas del visor */}
                  <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-orange-400 rounded-tl-md" />
                  <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-orange-400 rounded-tr-md" />
                  <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-orange-400 rounded-bl-md" />
                  <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-orange-400 rounded-br-md" />
                </div>
              </div>

              {/* Estado cargando */}
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin text-orange-400">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <p className="text-zinc-400 text-sm">Iniciando cámara...</p>
                </div>
              )}
            </div>

            <p className="text-zinc-500 text-sm text-center">
              Apunta al código QR del miembro para acceder a su perfil
            </p>

          </div>
        </div>
      )}
    </>
  )
}
