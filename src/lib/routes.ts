export const routes = {
  home: "/",
  work: "/work/",
  experiments: "/work/?tab=experiments",
  writing: "/writing/",
  notes: "/#notes",
  playground: "/playground/",
  caseStudy: (slug: string) => `/work/${slug}/`,
} as const;
