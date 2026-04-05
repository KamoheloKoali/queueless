import { getPaymentSettingsForAdmin } from "@/app/actions/checkout-actions";
import { PaymentSettingsClient } from "@/components/admin/payment-settings-client";

export default async function AdminSettingsPage() {
  const settings = await getPaymentSettingsForAdmin();

  return <PaymentSettingsClient {...settings} />;
}
