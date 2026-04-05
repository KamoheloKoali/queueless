import { headers } from "next/headers";

import { FoodOrderingClient } from "@/components/food-ordering/food-ordering-client";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userDisplayName =
    session?.user.name?.trim() || session?.user.email || "Guest";

  return (
    <main className="relative flex flex-1 overflow-hidden">
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
        <FoodOrderingClient userDisplayName={userDisplayName} />
      </section>
    </main>
  );
}
