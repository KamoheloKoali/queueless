import { headers } from "next/headers";

import { getProductsForConsumers } from "@/app/actions/product-actions";
import { FoodOrderingClient } from "@/components/food-ordering/food-ordering-client";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userDisplayName =
    session?.user.name?.trim() || session?.user.email || "Guest";
  const products = await getProductsForConsumers();

  return (
    <main className="relative flex flex-1 overflow-hidden">
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <FoodOrderingClient
          userDisplayName={userDisplayName}
          userImage={session?.user.image ?? null}
          products={products}
          isAuthenticated={Boolean(session)}
        />
      </section>
    </main>
  );
}
