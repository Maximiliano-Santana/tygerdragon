'use client'

import { useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

interface Props {
  url: string
  memberName: string
  membershipType?: string | null
}

export default function QRDisplay({ url, memberName, membershipType }: Props) {
  const hiddenQRRef = useRef<HTMLDivElement>(null)

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  async function buildCard(): Promise<Blob> {
    const qrCanvas = hiddenQRRef.current?.querySelector('canvas') as HTMLCanvasElement
    if (!qrCanvas) throw new Error('QR canvas not found')

    const logo = await loadImage('/logo-horizontal.png')

    // Dimensiones lógicas de la tarjeta
    const scale = 3          // 3x para alta resolución
    const W = 360
    const PAD = 28
    const QR_SIZE = 260
    const LOGO_W = 150
    const LOGO_H = Math.round((logo.naturalHeight / logo.naturalWidth) * LOGO_W)

    const H =
      4 +           // barra naranja
      PAD +         // padding top
      LOGO_H +      // logo
      20 +          // gap
      1 +           // divider
      20 +          // gap
      QR_SIZE +     // QR
      24 +          // gap
      22 +          // nombre
      (membershipType ? 8 + 18 : 0) + // membresía (opcional)
      20 +          // gap
      14 +          // footer
      PAD           // padding bottom

    const canvas = document.createElement('canvas')
    canvas.width = W * scale
    canvas.height = H * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    // Fondo blanco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // Barra naranja top
    ctx.fillStyle = '#f97316'
    ctx.fillRect(0, 0, W, 4)

    let y = 4 + PAD

    // Logo centrado
    ctx.drawImage(logo, (W - LOGO_W) / 2, y, LOGO_W, LOGO_H)
    y += LOGO_H + 20

    // Divider
    ctx.fillStyle = '#eeeeee'
    ctx.fillRect(PAD, y, W - PAD * 2, 1)
    y += 1 + 20

    // QR centrado
    ctx.drawImage(qrCanvas, (W - QR_SIZE) / 2, y, QR_SIZE, QR_SIZE)
    y += QR_SIZE + 24

    // Nombre
    ctx.fillStyle = '#111111'
    ctx.font = `bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(memberName, W / 2, y)
    y += 22

    // Tipo de membresía
    if (membershipType) {
      y += 8
      ctx.fillStyle = '#888888'
      ctx.font = `14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
      ctx.fillText(membershipType, W / 2, y)
      y += 18
    }

    y += 20

    // Footer
    ctx.fillStyle = '#cccccc'
    ctx.font = `11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText('Escanea para verificar acceso', W / 2, y)

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        'image/png'
      )
    })
  }

  async function handleShareQR() {
    const blob = await buildCard()
    const file = new File([blob], `qr-${memberName}.png`, { type: 'image/png' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `QR de acceso — ${memberName}` })
    } else {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `qr-${memberName}.png`
      link.click()
    }
  }

  async function handlePrint() {
    const blob = await buildCard()
    const imgUrl = URL.createObjectURL(blob)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>QR - ${memberName}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f4f4f4; }
            img { max-width: 360px; width: 100%; }
          </style>
        </head>
        <body>
          <img src="${imgUrl}" />
          <script>window.onload = () => window.print()<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR oculto de alta resolución para generar la tarjeta */}
      <div ref={hiddenQRRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <QRCodeCanvas value={url} size={520} level="H" bgColor="#ffffff" fgColor="#000000" />
      </div>

      {/* QR visible */}
      <div className="bg-white p-4 rounded-xl">
        <QRCodeSVG value={url} size={200} bgColor="#ffffff" fgColor="#000000" level="H" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleShareQR}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.535 5.856L.057 23.516a.75.75 0 0 0 .908.928l5.42-1.433A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.373-1.567l-.385-.23-3.992 1.055 1.07-3.878-.253-.4A9.951 9.951 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Compartir QR
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Imprimir
        </button>
      </div>
    </div>
  )
}
