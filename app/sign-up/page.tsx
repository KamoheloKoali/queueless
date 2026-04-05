"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    setIsPending(false);

    if (result.error) {
      toast.error(result.error.message ?? "Unable to create account.");
      return;
    }

    toast.success("Account created successfully.");
    router.push("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-xl border py-0">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="font-sans text-xl">Sign up</CardTitle>
          <CardDescription>
            Create your account to start placing orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                autoComplete="new-password"
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
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
