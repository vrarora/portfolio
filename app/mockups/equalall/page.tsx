"use client";

import { DonationExperience } from "@/components/equalall/DonationExperience";
import { PhoneFrame } from "@/components/equalall/chrome/PhoneFrame";
import { StageGlow } from "@/components/equalall/chrome/StageGlow";
import { DonationFlowProvider } from "@/components/equalall/flow/DonationFlowProvider";
import { fraunces } from "@/components/equalall/fonts";
import { useIsMobile } from "@/components/equalall/useIsMobile";

export default function EqualAllMockupPage() {
  const isMobile = useIsMobile();

  return (
    <main className={`ea-root ea-mockup-page ${fraunces.variable}`}>
      <DonationFlowProvider mode="interactive">
        {isMobile ? (
          <div className="ea-fullbleed">
            <DonationExperience />
          </div>
        ) : (
          <>
            <StageGlow />
            <PhoneFrame>
              <DonationExperience />
            </PhoneFrame>
          </>
        )}
      </DonationFlowProvider>
    </main>
  );
}
