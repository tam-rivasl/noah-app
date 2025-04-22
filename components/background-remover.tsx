"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const processedCanvasRef = useRef<HTMLCanvasElement>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Process the image when a file is selected
  useEffect(() => {
    if (previewUrl && canvasRef.current && processedCanvasRef.current) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Draw original image
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Process image to remove background
        const processedCanvas = processedCanvasRef.current!
        const processedCtx = processedCanvas.getContext("2d")!
        processedCanvas.width = img.width
        processedCanvas.height = img.height

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Create new image data with transparent background
        const processedImageData = processedCtx.createImageData(canvas.width, canvas.height)
        const processedData = processedImageData.data

        // Define background color to remove (assuming light background)
        // This is a simple implementation - for better results, you might need
        // more sophisticated algorithms
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          // Check if pixel is close to white/light color
          // This threshold can be adjusted based on your images
          if (r > 200 && g > 200 && b > 200) {
            // Make it transparent
            processedData[i] = 0
            processedData[i + 1] = 0
            processedData[i + 2] = 0
            processedData[i + 3] = 0
          } else {
            // Keep the original color
            processedData[i] = r
            processedData[i + 1] = g
            processedData[i + 2] = b
            processedData[i + 3] = a
          }
        }

        // Put the processed image data back
        processedCtx.putImageData(processedImageData, 0, 0)

        // Set the processed image URL
        setProcessedUrl(processedCanvas.toDataURL("image/png"))
      }
      img.src = previewUrl
    }
  }, [previewUrl])

  // Download the processed image
  const downloadImage = () => {
    if (processedUrl) {
      const link = document.createElement("a")
      link.href = processedUrl
      link.download = selectedFile ? `transparent-${selectedFile.name}` : "transparent-image.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Background Remover</CardTitle>
        <CardDescription>Remove the background from Noa's images to make them transparent</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
          </div>

          {previewUrl && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Original</h3>
                <div className="border border-gray-200 rounded-lg p-2 bg-grid">
                  <canvas ref={canvasRef} className="max-w-full h-auto" style={{ display: "none" }} />
                  <img src={previewUrl || "/placeholder.svg"} alt="Original" className="max-w-full h-auto pixel-art" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Transparent Background</h3>
                <div className="border border-gray-200 rounded-lg p-2 bg-grid">
                  <canvas ref={processedCanvasRef} className="max-w-full h-auto" style={{ display: "none" }} />
                  {processedUrl && (
                    <img
                      src={processedUrl || "/placeholder.svg"}
                      alt="Processed"
                      className="max-w-full h-auto pixel-art"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {processedUrl && (
            <Button onClick={downloadImage} className="flex items-center gap-2">
              <Download size={16} />
              Download Transparent Image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
