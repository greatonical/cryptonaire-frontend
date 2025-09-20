"use client";

import { Screen } from "@components/design-system/layout/Screen";
import { Card } from "@components/design-system/molecules/Card";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Switch } from "@components/design-system/atoms/Switch";
import { Protected } from "@components/guards/Protected";
import { useState } from "react";

export default function SettingsPage() {
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <Protected>
      <Screen>
        <div className="mx-auto max-w-md space-y-4 p-4">
          <Card>
            <Heading level={2}>Settings</Heading>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-medium text-ink-900">Notifications</div>
              <Text tone="muted" size="sm">Game reminders and weekly results</Text>
            </div>
            <Switch checked={notif} onChange={setNotif} />
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-medium text-ink-900">Dark mode</div>
              <Text tone="muted" size="sm">Softer colors at night</Text>
            </div>
            <Switch checked={dark} onChange={setDark} />
          </Card>
        </div>
      </Screen>
    </Protected>
  );
}