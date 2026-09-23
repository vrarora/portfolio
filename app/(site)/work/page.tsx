import type { Metadata } from "next";

import { RedirectHome } from "@/components/site/RedirectHome";

export const metadata: Metadata = {
  title: "Work",
  robots: { index: false },
};

/** Work lives on the home page; case studies keep their own URLs under /work/[slug]/. */
export default function Page() {
  return <RedirectHome hash="work" />;
}
