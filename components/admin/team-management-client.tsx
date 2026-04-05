"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  inviteTeamMember,
  revokeTeamInvite,
  updateTeamMemberRole,
} from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "users";
};

type TeamInvite = {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "users";
  status: "pending" | "accepted" | "revoked";
  createdAt: Date;
};

type TeamManagementClientProps = {
  currentUserId: string;
  users: TeamUser[];
  invites: TeamInvite[];
};

type PendingAction =
  | {
      type: "role";
      userId: string;
      userName: string;
      targetRole: "super_admin" | "admin";
    }
  | {
      type: "invite";
      inviteId: string;
      inviteEmail: string;
    };

function roleActionForUser(user: TeamUser): {
  label: string;
  targetRole: "super_admin" | "admin";
} {
  if (user.role === "users") {
    return { label: "Promote to admin", targetRole: "admin" };
  }
  if (user.role === "admin") {
    return { label: "Promote to super admin", targetRole: "super_admin" };
  }
  return { label: "Demote to admin", targetRole: "admin" };
}

export function TeamManagementClient({
  currentUserId,
  users,
  invites,
}: TeamManagementClientProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "super_admin">("admin");
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        const order = { super_admin: 0, admin: 1, users: 2 } as const;
        return order[a.role] - order[b.role];
      }),
    [users],
  );

  const onInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      let result;
      try {
        result = await inviteTeamMember({
          email,
          role: inviteRole,
        });
      } catch {
        toast.error("Failed to send invite.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setEmail("");
      setInviteRole("admin");
      router.refresh();
    });
  };

  const confirmRoleUpdate = () => {
    if (!pendingAction || pendingAction.type !== "role") return;

    startTransition(async () => {
      let result;
      try {
        result = await updateTeamMemberRole({
          userId: pendingAction.userId,
          role: pendingAction.targetRole,
        });
      } catch {
        toast.error("Failed to update role.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setPendingAction(null);
      router.refresh();
    });
  };

  const confirmInviteRevoke = () => {
    if (!pendingAction || pendingAction.type !== "invite") return;

    startTransition(async () => {
      let result;
      try {
        result = await revokeTeamInvite({
          inviteId: pendingAction.inviteId,
        });
      } catch {
        toast.error("Failed to revoke invite.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setPendingAction(null);
      router.refresh();
    });
  };

  return (
    <section className="space-y-4">
      <Card className="rounded-xl border py-0">
        <CardHeader className="px-4 py-3">
          <CardTitle>Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <form onSubmit={onInviteSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              name="email"
              type="email"
              required
              placeholder="member@company.com"
              className="h-10 rounded-md"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <select
              name="role"
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(event.target.value as "admin" | "super_admin")
              }
              className="h-10 rounded-md border bg-background px-3 text-xs"
            >
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <Button type="submit" className="h-10 rounded-md" disabled={isPending}>
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border py-0">
        <CardHeader className="px-4 py-3">
          <CardTitle>Manage Team Members</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => {
                  const action = roleActionForUser(user);
                  const disableRoleChange = isPending || user.id === currentUserId;

                  return (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-2 font-medium">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className="rounded-full">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-md"
                          disabled={disableRoleChange}
                          onClick={() =>
                            setPendingAction({
                              type: "role",
                              userId: user.id,
                              userName: user.name,
                              targetRole: action.targetRole,
                            })
                          }
                        >
                          {action.label}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border py-0">
        <CardHeader className="px-4 py-3">
          <CardTitle>Invites</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-t">
                    <td className="px-4 py-2">{invite.email}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="rounded-full">
                        {invite.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="rounded-full">
                        {invite.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {invite.status === "pending" ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-md"
                          disabled={isPending}
                          onClick={() =>
                            setPendingAction({
                              type: "invite",
                              inviteId: invite.id,
                              inviteEmail: invite.email,
                            })
                          }
                        >
                          Revoke
                        </Button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <DialogContent className="max-w-md rounded-xl border p-5">
          {pendingAction?.type === "role" ? (
            <>
              <DialogHeader>
                <DialogTitle>Confirm role update</DialogTitle>
                <DialogDescription>
                  Update {pendingAction.userName}&apos;s role to{" "}
                  <span className="font-medium text-foreground">
                    {pendingAction.targetRole}
                  </span>
                  ?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPendingAction(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={confirmRoleUpdate} disabled={isPending}>
                  Confirm
                </Button>
              </DialogFooter>
            </>
          ) : null}

          {pendingAction?.type === "invite" ? (
            <>
              <DialogHeader>
                <DialogTitle>Revoke invite</DialogTitle>
                <DialogDescription>
                  Revoke pending invite for{" "}
                  <span className="font-medium text-foreground">
                    {pendingAction.inviteEmail}
                  </span>
                  ?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPendingAction(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={confirmInviteRevoke} disabled={isPending}>
                  Revoke
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
