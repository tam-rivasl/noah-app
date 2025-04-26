import NoaTamagotchi from "@/components/noa-tamagotchi";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="max-w-sm w-full">
        <NoaTamagotchi />
      </div>
    </main>
  );
}
