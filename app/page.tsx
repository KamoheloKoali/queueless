import { getProductsForConsumers } from "@/app/actions/product-actions";
import { getViewerSession } from "@/app/actions/user-actions";
import { FoodOrderingClient } from "@/components/food-ordering/food-ordering-client";

export const runtime = "nodejs";

export default async function Home() {
  const [viewer, products] = await Promise.all([
    getViewerSession(),
    getProductsForConsumers(),
  ]);

  const userDisplayName =
    viewer?.name?.trim() || viewer?.email || "Guest";

  return (
    <main className="relative flex flex-1 overflow-hidden">
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <FoodOrderingClient
          userDisplayName={userDisplayName}
          userImage={viewer?.image ?? null}
          products={products}
          isAuthenticated={Boolean(viewer)}
          userRole={viewer?.role ?? "users"}
        />
      </section>
    </main>
  );
}
