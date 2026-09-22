import type { Metadata } from "next";

import { WritingList } from "@/components/home/WritingList";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays in progress by Vaibhav Arora.",
};

export default function WritingPage() {
  return (
    <section className="container writing-page">
      <WritingList heading="Writing" headingLevel="h1" />
    </section>
  );
}
