"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS } from "@config/routes";
import { useUIStore } from "@lib/store/ui.store";
import clsx from "clsx";
import { Home, PlayCircle, Trophy, User2 } from "lucide-react";

const items = [
  { key: "home", href: TABS.home, icon: Home, label: "Home" },
  { key: "game", href: TABS.game, icon: PlayCircle, label: "Game" },
  { key: "lead", href: TABS.leaderboard, icon: Trophy, label: "Leaders" },
  { key: "me", href: TABS.profile, icon: User2, label: "Profile" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const hide = useUIStore((s) => s.hideTabBar);
  if (hide) return null;

  return (
    <nav
      className="sticky bottom-0 z-40 border-t border-line bg-white/95 dark:bg-surface  backdrop-blur supports-[backdrop-filter]:bg-white/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 p-2">
        {items.map(({ key, href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={key} className="flex items-center justify-center">
              <Link
                href={href}
                className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                  active ? "text-brand bg-brand/10" : "text-ink-600 hover:bg-black/5"
                )}
                aria-label={label}
              >
                <Icon size={24} strokeWidth={2.25} aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}