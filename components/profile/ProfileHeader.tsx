"use client";

import { Text } from "@components/design-system/atoms/Text";
import { Heading } from "@components/design-system/atoms/Heading";
import { useSessionStore } from "@lib/store/session.store";
import { SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileHeader() {
  const address = useSessionStore((s) => s.address);

  const initials = "U"; // could derive from name later
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected";

  return (
    <div className="flex items-center justify-between gap-4 relative">
      <span className="flex items-center gap-4">
 <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand font-semibold">
        {initials}
      </div>
      <div>
        <Heading level={3}>Your Profile</Heading>
        <Text tone="muted" size="sm">{short}</Text>
      </div>
      </span>
     
{/* {useRouter().push("/", )} */}
<button className="text-brand" onClick={()=>{window.open("/profile/settings", "_self")}}>
   <SettingsIcon/>
</button>
   
    </div>
  );
}