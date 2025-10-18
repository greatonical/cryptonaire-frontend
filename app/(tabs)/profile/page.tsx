"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@components/design-system/layout/Screen";
import { Card } from "@components/design-system/molecules/Card";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Button } from "@components/design-system/atoms/Button";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import toast from "react-hot-toast";
import {
  fetchProfile,
  updateProfile,
} from "@features/profile/services/profile.client";
import { Protected } from "@components/guards/Protected";
import { useMyRewardsSummary } from "@features/rewards/hooks/use-rewards";
import Lottie from "lottie-react";
import BadgeAnim from "@assets/animations/badge.json";

function pickBadge(points: number) {
  if (points >= 1000) return { name: "Legend", color: "text-brand-600" };
  if (points >= 500) return { name: "Pro", color: "text-brand-600" };
  if (points >= 200) return { name: "Riser", color: "text-brand-600" };
  if (points >= 50) return { name: "Rookie", color: "text-brand-600" };
  return { name: "Newbie", color: "text-ink-600" };
}

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: summary } = useMyRewardsSummary();
  const weeklyPoints = summary?.points ?? 0; // resets every week server-side
  const badge = pickBadge(weeklyPoints);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = await fetchProfile();
        setUsername(p?.username ?? "");
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(username.trim());
      toast.success("Saved!");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected>
      <Screen>
        <div className="mx-auto max-w-md space-y-4 p-4">
          <Card>
            <ProfileHeader />
          </Card>

          {/* Live weekly points + badge */}
          <Card className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0">
              <Lottie animationData={BadgeAnim} loop={false} />
            </div>
            <div className="flex-1">
              <div className="text-xs text-ink-600">This week</div>
              <div className="text-[15px] font-semibold">
                {weeklyPoints} pts ·{" "}
                <span className={badge.color}>{badge.name}</span>
              </div>
              <Text size="xs" tone="muted">
                Badges upgrade as you hit milestones.
              </Text>
            </div>
          </Card>

          <Card className="space-y-3">
            <Heading level={2}>Profile</Heading>
            <div>
              <Text tone="muted" size="sm">
                Username
              </Text>
              <input
                className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick a unique handle"
                disabled={loading || saving}
              />
            </div>
            <div className="pt-2 flex flex-col gap-y-2">
              <Button onClick={save} disabled={loading || saving} block>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.open("/profile/rewards", "_self");
                }}
                block
              >
                {"Go to rewards"}
              </Button>
            </div>
          </Card>
        </div>
      </Screen>
    </Protected>
  );
}
