import { getPendingTeamInviteById } from "@/app/actions/team-invite-actions";
import { AcceptInviteClient } from "@/components/auth/accept-invite-client";

export const runtime = "nodejs";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ inviteId?: string }>;
}) {
  const { inviteId = "" } = await searchParams;
  const invite = inviteId ? await getPendingTeamInviteById(inviteId) : null;

  return (
    <AcceptInviteClient
      initialInviteId={inviteId}
      initialInvite={invite}
    />
  );
}
