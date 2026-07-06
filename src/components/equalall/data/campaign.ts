import type { TierId } from "../flow/types";

export type Tier = {
  id: TierId;
  amount: number;
  /** The meaning line shown under the tier grid when selected. */
  impact: string;
  mostChosen?: boolean;
  /** What the gift becomes on the confirm step and the keepsake card. */
  tangible: {
    title: string;
    detail: string;
    image: string;
  };
};

export type HeroImage = {
  src: string;
  alt: string;
};

export type DonorEntry = {
  name: string;
  place: string;
  amount: number;
  ago: string;
};

export const campaign = {
  brand: "EqualAll",
  title: "Meals and medicine for children",
  location: "Turkana County, Kenya",
  organizer: {
    name: "Hope Alliance International",
    verified: true,
    note: "Registered nonprofit",
  },
  raised: 48236,
  goal: 75000,
  donorCount: 1284,
  heroImages: [
    {
      src: "/images/equalall/hero-meals.webp",
      alt: "A young girl smiling as she holds a warm meal at a community kitchen",
    },
    {
      src: "/images/equalall/hero-care.webp",
      alt: "A relief worker feeding a young child",
    },
    {
      src: "/images/equalall/hero-classroom.webp",
      alt: "A teacher instructing children in a classroom",
    },
  ] satisfies HeroImage[],
  story: [
    "The worst drought in forty years has dried out the wells and fields families here depend on. Crops have failed four seasons in a row, and the walk to the nearest clinic can take a full day.",
    "Hope Alliance runs mobile clinics and community kitchens across Turkana County, reaching children who would otherwise go without a meal or a checkup. Your gift is delivered through teams already on the ground.",
    "Every donation is tracked and reported. You will see exactly what your gift became.",
  ],
  tiers: [
    {
      id: "t25",
      amount: 25,
      impact: "$25 covers health checkups for two children",
      tangible: {
        title: "Checkups for two children",
        detail: "A full screening and treatment plan at a mobile clinic.",
        image: "/images/equalall/hero-care.webp",
      },
    },
    {
      id: "t50",
      amount: 50,
      impact: "$50 delivers a month of medicine for a family",
      tangible: {
        title: "A month of family medicine",
        detail: "Essential medicines delivered to one family's door.",
        image: "/images/equalall/hero-care.webp",
      },
    },
    {
      id: "t100",
      amount: 100,
      impact: "$100 helps feed five children for a week",
      mostChosen: true,
      tangible: {
        title: "A week of meals for five children",
        detail: "Warm meals served at a community kitchen, every day.",
        image: "/images/equalall/hero-meals.webp",
      },
    },
    {
      id: "t250",
      amount: 250,
      impact: "$250 equips a field medical kit that helps save a life",
      tangible: {
        title: "A field medical kit",
        detail: "Supplies a clinic team carries into the hardest-to-reach villages.",
        image: "/images/equalall/kit.webp",
      },
    },
  ] satisfies Tier[],
  donorFeed: [
    { name: "Sarah", place: "London", amount: 50, ago: "2m" },
    { name: "Daniel", place: "Toronto", amount: 100, ago: "6m" },
    { name: "Mia", place: "Berlin", amount: 25, ago: "11m" },
    { name: "James", place: "Austin", amount: 250, ago: "18m" },
    { name: "Elena", place: "Madrid", amount: 100, ago: "24m" },
  ] satisfies DonorEntry[],
} as const;

export function getTier(tierId: TierId): Tier {
  const tier = campaign.tiers.find((t) => t.id === tierId);
  if (!tier) {
    throw new Error(`Unknown tier: ${tierId}`);
  }
  return tier;
}

export function formatAmount(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
