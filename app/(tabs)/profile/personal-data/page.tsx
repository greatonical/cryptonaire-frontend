"use client";

import { Screen } from "@components/design-system/layout/Screen";
import { Heading } from "@components/design-system/atoms/Heading";
import ProfileForm from "@components/profile/ProfileForm";
import { Protected } from "@components/guards/Protected";

export default function PersonalDataPage() {
  return (
    <Protected>
      <Screen>
        <div className="mx-auto max-w-md space-y-4 p-4">
          <Heading level={1}>Personal data</Heading>
          <ProfileForm />
        </div>
      </Screen>
    </Protected>
  );
}