import {
  getTeamPageData,
} from "@/app/actions/admin-actions";
import { TeamManagementClient } from "@/components/admin/team-management-client";

export default async function TeamPage() {
  const { currentUser, users, invites } = await getTeamPageData();

  return (
    <TeamManagementClient
      currentUserId={currentUser.id}
      users={users}
      invites={invites}
    />
  );
}
