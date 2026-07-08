import type { Metadata } from "next";
import { PlaygroundField } from "@/components/playground/PlaygroundField";

const TITLE = "Playground | Vaibhav Arora";
const DESCRIPTION =
  "A living constellation of independent design experiments. Generative scenes, interaction studies and product concepts, built in code.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/playground/",
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PlaygroundPage() {
  return <PlaygroundField />;
}
