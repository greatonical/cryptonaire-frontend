"use client";

import { LeaderboardRow } from "@features/leaderboard/services/leaderboard.client";
import { Card } from "@components/design-system/molecules/Card";
import { Text } from "@components/design-system/atoms/Text";
import cn from "clsx";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function initialsFrom(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const letters = (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase();
}

export function LeaderboardList({
  rows,
  highlightAddress 
}: {
  rows: LeaderboardRow[];
  highlightAddress?: `0x${string}` | string;
}) {
  return (
    <div className="space-y-2">
      
      {rows.map((row) => {
        const isMe =
          highlightAddress &&
          row.walletAddress.toLowerCase() === String(highlightAddress).toLowerCase();

        const name = row.username || row.fid ? `f/${row.fid}` : shortAddress(row.walletAddress);
        return (
          <Card
            key={`${row.rank}-${row.userId}`}
            className={cn(
              "flex items-center gap-3 p-3",
              isMe && "ring-2 ring-brand"
            )}
          >
            <div className="w-8 text-center text-sm font-semibold text-ink-900">
              {row.rank}
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand font-semibold">
              {row.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.avatarUrl}
                  alt={name}
                  className="h-10 w-10 rounded-xl object-cover"
                />
              ) : (
                initialsFrom(row.username)
              )}
            </div>

            <div className="flex-1">
              <div className="text-[15px] font-medium text-ink-900 truncate">{name}</div>
              {row.country && (
                <Text size="sm" tone="muted">{row.country}</Text>
              )}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-[15px] font-semibold text-ink-900">{row.points}</div>
              <Text size="xs" tone="muted">pts</Text>
            </div>
          </Card>
        );
      })}
    </div>
  );
}