"use client";

import { useEffect, useState } from "react";
import { Modal } from "@components/design-system/molecules/Modal";
import { Button } from "@components/design-system/atoms/Button";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { useSessionStore } from "@lib/store/session.store";
import { useRouter } from "next/navigation";

/**
 * Protected wrapper with a one-time Privacy Policy gate.
 * Uses the session store (encrypted) to persist acceptance.
 */
export function Protected({ children }: { children: React.ReactNode }) {
  // const router = useRouter();
  const privacyAccepted = useSessionStore((s) => s.privacyAcceptedV1);
  const setPrivacyAccepted = useSessionStore((s) => s.setPrivacyAccepted);
  const [privacyOpen, setPrivacyOpen] = useState(false);



  useEffect(() => {
    setPrivacyOpen(!privacyAccepted);
  }, [privacyAccepted]);

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
