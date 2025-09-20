import { TabBar } from "@components/design-system/nav/TabBar";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex-1">{children}</div>
      <TabBar />
    </div>
  );
}