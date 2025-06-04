import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AudioProvider } from "@/components/audio-provider"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Noa Tamagotchi",
  description: "A virtual pet named Noa",
    generator: 'v0.dev'
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
