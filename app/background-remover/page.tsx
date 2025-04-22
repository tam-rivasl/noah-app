import BackgroundRemover from "@/components/background-remover"

export default function BackgroundRemoverPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-blue-50">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">Noa Image Background Remover</h1>
      <BackgroundRemover />
    </main>
  )
}
