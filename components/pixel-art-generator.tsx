"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy } from "lucide-react"

export default function PixelArtGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState("noa-eating")
  const [imageUrl, setImageUrl] = useState<string>("")

  // Generate pixel art when tab changes
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Set transparent background
        ctx.fillStyle = "rgba(0, 0, 0, 0)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw the selected pixel art
        drawPixelArt(ctx, activeTab)

        // Convert canvas to image URL
        setImageUrl(canvas.toDataURL("image/png"))
      }
    }
  }, [activeTab])

  // Function to draw pixel art based on selected tab
  const drawPixelArt = (ctx: CanvasRenderingContext2D, type: string) => {
    // Set up the canvas for pixel art
    ctx.imageSmoothingEnabled = false

    // Define colors
    const colors = {
      transparent: "rgba(0, 0, 0, 0)",
      cream: "#f5f0e0",
      darkBrown: "#8b4513",
      lightBrown: "#d2b48c",
      pink: "#ffb6c1",
      black: "#000000",
      white: "#ffffff",
      blue: "#87ceeb",
      red: "#ff6347",
      orange: "#ffa500",
      yellow: "#ffff00",
      green: "#90ee90",
      purple: "#dda0dd",
      gray: "#808080",
      lightGray: "#d3d3d3",
    }

    // Set pixel size
    const pixelSize = 8

    switch (type) {
      case "noa-eating":
        drawNoaEating(ctx, colors, pixelSize)
        break
      case "noa-worried":
        drawNoaWorried(ctx, colors, pixelSize)
        break
      case "hand":
        drawHand(ctx, colors, pixelSize)
        break
      case "ball":
        drawBall(ctx, colors, pixelSize)
        break
      default:
        break
    }
  }

  // Function to download the generated image
  const downloadImage = () => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${activeTab}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Function to copy the image to clipboard
  const copyToClipboard = async () => {
    try {
      const blob = await fetch(imageUrl).then((r) => r.blob())
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      alert("Image copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy image: ", err)
      alert("Failed to copy image. Try downloading instead.")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Noa Pixel Art Generator</CardTitle>
        <CardDescription>Generate pixel art for Noa in different states with transparent backgrounds</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="noa-eating">Noa Eating</TabsTrigger>
            <TabsTrigger value="noa-worried">Noa Worried</TabsTrigger>
            <TabsTrigger value="hand">Petting Hand</TabsTrigger>
            <TabsTrigger value="ball">Play Ball</TabsTrigger>
          </TabsList>

          <div className="flex flex-col items-center space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <canvas ref={canvasRef} width={128} height={128} className="pixel-art w-64 h-64 bg-grid" />
            </div>

            <div className="flex space-x-4">
              <Button onClick={downloadImage} className="flex items-center gap-2">
                <Download size={16} />
                Download
              </Button>
              <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
                <Copy size={16} />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Drawing functions for each pixel art type
function drawNoaEating(ctx: CanvasRenderingContext2D, colors: Record<string, string>, pixelSize: number) {
  // Base shape (cream colored dog)
  const baseColor = colors.cream

  // Draw the base shape (head)
  ctx.fillStyle = baseColor
  // Head outline
  for (let y = 3; y < 13; y++) {
    for (let x = 3; x < 13; x++) {
      if (
        (y === 3 && x >= 5 && x <= 10) ||
        (y === 4 && x >= 4 && x <= 11) ||
        (y >= 5 && y <= 10 && x >= 3 && x <= 12) ||
        (y === 11 && x >= 4 && x <= 11) ||
        (y === 12 && x >= 5 && x <= 10)
      ) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  // Draw dark brown outline
  ctx.fillStyle = colors.darkBrown
  // Top outline
  for (let x = 5; x <= 10; x++) {
    ctx.fillRect(x * pixelSize, 2 * pixelSize, pixelSize, pixelSize)
  }
  // Left and right sides
  for (let y = 3; y <= 12; y++) {
    if (y === 3 || y === 12) {
      ctx.fillRect(4 * pixelSize, y * pixelSize, pixelSize, pixelSize)
      ctx.fillRect(11 * pixelSize, y * pixelSize, pixelSize, pixelSize)
    } else if (y === 4 || y === 11) {
      ctx.fillRect(3 * pixelSize, y * pixelSize, pixelSize, pixelSize)
      ctx.fillRect(12 * pixelSize, y * pixelSize, pixelSize, pixelSize)
    } else {
      ctx.fillRect(2 * pixelSize, y * pixelSize, pixelSize, pixelSize)
      ctx.fillRect(13 * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }
  // Bottom outline
  for (let x = 5; x <= 10; x++) {
    ctx.fillRect(x * pixelSize, 13 * pixelSize, pixelSize, pixelSize)
  }

  // Draw eyes (closed/happy)
  ctx.fillStyle = colors.black
  ctx.fillRect(5 * pixelSize, 7 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(10 * pixelSize, 7 * pixelSize, pixelSize, pixelSize)

  // Draw mouth (open for eating)
  ctx.fillStyle = colors.darkBrown
  ctx.fillRect(7 * pixelSize, 9 * pixelSize, 2 * pixelSize, 2 * pixelSize)

  // Draw food near mouth
  ctx.fillStyle = colors.orange
  ctx.fillRect(6 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(5 * pixelSize, 11 * pixelSize, pixelSize, pixelSize)

  // Draw ears
  ctx.fillStyle = colors.cream
  // Left ear
  ctx.fillRect(3 * pixelSize, 5 * pixelSize, 2 * pixelSize, 2 * pixelSize)
  // Right ear
  ctx.fillRect(11 * pixelSize, 5 * pixelSize, 2 * pixelSize, 2 * pixelSize)

  // Ear outlines
  ctx.fillStyle = colors.darkBrown
  // Left ear outline
  ctx.fillRect(2 * pixelSize, 4 * pixelSize, pixelSize, 3 * pixelSize)
  ctx.fillRect(3 * pixelSize, 3 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(4 * pixelSize, 4 * pixelSize, pixelSize, pixelSize)
  // Right ear outline
  ctx.fillRect(13 * pixelSize, 4 * pixelSize, pixelSize, 3 * pixelSize)
  ctx.fillRect(12 * pixelSize, 3 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 4 * pixelSize, pixelSize, pixelSize)
}

function drawNoaWorried(ctx: CanvasRenderingContext2D, colors: Record<string, string>, pixelSize: number) {
  // Base shape (cream colored dog)
  const baseColor = colors.cream

  // Draw the base shape (head)
  ctx.fillStyle = baseColor
  // Head outline
  for (let y = 3; y < 13; y++) {
    for (let x = 3; x < 13; x++) {
      if (
        (y === 3 && x >= 5 && x <= 10) ||
        (y === 4 && x >= 4 && x <= 11) ||
        (y >= 5 && y <= 10 && x >= 3 && x <= 12) ||
        (y === 11 && x >= 4 && x <= 11) ||
        (y === 12 && x >= 5 && x <= 10)
      ) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  // Draw dark brown outline
  ctx.fillStyle = colors.darkBrown
  // Top outline
  for (let x = 5; x <= 10; x++) {
    ctx.fillRect(x * pixelSize, 2 * pixelSize, pixelSize, pixelSize)
  }
  // Left and right sides
  for (let y = 3; y <= 12; y++) {
    if (y === 3 || y === 12) {
      ctx.fillRect(4 * pixelSize, y * pixelSize, pixelSize, pixelSize)
      ctx.fillRect(11 * pixelSize, y * pixelSize, pixelSize, pixelSize)
    } else if (y === 4 || y === 11) {
      ctx.fillRect(3 * pixelSize, y * pixelSize, pixelSize, pixelSize)
      ctx.fillRect(12 * pixelSize, y * pixelSize, pixelSize, pixelSize)
    } else {
      ctx.fillRect(2 * pixelSize, y * pixelSize, pixelSize, pixelSize)
      ctx.fillRect(13 * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }
  // Bottom outline
  for (let x = 5; x <= 10; x++) {
    ctx.fillRect(x * pixelSize, 13 * pixelSize, pixelSize, pixelSize)
  }

  // Draw eyes (worried)
  ctx.fillStyle = colors.black
  ctx.fillRect(5 * pixelSize, 7 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(10 * pixelSize, 7 * pixelSize, pixelSize, pixelSize)

  // Draw eyebrows (worried)
  ctx.fillStyle = colors.darkBrown
  ctx.fillRect(4 * pixelSize, 6 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 6 * pixelSize, pixelSize, pixelSize)

  // Draw mouth (worried)
  ctx.fillStyle = colors.darkBrown
  ctx.fillRect(7 * pixelSize, 10 * pixelSize, 2 * pixelSize, pixelSize)

  // Draw ears (droopy for worried)
  ctx.fillStyle = colors.cream
  // Left ear
  ctx.fillRect(3 * pixelSize, 6 * pixelSize, 2 * pixelSize, 2 * pixelSize)
  // Right ear
  ctx.fillRect(11 * pixelSize, 6 * pixelSize, 2 * pixelSize, 2 * pixelSize)

  // Ear outlines
  ctx.fillStyle = colors.darkBrown
  // Left ear outline
  ctx.fillRect(2 * pixelSize, 6 * pixelSize, pixelSize, 3 * pixelSize)
  ctx.fillRect(3 * pixelSize, 5 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(4 * pixelSize, 5 * pixelSize, pixelSize, pixelSize)
  // Right ear outline
  ctx.fillRect(13 * pixelSize, 6 * pixelSize, pixelSize, 3 * pixelSize)
  ctx.fillRect(12 * pixelSize, 5 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 5 * pixelSize, pixelSize, pixelSize)

  // Add sweat drop for worried expression
  ctx.fillStyle = colors.blue
  ctx.fillRect(4 * pixelSize, 8 * pixelSize, pixelSize, pixelSize)
}

function drawHand(ctx: CanvasRenderingContext2D, colors: Record<string, string>, pixelSize: number) {
  // Draw a simple pixel art hand for petting
  ctx.fillStyle = colors.lightBrown

  // Palm
  for (let y = 6; y <= 9; y++) {
    for (let x = 5; x <= 10; x++) {
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }

  // Thumb
  for (let y = 10; y <= 12; y++) {
    ctx.fillRect(4 * pixelSize, y * pixelSize, pixelSize, pixelSize)
  }
  ctx.fillRect(5 * pixelSize, 12 * pixelSize, pixelSize, pixelSize)

  // Fingers
  for (let x = 6; x <= 9; x++) {
    for (let y = 3; y <= 5; y++) {
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }

  // Outline
  ctx.fillStyle = colors.darkBrown

  // Top outline
  for (let x = 6; x <= 9; x++) {
    ctx.fillRect(x * pixelSize, 2 * pixelSize, pixelSize, pixelSize)
  }

  // Left outline
  ctx.fillRect(5 * pixelSize, 3 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(4 * pixelSize, 4 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 5 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 6 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 7 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 8 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 9 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 11 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(3 * pixelSize, 12 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(4 * pixelSize, 13 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(5 * pixelSize, 13 * pixelSize, pixelSize, pixelSize)

  // Right outline
  ctx.fillRect(10 * pixelSize, 3 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 4 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 5 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 6 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 7 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 8 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(11 * pixelSize, 9 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(10 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(9 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(8 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(7 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(6 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
}

function drawBall(ctx: CanvasRenderingContext2D, colors: Record<string, string>, pixelSize: number) {
  // Draw a colorful pixel art ball

  // Ball base (circle)
  ctx.fillStyle = colors.pink

  // Center of the ball
  const centerX = 8
  const centerY = 8
  const radius = 5

  // Draw the ball
  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      // Calculate distance from center
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

      if (distance <= radius) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  // Ball outline
  ctx.fillStyle = colors.darkBrown

  // Draw the outline
  for (let y = centerY - radius - 1; y <= centerY + radius + 1; y++) {
    for (let x = centerX - radius - 1; x <= centerX + radius + 1; x++) {
      // Calculate distance from center
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

      if (distance > radius && distance <= radius + 1) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  // Add some details/patterns to the ball
  ctx.fillStyle = colors.white

  // Highlight (top-left)
  ctx.fillRect((centerX - 2) * pixelSize, (centerY - 2) * pixelSize, pixelSize, pixelSize)
  ctx.fillRect((centerX - 3) * pixelSize, (centerY - 3) * pixelSize, pixelSize, pixelSize)

  // Star pattern
  ctx.fillStyle = colors.yellow
  ctx.fillRect(centerX * pixelSize, (centerY - 1) * pixelSize, pixelSize, pixelSize)
  ctx.fillRect((centerX - 1) * pixelSize, centerY * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(centerX * pixelSize, centerY * pixelSize, pixelSize, pixelSize)
  ctx.fillRect((centerX + 1) * pixelSize, centerY * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(centerX * pixelSize, (centerY + 1) * pixelSize, pixelSize, pixelSize)
}
