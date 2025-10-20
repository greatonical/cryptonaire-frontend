// app/onboarding/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@components/design-system/layout/Screen";
import { Card } from "@components/design-system/molecules/Card";
import { Button } from "@components/design-system/atoms/Button";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import Lottie from "lottie-react";
import Slide1 from "@assets/animations/coins.json";
import Slide2 from "@assets/animations/shield.json";
import Slide3 from "@assets/animations/trophy.json";
import { useSessionStore } from "@lib/store/session.store";

const slides = [
  { title: "Learn crypto, fast", text: "Quick questions. Bitesize explanations.", anim: Slide1 },
  { title: "Fair play", text: "Anti-fraud in place. Keep it clean.", anim: Slide2 },
  { title: "Climb the ranks", text: "Earn weekly points and badges.", anim: Slide3 },
];

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const setOnboardingSeen = useSessionStore((s) => s.setOnboardingSeen);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // useEffect(() => {
  //   // Preload tiny sfx (ensure you place /public/sfx/onboard.mp3)
  //   if (!audioRef.current) {
  //     const a = new Audio("/sfx/onboard.mp3");
  //     a.volume = 0.35;
  //     audioRef.current = a;
  //   }
  // }, []);

  const next = () => {
    audioRef.current?.play().catch(() => void 0);
    if (i < slides.length - 1) setI(i + 1);
    else {
      setOnboardingSeen(true);
      router.replace("/"); // go home
    }
  };

  return (
    <Screen>
      <div className="flex flex-col h-[90vh] overflow-clip justify-center mx-auto max-w-md space-y-4 p-4">
        <Card className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="h-48 w-48">
            <Lottie animationData={slides[i].anim} loop />
          </div>
          <Heading level={2}>{slides[i].title}</Heading>
          <Text tone="muted">{slides[i].text}</Text>
          <div className="mt-2 w-full">
            <Button onClick={next} block>
              {i < slides.length - 1 ? "Next" : "Get started"}
            </Button>
          </div>
        </Card>
        <div className="flex justify-center gap-1">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-8 rounded-full ${idx <= i ? "bg-brand-600" : "bg-line"}`}
            />
          ))}
        </div>
      </div>
    </Screen>
  );
}