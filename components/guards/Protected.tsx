"use client";

import { useEffect, useState } from "react";
import { Modal } from "@components/design-system/molecules/Modal";
import { Button } from "@components/design-system/atoms/Button";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { useSessionStore } from "@lib/store/session.store";
import { usePathname, useRouter } from "next/navigation";

/**
 * Protected wrapper with auth gate + one-time Privacy Policy gate.
 * Waits for persisted store hydration before deciding.
 */
export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const jwt = useSessionStore((s) => s.jwt);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  const privacyAccepted = useSessionStore((s) => s.privacyAcceptedV1);
  const setPrivacyAccepted = useSessionStore((s) => s.setPrivacyAccepted);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Wait for hydration, then enforce auth
  useEffect(() => {
    if (!hasHydrated) return;
    if (!jwt) {
      const next = encodeURIComponent(pathname || "/home");
      router.replace(`/signin?next=${next}`);
    }
  }, [hasHydrated, jwt, pathname, router]);

  // Handle privacy after hydration
  useEffect(() => {
    if (!hasHydrated) return;
    setPrivacyOpen(!privacyAccepted);
  }, [privacyAccepted, hasHydrated]);

  // Avoid flicker before hydration and during redirect
  if (!hasHydrated) return null;
  if (!jwt) return null;

  return (
    <>
      {children}

      <Modal
        open={privacyOpen}
        onClose={() => {
          /* block closing without accept */
        }}
      >
        <div className="space-y-3">
          <Heading level={3}>Privacy Policy</Heading>
          <Text tone="muted" className="text-sm">
            By continuing you agree to our Privacy Policy and consent to the
            processing of your gameplay data for fair play, security and rewards
            eligibility.
          </Text>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                setPrivacyAccepted(true);
                setPrivacyOpen(false);
              }}
            >
              I Agree
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.location.assign("/")}
            >
              Cancel
            </Button>
          </div>
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-xs underline opacity-70"
          >
            Read full privacy policy
          </a>
        </div>
      </Modal>
    </>
  );
}

export default Protected;