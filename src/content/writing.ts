export type WritingItem = {
  id: string;
  title: string;
  status: "drafting";
};

export const writingIntro = "Three essays in progress. The titles are real; the words are coming.";

export const writing: WritingItem[] = [
  { id: "handoff", title: "The handoff was never the problem. The artifact was.", status: "drafting" },
  {
    id: "placing-complexity",
    title: "Placing complexity, not removing it: what a bank POC taught me about hierarchy",
    status: "drafting",
  },
  { id: "disagreement", title: "Why I test the disagreement instead of winning it", status: "drafting" },
];
