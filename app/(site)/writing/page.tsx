import type { Metadata } from "next";

import { RedirectHome } from "@/components/site/RedirectHome";

export const metadata: Metadata = {
  title: "Writing",
  robots: { index: false },
};

/** Writing lives on the home page. */
export default function WritingPage() {
  return <RedirectHome hash="writing" />;
}
