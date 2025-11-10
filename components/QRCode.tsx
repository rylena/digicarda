'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeComponentProps {
  url: string
  size?: number
  fgColor?: string // New prop for foreground color
  bgColor?: string // New prop for background color
}

export default function QRCodeComponent({
  url,
  size = 200,
  fgColor = '#000000', // Default to black
  bgColor = '#FFFFFF', // Default to white
}: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Ensure fgColor and bgColor are used correctly
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      }).catch((err) => {
        console.error('Error generating QR code:', err)
      })
    }
  }, [url, size, fgColor, bgColor]) // Add fgColor and bgColor to dependencies

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-lg border-2 border-gray-200" />
      <p className="text-xs text-gray-500">Scan to share</p>
    </div>
  )
}

