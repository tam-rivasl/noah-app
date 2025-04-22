import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PixelArtGenerator from "@/components/pixel-art-generator"
import BackgroundRemover from "@/components/background-remover"
import PixelArtAssets from "@/components/pixel-art-assets"

export default function PixelArtToolsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-blue-50">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">Noa Pixel Art Tools</h1>

      <Tabs defaultValue="generator" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Pixel Art Generator</TabsTrigger>
          <TabsTrigger value="background-remover">Background Remover</TabsTrigger>
          <TabsTrigger value="assets">Ready-Made Assets</TabsTrigger>
        </TabsList>
        <TabsContent value="generator">
          <PixelArtGenerator />
        </TabsContent>
        <TabsContent value="background-remover">
          <BackgroundRemover />
        </TabsContent>
        <TabsContent value="assets">
          <PixelArtAssets />
        </TabsContent>
      </Tabs>
    </main>
  )
}
