export const routes = {
  home: "/",
  work: "/#work",
  writing: "/#writing",
  playground: "/playground/",
  caseStudy: (slug: string) => `/work/${slug}/`,
} as const;
