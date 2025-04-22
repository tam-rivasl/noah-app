import { NextResponse } from "next/server"
import { createCanvas } from "canvas"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Create directory if it doesn't exist
    const publicDir = path.join(process.cwd(), "public")
    const imagesDir = path.join(publicDir, "images")

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }

    // Generate and save assets
    generateNoaEating(imagesDir)
    generateNoaWorried(imagesDir)
    generatePetHand(imagesDir)
    generatePlayBall(imagesDir)
    generateFoodBowl(imagesDir)

    // Process existing images to make transparent versions
    makeTransparentVersions(imagesDir)

    return NextResponse.json({ success: true, message: "Assets generated successfully" })
  } catch (error) {
    console.error("Error generating assets:", error)
    return NextResponse.json({ success: false, error: "Failed to generate assets" }, { status: 500 })
  }
}

// Functions to generate each asset
function generateNoaEating(outputDir: string) {
  const canvas = createCanvas(96, 96)
  const ctx = canvas.getContext("2d")

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height)

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

  // Base shape (cream colored dog)
  ctx.fillStyle = colors.cream

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

  // Save the image
  const buffer = canvas.toBuffer("image/png")
  fs.writeFileSync(path.join(outputDir, "noa-eating.png"), buffer)
}

function generateNoaWorried(outputDir: string) {
  const canvas = createCanvas(96, 96)
  const ctx = canvas.getContext("2d")

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height)

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

  // Base shape (cream colored dog)
  ctx.fillStyle = colors.cream

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

  // Save the image
  const buffer = canvas.toBuffer("image/png")
  fs.writeFileSync(path.join(outputDir, "noa-worried.png"), buffer)
}

function generatePetHand(outputDir: string) {
  const canvas = createCanvas(96, 96)
  const ctx = canvas.getContext("2d")

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height)

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

  // Save the image
  const buffer = canvas.toBuffer("image/png")
  fs.writeFileSync(path.join(outputDir, "pet-hand.png"), buffer)
}

function generatePlayBall(outputDir: string) {
  const canvas = createCanvas(96, 96)
  const ctx = canvas.getContext("2d")

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height)

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

  // Save the image
  const buffer = canvas.toBuffer("image/png")
  fs.writeFileSync(path.join(outputDir, "play-ball.png"), buffer)
}

function generateFoodBowl(outputDir: string) {
  const canvas = createCanvas(96, 96)
  const ctx = canvas.getContext("2d")

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height)

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

  // Draw a food bowl

  // Bowl base
  ctx.fillStyle = colors.lightBlue

  // Bowl shape
  for (let y = 7; y <= 11; y++) {
    for (let x = 4; x <= 12; x++) {
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }

  // Bowl outline
  ctx.fillStyle = colors.darkBrown

  // Top outline
  for (let x = 4; x <= 12; x++) {
    ctx.fillRect(x * pixelSize, 6 * pixelSize, pixelSize, pixelSize)
  }

  // Bottom outline
  for (let x = 4; x <= 12; x++) {
    ctx.fillRect(x * pixelSize, 12 * pixelSize, pixelSize, pixelSize)
  }

  // Left and right outlines
  for (let y = 7; y <= 11; y++) {
    ctx.fillRect(3 * pixelSize, y * pixelSize, pixelSize, pixelSize)
    ctx.fillRect(13 * pixelSize, y * pixelSize, pixelSize, pixelSize)
  }

  // Food in the bowl
  ctx.fillStyle = colors.orange

  // Draw some food pieces
  ctx.fillRect(6 * pixelSize, 8 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(8 * pixelSize, 9 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(10 * pixelSize, 8 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(7 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)
  ctx.fillRect(9 * pixelSize, 10 * pixelSize, pixelSize, pixelSize)

  // Save the image
  const buffer = canvas.toBuffer("image/png")
  fs.writeFileSync(path.join(outputDir, "food-bowl.png"), buffer)
}

function makeTransparentVersions(outputDir: string) {
  const imageNames = ["noa-normal", "noa-happy", "noa-sad", "noa-sleeping"]

  for (const name of imageNames) {
    try {
      const imagePath = path.join(outputDir, `${name}.png`)

      // Check if the image exists
      if (fs.existsSync(imagePath)) {
        // Load the image
        const img = new Image()
        img.src = fs.readFileSync(imagePath)

        // Create a canvas
        const canvas = createCanvas(img.width, img.height)
        const ctx = canvas.getContext("2d")

        // Draw the image
        ctx.drawImage(img, 0, 0)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Make white/light background transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Check if pixel is close to white/light color
          if (r > 200 && g > 200 && b > 200) {
            // Make it transparent
            data[i + 3] = 0
          }
        }

        // Put the processed image data back
        ctx.putImageData(imageData, 0, 0)

        // Save the transparent version
        const buffer = canvas.toBuffer("image/png")
        fs.writeFileSync(path.join(outputDir, `${name}-transparent.png`), buffer)
      }
    } catch (error) {
      console.error(`Error processing ${name}:`, error)
    }
  }
}
