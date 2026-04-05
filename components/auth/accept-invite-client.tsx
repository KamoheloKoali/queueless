"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  acceptPendingTeamInvite,
  createAccountFromPendingInvite,
} from "@/app/actions/team-invite-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type InviteData = {
  id: string;
  email: string;
  role: "admin" | "super_admin";
  status: "pending";
  accountExists: boolean;
} | null;

type AcceptInviteClientProps = {
  initialInviteId: string;
  initialInvite: InviteData;
};

function formatRole(role: "admin" | "super_admin") {
  return role === "super_admin" ? "Super Admin" : "Admin";
}

export function AcceptInviteClient({
  initialInviteId,
  initialInvite,
}: AcceptInviteClientProps) {
  const router = useRouter();
  const [invite] = useState<InviteData>(initialInvite);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleAcceptExistingAccount = async () => {
    if (!invite?.id) return;

    setIsPending(true);
    const result = await acceptPendingTeamInvite({ inviteId: invite.id });
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push(`/sign-in?email=${encodeURIComponent(invite.email)}`);
  };

  const handleCreateAndAccept = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invite?.id) return;

    setIsPending(true);
    const result = await createAccountFromPendingInvite({
      inviteId: invite.id,
      name,
      password,
    });
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message);
      if ("requiresSignIn" in result && result.requiresSignIn && "email" in result && result.email) {
        router.push(`/sign-in?email=${encodeURIComponent(result.email)}`);
      }
      return;
    }

    toast.success(result.message);
    router.push(`/sign-in?email=${encodeURIComponent(result.email ?? invite.email)}`);
  };

  if (!initialInviteId || !invite) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-xl py-0">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="font-sans text-xl">Invite unavailable</CardTitle>
            <CardDescription>
              This invite link is invalid, expired, or already used.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 px-6 pb-6">
            <Button nativeButton={false} render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
              View products
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg rounded-xl py-0">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="font-sans text-xl">Accept team invitation</CardTitle>
          <CardDescription>
            You were invited as <strong>{formatRole(invite.role)}</strong> with{" "}
            <strong>{invite.email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          {invite.accountExists ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We found an existing account for this email. Click below to accept and apply your
                invited role.
              </p>
              <Button
                type="button"
                className="h-10 w-full rounded-md"
                onClick={handleAcceptExistingAccount}
                disabled={isPending}
              >
                {isPending ? "Accepting..." : "Accept invitation"}
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleCreateAndAccept}>
              <p className="text-sm text-muted-foreground">
                No account found for this email yet. Create your account below and your invited
                role will be applied immediately.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Email</label>
                <Input value={invite.email} disabled className="h-10 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs text-muted-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 rounded-md"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs text-muted-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 rounded-md"
                />
              </div>
              <Button type="submit" className="h-10 w-full rounded-md" disabled={isPending}>
                {isPending ? "Creating account..." : "Create account and accept invite"}
              </Button>
            </form>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Need another account?{" "}
            <Link href="/sign-up" className="text-foreground underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
