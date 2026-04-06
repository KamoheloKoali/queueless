import { getOpeningHoursForAdmin } from "@/app/actions/checkout-actions";
import { OpeningHoursClient } from "@/components/admin/opening-hours-client";

export default async function AdminOpeningHoursPage() {
  const settings = await getOpeningHoursForAdmin();

  return <OpeningHoursClient {...settings} />;
}
