'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRDisplay({ url, memberName }: { url: string; memberName: string }) {
  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>QR - ${memberName}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff">
        <h2 style="margin-bottom:16px;font-size:20px">${memberName}</h2>
        <img src="${document.getElementById('qr-svg')?.closest('svg') ? '' : ''}" />
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
          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Tu código de acceso TygerDragon: ${url}`)}`)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          WhatsApp
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Imprimir
        </button>
      </div>
    </div>
  )
}
