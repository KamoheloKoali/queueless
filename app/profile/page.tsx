import { redirect } from "next/navigation";

import { getProfileForCurrentUser } from "@/app/actions/user-actions";
import { ProfileClient } from "@/components/profile/profile-client";

export const runtime = "nodejs";

export default async function ProfilePage() {
  const profile = await getProfileForCurrentUser();

  if (!profile) {
    redirect("/sign-in?redirectTo=/profile");
  }

  return (
    <ProfileClient
      user={{
        name: profile.name,
        email: profile.email,
        image: profile.image,
        role: profile.role,
      }}
    />
  );
}
