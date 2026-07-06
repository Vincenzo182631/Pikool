"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { useMe } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import * as React from "react";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: me, isLoading } = useMe();

  // Users without a profile belong in onboarding first.
  React.useEffect(() => {
    if (!isLoading && me && !me.profile) router.replace("/onboarding");
  }, [isLoading, me, router]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Edit profile"
        description="Update your player card and account details."
        action={
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        }
      />
      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update your player card.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading || !me ? (
            <div className="h-64 animate-pulse rounded-xl bg-secondary" />
          ) : (
            <ProfileForm mode="edit" me={me} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
