import { getCheckoutPaymentDetails } from "@/app/actions/checkout-actions";
import { getViewerSession } from "@/app/actions/user-actions";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const runtime = "nodejs";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export default async function CheckoutPage() {
  const [paymentDetails, viewer] = await Promise.all([
    getCheckoutPaymentDetails(),
    getViewerSession(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <CheckoutClient
        {...paymentDetails}
        isAuthenticated={Boolean(viewer)}
        userName={viewer?.name || viewer?.email || "Guest"}
        userInitials={getInitials(viewer?.name || viewer?.email || "Guest")}
        userImage={viewer?.image ?? null}
      />
    </main>
  );
}
