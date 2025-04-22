import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PixelArtAssetsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-blue-50">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">Noa Pixel Art Assets</h1>

      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">How to Use These Assets</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">1. Generate New Pixel Art</h3>
            <p className="mb-4">
              Use the Pixel Art Generator to create new images for Noa in different states. You can download these
              images and add them to your project.
            </p>
            <Button asChild>
              <Link href="/pixel-art-tools?tab=generator">Go to Pixel Art Generator</Link>
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">2. Remove Backgrounds</h3>
            <p className="mb-4">
              Use the Background Remover to make existing images transparent. This ensures seamless integration with
              your Tamagotchi app.
            </p>
            <Button asChild>
              <Link href="/pixel-art-tools?tab=background-remover">Go to Background Remover</Link>
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">3. Use Ready-Made Assets</h3>
            <p className="mb-4">
              Browse and download pre-made pixel art assets for Noa and accessories. These are ready to use in your
              Tamagotchi app.
            </p>
            <Button asChild>
              <Link href="/pixel-art-tools?tab=assets">Browse Ready-Made Assets</Link>
            </Button>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-2">Implementation Guide</h3>
            <p className="mb-4">To use these assets in your Noa Tamagotchi app:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Download the images you want to use</li>
              <li>
                Place them in the <code className="bg-gray-100 px-1 rounded">public/images</code> directory of your
                project
              </li>
              <li>
                Update the <code className="bg-gray-100 px-1 rounded">NoaSprite</code> component to use the new images
              </li>
              <li>Add new states and animations as needed</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}
