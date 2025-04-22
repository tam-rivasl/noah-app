"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brush, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ToolsNavigation() {
  const pathname = usePathname()
  const isToolsPage = pathname.includes("/pixel-art-tools")

  return (
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <CardContent className="p-2">
        <div className="flex space-x-2">
          {isToolsPage ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="flex items-center gap-1">
                <ArrowLeft size={16} />
                Back to Noa
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/pixel-art-tools" className="flex items-center gap-1">
                <Brush size={16} />
                Pixel Art Tools
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
