'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRDisplay({ url, memberName }: { url: string; memberName: string }) {
  async function handleShareQR() {
    const svg = document.getElementById('qr-svg') as SVGElement | null
    if (!svg) return

    // Serializar SVG → blob URL
    const svgStr = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Dibujar en canvas para obtener PNG
    const img = new window.Image()
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 200, 200)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(svgUrl)

      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], `qr-${memberName}.png`, { type: 'image/png' })

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `QR de acceso — ${memberName}`,
          })
        } else {
          // Fallback: descargar la imagen
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `qr-${memberName}.png`
          a.click()
        }
      }, 'image/png')
    }
    img.src = svgUrl
  }

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>QR - ${memberName}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff">
        <h2 style="margin-bottom:16px;font-size:20px">${memberName}</h2>
        <div id="qr">${document.getElementById('qr-container')?.innerHTML}</div>
        <p style="margin-top:16px;color:#666;font-size:12px">Escanea para verificar acceso</p>
        <script>window.onload=()=>window.print()</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div id="qr-container" className="bg-white p-4 rounded-xl">
        <QRCodeSVG
          id="qr-svg"
          value={url}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
        />
      </div>
      <p className="text-xs text-zinc-500 break-all text-center max-w-xs">{url}</p>
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
