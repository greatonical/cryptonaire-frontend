"use client";

import { useState } from "react";
import { Button } from "@components/design-system/atoms/Button";
import { Card } from "@components/design-system/molecules/Card";
import { Text } from "@components/design-system/atoms/Text";
import { useProfile } from "@features/profile/hooks/use-profile";
import toast from "react-hot-toast";

export default function ProfileForm() {
  const { data: profile, isLoading, update, isUpdating } = useProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [dob, setDob] = useState(profile?.dob ?? "");
  const [job, setJob] = useState(profile?.job ?? "");
  const [income, setIncome] = useState(profile?.income ?? "");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">((profile?.gender as any) ?? "");

  // Sync local state when profile loads
  if (!isLoading && profile && name === "" && (profile.name ?? "") !== "") {
    setName(profile.name ?? ""); setDob(profile.dob ?? ""); setJob(profile.job ?? "");
    setIncome(profile.income ?? ""); setGender((profile.gender as any) ?? "");
  }

  async function onSave() {
   try {
     await update({ name, dob, job, income, gender: (gender || undefined) as any });
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
   
  }

  return (
    <Card className="space-y-3">
      <div className="grid gap-3">
        <label className="text-sm">
          <span className="text-ink-600">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-line p-3" />
        </label>

        <label className="text-sm">
          <span className="text-ink-600">Date of birth</span>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 w-full rounded-xl border border-line p-3" />
        </label>

        <label className="text-sm">
          <span className="text-ink-600">Job</span>
          <input value={job} onChange={(e) => setJob(e.target.value)} className="mt-1 w-full rounded-xl border border-line p-3" />
        </label>

        <label className="text-sm">
          <span className="text-ink-600">Income</span>
          <input value={income} onChange={(e) => setIncome(e.target.value)} className="mt-1 w-full rounded-xl border border-line p-3" />
        </label>

        <label className="text-sm">
          <span className="text-ink-600">Gender</span>
          <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="mt-1 w-full rounded-xl border border-line p-3">
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <Button onClick={onSave} disabled={isUpdating} block>
        {isUpdating ? "Saving…" : "Save changes"}
      </Button>

      {isLoading && <Text tone="muted" size="sm">Loading profile…</Text>}
    </Card>
  );
}