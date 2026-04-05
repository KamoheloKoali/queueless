"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteOwnAccount, updateProfile } from "@/app/actions/user-actions";
import { UserPageHeader } from "@/components/food-ordering/user-page-header";
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
import { UploadDropzone } from "@/lib/uploadthing";
import { authClient } from "@/lib/auth-client";

type ProfileClientProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [image, setImage] = useState(user.image ?? "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      let result;
      try {
        result = await updateProfile({
          name,
          email,
          image,
        });
      } catch {
        toast.error("Failed to update profile.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  };

  const onDeleteAccount = () => {
    startTransition(async () => {
      let result;
      try {
        result = await deleteOwnAccount();
      } catch {
        toast.error("Failed to delete account.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      await authClient.signOut();
      toast.success(result.message);
      router.push("/sign-in");
      router.refresh();
    });
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <UserPageHeader
        title="Profile"
        isAuthenticated
        userName={name || email}
        userInitials={getInitials(name || email)}
        userImage={image || null}
      />
      <Card className="rounded-xl border py-0">
        <CardHeader className="px-4 py-3">
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Name</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Email</label>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="h-10 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Profile Photo</label>
            <UploadDropzone
              endpoint="profileImage"
              appearance={{
                button: "bg-primary text-primary-foreground p-2 w-sm mb-2",
              }}
              onClientUploadComplete={(res) => {
                const uploadedFile = res?.[0];
                const uploadedUrl = uploadedFile?.ufsUrl;

                if (!uploadedUrl) {
                  toast.error("Upload finished without a file URL.");
                  return;
                }

                setImage(uploadedUrl);
                toast.success("Profile photo uploaded.");
              }}
              onUploadError={(error) => {
                toast.error(error.message);
              }}
            />
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="h-28 w-28 rounded-full border object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="rounded-md" onClick={onSave} disabled={isPending}>
              Save Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-md"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md rounded-xl border p-5">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              Are you sure? This action is permanent and will remove your account data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onDeleteAccount} disabled={isPending}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
