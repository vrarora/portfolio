import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkPage } from "@/components/work/WorkPage";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies and experiments by Vaibhav Arora.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WorkPage />
    </Suspense>
  );
}
