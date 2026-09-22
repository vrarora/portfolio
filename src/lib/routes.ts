export const routes = {
  home: "/",
  work: "/work/",
  experiments: "/work/?tab=experiments",
  writing: "/writing/",
  notes: "/#notes",
  playground: "/playground/",
  // Points at the legacy pages until step 6 ships /work/[slug]/.
  caseStudy: (slug: string) => `/case-studies/${slug}/`,
} as const;
