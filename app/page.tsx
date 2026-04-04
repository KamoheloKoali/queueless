import { FoodOrderingClient } from "@/components/food-ordering/food-ordering-client";

export default function Home() {
  return (
    <main className="relative flex flex-1 overflow-hidden">
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
        <FoodOrderingClient />
      </section>
    </main>
  );
}
