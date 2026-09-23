import type { Metadata } from "next";
import { Story } from "@/components/story/Story";

export const metadata: Metadata = {
  title: "A story",
  description: "A boy from a busy street in Bikaner, and the evening everything became clear.",
  robots: { index: false, follow: false },
};

export default function StoryPage() {
  return <Story />;
}
