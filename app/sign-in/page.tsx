"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const redirectTo = searchParams.get("redirectTo");
  const callbackURL =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL,
    });

    setIsPending(false);

    if (result.error) {
      toast.error(result.error.message ?? "Unable to sign in.");
      return;
    }

    toast.success("Signed in successfully.");
    router.push(callbackURL);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-xl border py-0">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="font-sans text-xl">Sign in</CardTitle>
          <CardDescription>
            Access your account to continue ordering.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 rounded-md"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs text-muted-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 rounded-md"
              />
            </div>
            <Button
              type="submit"
              className="h-10 w-full rounded-md"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-foreground underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
