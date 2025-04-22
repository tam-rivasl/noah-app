"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"

export default function PixelArtAssets() {
  const [activeTab, setActiveTab] = useState("noa")

  // Asset categories
  const assetCategories = {
    noa: [
      { name: "Noa Eating", path: "/images/noa-eating.png" },
      { name: "Noa Worried", path: "/images/noa-worried.png" },
      { name: "Noa Normal (Transparent)", path: "/images/noa-normal-transparent.png" },
      { name: "Noa Happy (Transparent)", path: "/images/noa-happy-transparent.png" },
      { name: "Noa Sad (Transparent)", path: "/images/noa-sad-transparent.png" },
      { name: "Noa Sleeping (Transparent)", path: "/images/noa-sleeping-transparent.png" },
    ],
    items: [
      { name: "Pet Hand", path: "/images/pet-hand.png" },
      { name: "Play Ball", path: "/images/play-ball.png" },
      { name: "Food Bowl", path: "/images/food-bowl.png" },
    ],
  }

  // Function to download an asset
  const downloadAsset = (path: string, name: string) => {
    const link = document.createElement("a")
    link.href = path
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Function to copy an asset to clipboard
  const copyAssetPath = (path: string) => {
    navigator.clipboard
      .writeText(path)
      .then(() => {
        alert(`Path copied to clipboard: ${path}`)
      })
      .catch((err) => {
        console.error("Failed to copy path: ", err)
        alert("Failed to copy path. Try downloading instead.")
      })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Noa Pixel Art Assets</CardTitle>
        <CardDescription>Ready-to-use pixel art assets for the Noa Tamagotchi app</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="noa">Noa Characters</TabsTrigger>
            <TabsTrigger value="items">Items & Accessories</TabsTrigger>
          </TabsList>

          <TabsContent value="noa" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {assetCategories.noa.map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-2">
                  <div className="bg-grid rounded-lg p-2 mb-2 h-32 flex items-center justify-center">
                    <img
                      src={asset.path || "/placeholder.svg"}
                      alt={asset.name}
                      className="pixel-art max-h-full max-w-full"
                    />
                  </div>
                  <div className="text-sm font-medium mb-2">{asset.name}</div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => downloadAsset(asset.path, asset.name.toLowerCase().replace(/\s+/g, "-") + ".png")}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </Button>
                    <Button onClick={() => copyAssetPath(asset.path)} size="sm" variant="outline" className="flex-1">
                      <Copy size={14} className="mr-1" />
                      Copy Path
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {assetCategories.items.map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-2">
                  <div className="bg-grid rounded-lg p-2 mb-2 h-32 flex items-center justify-center">
                    <img
                      src={asset.path || "/placeholder.svg"}
                      alt={asset.name}
                      className="pixel-art max-h-full max-w-full"
                    />
                  </div>
                  <div className="text-sm font-medium mb-2">{asset.name}</div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => downloadAsset(asset.path, asset.name.toLowerCase().replace(/\s+/g, "-") + ".png")}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </Button>
                    <Button onClick={() => copyAssetPath(asset.path)} size="sm" variant="outline" className="flex-1">
                      <Copy size={14} className="mr-1" />
                      Copy Path
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
