"use client"

import { useEffect, useRef } from "react"

export default function PixelArtIconsGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateIcons = async () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Load the source image
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = "/images/pet-hand.png"

      await new Promise((resolve) => {
        img.onload = resolve
      })

      // Set canvas size
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image
      ctx.drawImage(img, 0, 0)

      // Extract individual icons
      // These coordinates are approximate and may need adjustment
      const icons = [
        { name: "hand", x: 30, y: 430, width: 250, height: 250 },
        { name: "food", x: 370, y: 430, width: 250, height: 250 },
        { name: "bowl", x: 710, y: 430, width: 250, height: 250 },
        { name: "bone", x: 1050, y: 430, width: 250, height: 250 },
      ]

      // Create a temporary canvas for each icon
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      // Extract and save each icon
      icons.forEach((icon) => {
        tempCanvas.width = icon.width
        tempCanvas.height = icon.height

        // Draw the portion of the original image
        tempCtx.drawImage(img, icon.x, icon.y, icon.width, icon.height, 0, 0, icon.width, icon.height)

        // Convert to data URL
        const dataUrl = tempCanvas.toDataURL("image/png")

        // Create a download link
        const link = document.createElement("a")
        link.download = `${icon.name}.png`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    }

    generateIcons()
  }, [])

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  )
}
