"use client";

import { useRouter } from "next/navigation";
import { Screen } from "@components/design-system/layout/Screen";
import { Card } from "@components/design-system/molecules/Card";
import { ListItem } from "@components/design-system/molecules/ListItem";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { Protected } from "@components/guards/Protected";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <Protected>
      <Screen>
        <div className="mx-auto max-w-md space-y-4 p-4">
          <Card>
            <ProfileHeader />
          </Card>

          <div className="grid gap-3">
            <ListItem
              title="Personal Data"
              subtitle="Name, DOB, job, gender"
              icon="user"
              onClick={() => router.push("/profile/personal-data")}
            />
            <ListItem
              title="Settings"
              subtitle="Theme, notifications"
              icon="settings"
              onClick={() => router.push("/profile/settings")}
            />
          </div>
        </div>
      </Screen>
    </Protected>
  );
}