'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeComponentProps {
  url: string
  size?: number
}

export default function QRCodeComponent({ url, size = 200 }: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch((err) => {
        console.error('Error generating QR code:', err)
      })
    }
  }, [url, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-lg border-2 border-gray-200" />
      <p className="text-xs text-gray-500">Scan to share</p>
    </div>
  )
}

