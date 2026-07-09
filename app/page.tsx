"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  House,
  Briefcase,
  User,
  ChatDots,
  Lightning,
  LinkedinLogo,
  GithubLogo,
  FileText,
  BookmarkSimple,
  XLogo,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Circle,
  Article,
  IdentificationCard,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  LockSimple,
  List,
  X,
  Sparkle,
} from "@phosphor-icons/react";
import { caseStudies } from "@/content/case-studies";
import { siteLinks } from "@/content/site-links";

const heroNavItems = [
  { label: "Overview", href: "#top", icon: House, active: true },
  { label: "Work", href: "#work", icon: Briefcase },
  { label: "Playground", href: "/playground/", icon: Sparkle },
  { label: "About", href: "#about", icon: User },
  { label: "Contact", href: "#contact", icon: ChatDots },
] as const;

const heroActionItems = [
  { label: "LinkedIn", href: siteLinks.linkedin, icon: LinkedinLogo },
  { label: "GitHub", href: siteLinks.github, icon: GithubLogo },
  { label: "Resume", href: siteLinks.resume, icon: FileText },
  { label: "Twitter", href: siteLinks.twitter, icon: XLogo },
] as const;

const heroRoleItems = [
  { title: "Product Designer", body: "turning technically dense enterprise products into flows people can actually use." },
  { title: "Enterprise specialist", body: "making compliance, data governance, and B2B complexity actually usable." },
  { title: "AI-native builder", body: "shipping production interfaces directly in code without a handoff gap." },
] as const;

const aboutTestimonials = [
  {
    quote: (
      <>
        Vaibhav has a rare ability to take on complex, ambiguous product problems and{" "}
        <span>bring clarity to them fast</span>. He thinks in systems, not just screens,
        and his execution is thorough without ever losing sight of what the user actually needs.
      </>
    ),
    name: "Nishant Kumar",
    role: "SPD, ServiceNow",
  },
  {
    quote: (
      <>
        Vaibhav <span>translated our compliance requirements into an experience users could actually navigate</span>{" "}
        without a guide. He pushed back on the right things, moved fast, and delivered
        something that made a real difference for the business.
      </>
    ),
    name: "Niranjan",
    role: "Senior Product Manager, IDfy",
  },
  {
    quote: (
      <>
        Working with Vaibhav showed me what it looks like when design is done with real intention.{" "}
        <span>He understands the full system he is designing for</span>, not just the screen in
        front of him, and that shows in the quality of what ships.
      </>
    ),
    name: "Srishti",
    role: "SPD2, IDfy",
  },
  {
    quote: (
      <>
        Vaibhav has a strong instinct for <span>where complexity can be simplified and where it has to be preserved</span>.
        He does not just make things look good. He makes them work better for the people using them.
      </>
    ),
    name: "Tanmay",
    role: "SPD1, IDfy",
  },
  {
    quote: (
      <>
        Vaibhav brings both craft and judgment to the work. He asks the right questions early,{" "}
        <span>keeps the user's mental model at the center</span>, and delivers outputs that hold
        up under real scrutiny from engineering and product.
      </>
    ),
    name: "Ganesh Das",
    role: "Lead Designer, Think9",
  },
  {
    quote: (
      <>
        What stands out about Vaibhav is <span>how he connects design decisions to outcomes</span>.
        He does not just solve the surface problem. He traces it back to what users are actually
        trying to do and builds from there.
      </>
    ),
    name: "Karan Thakur",
    role: "SPD, 2027 Health",
  },
] as const;

const aboutMediaItems = {
  speaking: [
    {
      meta: "Garage de Ideas | February 2024",
      title: "How Not to Be a Great Mentor",
      cta: "Watch talk",
    },
    {
      meta: "Research Labs Podcast | July 2023",
      title: "E59: UX Research, Conducting Interviews",
      cta: "Watch talk",
    },
  ],
  writing: [
    {
      meta: "Fundament | May 2024",
      title: "The Future of the Job Market in UX & PD",
      cta: "Read article",
    },
    {
      meta: "UX Collective | July 2019",
      title: "How to Manage 1-on-1’s for Growth",
      cta: "Read article",
    },
  ],
} as const;

const workPrincipleCards = [
  {
    kicker: "MENTAL MODEL FIRST",
    body: "Build around how users think, not how the system is structured.",
    badge: "MENTAL MODEL FIRST",
    tone: "orange",
  },
  {
    kicker: "TEST THE DISAGREEMENT",
    body: "Prototype the conflict. User evidence settles debates faster than conviction.",
    badge: "TEST THE DISAGREEMENT",
    tone: "lavender",
  },
  {
    kicker: "CONSTRAINTS SHARPEN",
    body: "I do my clearest thinking under pressure. I have never needed perfect conditions to do good work.",
    badge: "CONSTRAINTS SHARPEN",
    tone: "gold",
  },
  {
    kicker: "SHIP FROM THE IDE",
    body: "When I can make the interaction real in code, I do not write a spec asking someone else to imagine it.",
    badge: "SHIP FROM THE IDE",
    tone: "green",
  },
  {
    kicker: "BOTH SIDES COUNT",
    body: "A flow that solves the user problem but breaks the revenue model is not finished.",
    badge: "BOTH SIDES COUNT",
    tone: "lavender",
  },
  {
    kicker: "PUNCH ABOVE",
    body: "Most design asks are the visible symptom of something bigger. I try to solve that too.",
    badge: "PUNCH ABOVE",
    tone: "orange",
  },
] as const;

const heroServiceCards = [
  {
    id: "leader",
    title: "Enterprise B2B Design",
    metrics: ["Core strengths:"],
    points: [
      "Complex workflow simplification",
      "Compliance + data-heavy UX",
      "User mental model translation",
      "Cross-functional delivery",
      "Discovery to production",
    ],
    ctaLabel: "View work",
    ctaHref: "#work",
    tone: "accent",
  },
  {
    id: "mentor",
    title: "AI-Native Execution",
    metrics: ["How I work:"],
    points: [
      "Code-to-production prototyping",
      "Rapid iteration cycles",
      "Engineering-ready handoffs",
      "Vibe-coded interfaces",
    ],
    tone: "light",
  },
  {
    id: "manager",
    title: "Systems + Craft",
    metrics: ["What I bring:"],
    points: [
      "Component architecture",
      "Cross-surface consistency",
      "Figma + code workflow",
      "Constraint-led judgment",
      "Stakeholder communication",
    ],
    tone: "soft",
  },
] as const;

function SectionReveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`reveal ${className}`.trim()}
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function WorkPreview({
  variant,
  brand,
  thumbnailImage,
}: {
  variant: (typeof caseStudies)[number]["workPreview"];
  brand: string;
  thumbnailImage?: string;
}) {
  if (variant === "cover" && thumbnailImage) {
    return (
      <div className="work-preview work-preview-cover" aria-hidden="true">
        <div className="preview-frame preview-cover-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailImage} alt="" loading="lazy" className="preview-cover-img" />
        </div>
      </div>
    );
  }

  if (variant === "screenshot" && thumbnailImage) {
    return (
      <div className="work-preview work-preview-screenshot" aria-hidden="true">
        <div className="preview-frame preview-screenshot-frame">
          <div className="preview-browser-chrome">
            <div className="preview-browser-bar">
              <div className="preview-browser-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-browser-urlbar" />
            </div>
            <div className="preview-browser-viewport">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnailImage} alt={`${brand} interface`} className="preview-screenshot-img" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={`work-preview work-preview-${variant}`} aria-hidden="true">
        <div className="preview-frame preview-dashboard-shell">
          <div className="preview-window-bar">
            <div className="preview-window-brand">
              <span className="preview-window-mark" />
              <span>{brand} Studio</span>
            </div>
            <div className="preview-window-actions">
              <span />
              <span />
            </div>
          </div>

          <div className="preview-dashboard-body">
            <div className="preview-dashboard-sidebar">
              <span className="preview-dashboard-button" />
              <span className="preview-dashboard-line preview-dashboard-line-short" />
              <span className="preview-dashboard-line" />
              <span className="preview-dashboard-line" />
              <span className="preview-dashboard-line preview-dashboard-line-short" />
            </div>

            <div className="preview-dashboard-main">
              <div className="preview-dashboard-heading">
                <span className="preview-dashboard-title" />
                <span className="preview-dashboard-filter" />
              </div>

              <div className="preview-dashboard-stats">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="preview-dashboard-stat">
                    <span className="preview-dashboard-stat-label" />
                    <span className="preview-dashboard-stat-value" />
                  </div>
                ))}
              </div>

              <div className="preview-dashboard-cards">
                {[0, 1, 2].map((index) => (
                  <div key={index} className={`preview-dashboard-card preview-dashboard-card-${index + 1}`}>
                    <span className="preview-dashboard-card-badge" />
                    <span className="preview-dashboard-card-line" />
                    <span className="preview-dashboard-card-line preview-dashboard-card-line-small" />
                  </div>
                ))}
              </div>

              <div className="preview-dashboard-footer">
                {[0, 1, 2].map((index) => (
                  <span key={index} className="preview-dashboard-footer-chip" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "workflow") {
    return (
      <div className={`work-preview work-preview-${variant}`} aria-hidden="true">
        <div className="preview-frame preview-workflow-board">
          <div className="preview-workflow-weeks">
            {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => (
              <span key={week}>{week}</span>
            ))}
          </div>

          <div className="preview-workflow-lanes">
            <div className="preview-workflow-lane preview-workflow-lane-discovery">
              <p>Discovery</p>
              <div className="preview-workflow-track">
                <span className="preview-workflow-block preview-workflow-block-wide" />
                <span className="preview-workflow-block preview-workflow-block-tight" />
              </div>
              <div className="preview-workflow-chip-row">
                {["Strategy", "Product", "Data", "Design", "Research"].map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </div>

            <div className="preview-workflow-lane preview-workflow-lane-delivery">
              <p>Delivery</p>
              <div className="preview-workflow-track">
                <span className="preview-workflow-block preview-workflow-block-wide" />
                <span className="preview-workflow-block preview-workflow-block-tight" />
              </div>
              <div className="preview-workflow-chip-row">
                {["Design", "Engineering", "Product"].map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="preview-workflow-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "placeholder") {
    return (
      <div className="work-preview work-preview-placeholder" aria-hidden="true">
        <div className="preview-frame preview-screenshot-frame">
          <div className="pph-coming-soon" aria-label="Coming soon">
            <LockSimple size={32} weight="bold" className="pph-lock-icon" />
            <span>Coming Soon</span>
          </div>
          <div className="preview-browser-chrome">
            <div className="preview-browser-bar">
              <div className="preview-browser-dots">
                <span /><span /><span />
              </div>
              <div className="preview-browser-urlbar" />
            </div>
            <div className="preview-browser-viewport pph-viewport">
              <div className="pph-nav">
                <div className="pph-nav-left">
                  <span className="pph-logo" />
                  <span className="pph-nav-item" />
                  <span className="pph-nav-item pph-nav-item-active" />
                  <span className="pph-nav-item" />
                </div>
                <div className="pph-nav-right">
                  <span className="pph-btn" />
                  <span className="pph-avatar" />
                </div>
              </div>
              <div className="pph-body">
                <div className="pph-sidebar">
                  <span className="pph-sidebar-item pph-sidebar-item-active" />
                  <span className="pph-sidebar-item" />
                  <span className="pph-sidebar-item" />
                  <span className="pph-sidebar-item pph-sidebar-item-short" />
                  <span className="pph-sidebar-item" />
                </div>
                <div className="pph-main">
                  <div className="pph-stats">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="pph-stat-card">
                        <span className="pph-stat-label" />
                        <span className="pph-stat-value" />
                        <span className="pph-stat-delta" />
                      </div>
                    ))}
                  </div>
                  <div className="pph-table">
                    <div className="pph-table-header">
                      {[60, 40, 50, 45, 30].map((w, i) => (
                        <span key={i} className="pph-th" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    {[0, 1, 2, 3, 4].map((row) => (
                      <div key={row} className={`pph-table-row${row === 1 ? " pph-table-row-active" : ""}`}>
                        {[80, 55, 65, 50, 35].map((w, col) => (
                          <span key={col} className={`pph-td${col === 4 ? " pph-td-badge" : ""}`} style={{ width: `${w}%` }} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`work-preview work-preview-${variant}`} aria-hidden="true">
      <div className="preview-frame preview-commerce-stage">
        {["Styles", `${brand} Daily`, `${brand} Select`].map((screen, index) => (
          <div key={screen} className={`preview-phone preview-phone-${index + 1}`}>
            <div className="preview-phone-header">
              <span className="preview-phone-header-line" />
              <span className="preview-phone-header-line preview-phone-header-line-short" />
            </div>

            <div className="preview-phone-body">
              <div className="preview-phone-hero" />
              <div className="preview-phone-grid">
                {[0, 1, 2].map((item) => (
                  <span key={item} className="preview-phone-tile" />
                ))}
              </div>
            </div>

            <div className="preview-phone-footer">
              <span>{screen}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

function getServiceCardStyle(
  cardId: (typeof heroServiceCards)[number]["id"],
  progress: number,
): CSSProperties {
  const p = clamp(progress);

  // Staged desktop timeline:
  // 1) Leader moves first.
  // 2) Manager starts when leader is about half out.
  // 3) Mentor stays parked until approaching work, then exits.
  const leaderPhase = clamp((p - 0.22) / 0.24);
  const managerPhase = clamp((p - 0.40) / 0.24);
  const mentorPhase = clamp((p - 0.68) / 0.28);

  const cardMotion = {
    leader: {
      x: 0,
      y: lerp(0, -560, easeOutCubic(leaderPhase)),
      zIndex: 3,
    },
    manager: {
      x: 520,
      y: lerp(184, -360, easeOutCubic(managerPhase)),
      zIndex: 2,
    },
    mentor: {
      x: 244,
      y: lerp(318, -330, easeOutCubic(mentorPhase)),
      zIndex: 1,
    },
  } satisfies Record<
    (typeof heroServiceCards)[number]["id"],
    {
      x: number;
      y: number;
      zIndex: number;
    }
  >;

  const motion = cardMotion[cardId];

  return {
    "--card-x": `${motion.x}px`,
    "--card-y": `${motion.y}px`,
    "--card-rotate": `0deg`,
    zIndex: motion.zIndex,
  } as CSSProperties;
}


function WeatherIcon({ code }: { code: number }) {
  const size = 14;
  const weight = "fill" as const;
  if (code === 0) return <Sun size={size} weight={weight} />;
  if (code <= 3) return <Cloud size={size} weight={weight} />;
  if (code <= 48) return <CloudFog size={size} weight={weight} />;
  if (code <= 67) return <CloudRain size={size} weight={weight} />;
  if (code <= 86) return <CloudSnow size={size} weight={weight} />;
  return <CloudLightning size={size} weight={weight} />;
}

export default function HomePage() {
  type HeroHref = (typeof heroNavItems)[number]["href"];

  const [activeHref, setActiveHref] = useState<HeroHref>(
    heroNavItems[0]?.href ?? "#top",
  );
  const buttonRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navigatingRef = useRef(false);
  const navigatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndex = Math.max(
    0,
    heroNavItems.findIndex((item) => item.href === activeHref),
  );
  const [indicatorStyle, setIndicatorStyle] = useState<{
    transform: string;
    width: string;
    opacity: number;
    backgroundColor?: string;
  }>({
    transform: "translateX(0px)",
    width: "0px",
    opacity: 0,
    backgroundColor: "#fd431d",
  });
  const [roleIndex, setRoleIndex] = useState(0);
  const servicesSectionRef = useRef<HTMLElement | null>(null);
  const servicesCanvasRef = useRef<HTMLDivElement | null>(null);
  const servicesStartTopRef = useRef<number | null>(null);
  const [servicesProgress, setServicesProgress] = useState(0);
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const [aboutProgress, setAboutProgress] = useState(0);
  const principlesSectionRef = useRef<HTMLElement | null>(null);
  const [principlesProgress, setPrinciplesProgress] = useState(0);
  const testimonialsSectionRef = useRef<HTMLElement | null>(null);
  const [testimonialsProgress, setTestimonialsProgress] = useState(0);
  const activeRole = heroRoleItems[roleIndex] ?? heroRoleItems[0];

  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const lastScrollYRef = useRef(0);

  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [dateStr, setDateStr] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  // Mobile menu: lock body scroll while open and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));

    (async () => {
      try {
        const geo = await fetch("https://ipapi.co/json/").then((r) => r.json());
        const { latitude, longitude } = geo;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
        );
        const data = await res.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
        });
      } catch {
        // silently fail — widget just shows date
      }
    })();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      // Threshold to avoid jitter (10px)
      if (Math.abs(scrollDelta) < 10) return;

      if (scrollDelta > 0 && currentScrollY > 100) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const nextHref =
        heroNavItems.find(({ href }) => href === window.location.hash)?.href ??
        heroNavItems[0].href;

      setActiveHref(nextHref);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateTestimonialsProgress = () => {
      frameId = 0;

      const section = testimonialsSectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const travelDistance = Math.max(rect.height + viewportHeight * 0.3, 1);
      const startTrigger = viewportHeight * 0.8;
      const rawProgress = (startTrigger - rect.top) / travelDistance;
      const nextProgress = Math.max(0, Math.min(1, rawProgress));

      setTestimonialsProgress((currentProgress) =>
        Math.abs(currentProgress - nextProgress) < 0.01 ? currentProgress : nextProgress,
      );
    };

    const requestProgressSync = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateTestimonialsProgress);
    };

    updateTestimonialsProgress();
    window.addEventListener("scroll", requestProgressSync, { passive: true });
    window.addEventListener("resize", requestProgressSync);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestProgressSync);
      window.removeEventListener("resize", requestProgressSync);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateAboutProgress = () => {
      frameId = 0;

      const section = aboutSectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const travelDistance = Math.max(rect.height - viewportHeight * 0.45, 1);
      const startTrigger = viewportHeight * 0.2;
      const rawProgress = (startTrigger - rect.top) / travelDistance;
      const nextProgress = Math.max(0, Math.min(1, rawProgress));

      setAboutProgress((currentProgress) =>
        Math.abs(currentProgress - nextProgress) < 0.01 ? currentProgress : nextProgress,
      );
    };

    const requestProgressSync = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateAboutProgress);
    };

    updateAboutProgress();
    window.addEventListener("scroll", requestProgressSync, { passive: true });
    window.addEventListener("resize", requestProgressSync);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestProgressSync);
      window.removeEventListener("resize", requestProgressSync);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updatePrinciplesProgress = () => {
      frameId = 0;
      const section = principlesSectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const startTrigger = viewportHeight * 0.9;
      const travelDistance = viewportHeight * 0.9;
      const raw = (startTrigger - rect.top) / travelDistance;
      const clamped = Math.max(0, Math.min(1, raw));
      const eased = 1 - Math.pow(1 - clamped, 2);
      setPrinciplesProgress((current) =>
        Math.abs(current - eased) < 0.005 ? current : eased,
      );
    };

    const requestProgressSync = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(updatePrinciplesProgress);
    };

    updatePrinciplesProgress();
    window.addEventListener("scroll", requestProgressSync, { passive: true });
    window.addEventListener("resize", requestProgressSync);

    return () => {
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestProgressSync);
      window.removeEventListener("resize", requestProgressSync);
    };
  }, []);

  useEffect(() => {
    const sectionIds = heroNavItems
      .filter(({ href }) => href.startsWith("#"))
      .map(({ href }) => href.slice(1))
      .filter(Boolean);

    const syncFromScroll = () => {
      if (navigatingRef.current) return;

      // Contact section is position:sticky at bottom — detect it via scroll depth instead
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= pageHeight - 80) {
        setActiveHref("#contact" as HeroHref);
        return;
      }

      // For all other sections, exclude #contact from getBoundingClientRect detection
      const scrollableSectionIds = sectionIds.filter((id) => id !== "contact");
      const sections = scrollableSectionIds
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);

      if (sections.length === 0) {
        return;
      }

      if (window.scrollY < 24) {
        setActiveHref(heroNavItems[0].href);
        return;
      }

      const threshold = window.innerHeight * 0.35;
      let activeSection = sections[0];

      for (let index = sections.length - 1; index >= 0; index -= 1) {
        const section = sections[index];

        if (section.getBoundingClientRect().top <= threshold) {
          activeSection = section;
          break;
        }
      }

      setActiveHref(`#${activeSection.id}` as HeroHref);
    };

    syncFromScroll();
    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);

    return () => {
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
    };
  }, []);

  useEffect(() => {
    // Rotate the hero role line; phones get a calmer pace so the line can
    // be read before it swaps.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const intervalId = window.setInterval(() => {
      setRoleIndex((currentIndex) => (currentIndex + 1) % heroRoleItems.length);
    }, isMobile ? 5200 : 2600);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateServicesProgress = () => {
      frameId = 0;

      const section = servicesSectionRef.current;
      const canvas = servicesCanvasRef.current;

      if (!section || !canvas) {
        return;
      }

      const canvasRect = canvas.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleHeight =
        Math.min(canvasRect.bottom, viewportHeight) - Math.max(canvasRect.top, 0);
      const visibleRatio = clamp(visibleHeight / Math.max(canvasRect.height, 1));

      if (visibleRatio < 0.5 && servicesStartTopRef.current === null) {
        setServicesProgress((currentProgress) =>
          currentProgress === 0 ? currentProgress : 0,
        );
        return;
      }

      const rect = section.getBoundingClientRect();
      if (servicesStartTopRef.current === null) {
        servicesStartTopRef.current = rect.top;
      }
      const travelDistance = Math.max(rect.height - viewportHeight * 0.35, 1);
      const rawProgress = (servicesStartTopRef.current - rect.top) / travelDistance;
      const nextProgress = Math.max(0, Math.min(1, rawProgress));

      setServicesProgress((currentProgress) =>
        Math.abs(currentProgress - nextProgress) < 0.01 ? currentProgress : nextProgress,
      );
    };

    const requestProgressSync = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateServicesProgress);
    };

    updateServicesProgress();
    window.addEventListener("scroll", requestProgressSync, { passive: true });
    window.addEventListener("resize", requestProgressSync);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestProgressSync);
      window.removeEventListener("resize", requestProgressSync);
    };
  }, []);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const button = buttonRefs.current[activeIndex];

      if (!button) {
        return;
      }

      const indicatorWidth = 32;
      const currentHref = heroNavItems[activeIndex].href;

      const sectionColors: Record<string, string> = {
        "#top": "#fd431d",
        "#work": "#a6a1fb",
        "#about": "#ffb800",
        "#contact": "#02ab4e",
      };

      setIndicatorStyle({
        transform: `translateX(${button.offsetLeft + (button.offsetWidth - indicatorWidth) / 2}px)`,
        width: `${indicatorWidth}px`,
        opacity: 1,
        backgroundColor: sectionColors[currentHref] || "#fd431d",
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeIndex]);

  return (
    <main className="portfolio-page">
      <div className="portfolio-scroll-content">
      <header className={`hero-header${isScrolledDown ? " is-scrolled" : ""}`}>
        <a className="wordmark hero-wordmark" href="#top" aria-label="Vaibhav Arora home">
          {dateStr && (
            <span className="hero-status-bar">
              <span className="hero-status-date">{dateStr}</span>
              {weather && (
                <>
                  <span className="hero-status-sep" aria-hidden="true" />
                  <WeatherIcon code={weather.code} />
                  <span className="hero-status-temp">{weather.temp}°C</span>
                </>
              )}
            </span>
          )}
        </a>

        <nav className="hero-dock" aria-label="Primary">
          <div className="hero-dock-shell">
            {heroNavItems.map(({ label, href, icon: Icon }, index) => {
              // Route items (e.g. /playground/) navigate away from the homepage:
              // plain Link, no scrollspy state, never is-active here.
              if (!href.startsWith("#")) {
                return (
                  <Link
                    key={label}
                    className="nav-button hero-button"
                    href={href}
                    ref={(node) => {
                      buttonRefs.current[index] = node;
                    }}
                    aria-label={label}
                    title={label}
                  >
                    <Icon size={20} weight="bold" />
                  </Link>
                );
              }

              const isActive = href === activeHref;

              return (
                <a
                  key={label}
                  className={`nav-button hero-button${isActive ? " is-active" : ""}`}
                  href={href}
                  ref={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                  onClick={(e) => {
                    setActiveHref(href);
                    navigatingRef.current = true;
                    if (navigatingTimerRef.current) clearTimeout(navigatingTimerRef.current);
                    navigatingTimerRef.current = setTimeout(() => {
                      navigatingRef.current = false;
                    }, 1500);
                    // Contact section is sticky at bottom — anchor scroll won't reach it,
                    // so scroll to page bottom explicitly instead
                    if (href === "#contact") {
                      e.preventDefault();
                      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
                    }
                  }}
                  aria-label={label}
                  title={label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} weight={isActive ? "fill" : "bold"} />
                </a>
              );
            })}
            <span
              className="hero-dock-indicator"
              aria-hidden="true"
              style={indicatorStyle}
            />
          </div>
        </nav>

        <div className="hero-actions" aria-label="Social and resume links">
          {heroActionItems.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              className="top-action hero-action"
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <button
          type="button"
          className="hero-menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
        </button>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="hero-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav className="hero-mobile-menu-nav" aria-label="Primary">
            {heroNavItems.map(({ label, href }) => {
              // Route items: real navigation via Link; close the menu and
              // restore body scroll before the route change unmounts the lock.
              if (!href.startsWith("#")) {
                return (
                  <Link
                    key={label}
                    className="hero-mobile-menu-link"
                    href={href}
                    onClick={() => {
                      setMenuOpen(false);
                      document.body.style.overflow = "";
                    }}
                  >
                    {label}
                  </Link>
                );
              }

              const isActive = href === activeHref;
              return (
                <a
                  key={label}
                  className={`hero-mobile-menu-link${isActive ? " is-active" : ""}`}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveHref(href);
                    setMenuOpen(false);
                    // Restore scroll immediately so the target scroll isn't
                    // blocked by the body scroll-lock from the open menu.
                    document.body.style.overflow = "";
                    if (href === "#contact") {
                      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
                    } else if (href === "#top") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {label}
                </a>
              );
            })}
          </nav>

          <div className="hero-mobile-menu-actions" aria-label="Social and resume links">
            {heroActionItems.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                className="hero-mobile-menu-action"
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={22} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <section className="hero hero-home" id="top" aria-label="Hero">
        <SectionReveal className="hero-copy">
          <div className="hero-intro-row">
            <span className="status-line-label">Vaibhav is</span>
            <span className="status-avatar-wrap" aria-hidden="true">
              <span className="status-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/me.webp" alt="" className="status-avatar-photo" />
              </span>
              {/* Halo sits outside the avatar's overflow:hidden clip so the
                  dot and its pulse ring are not cropped at the corner. */}
              <span className="status-avatar-halo" />
            </span>
            <div className="status-line-copy">
              <span className="status-pill status-pill-accent">IN THE MARKET</span>
              <p className="status-role-line" key={activeRole.title}>
                <strong>{activeRole.title}</strong>
                <span> - {activeRole.body}</span>
              </p>
            </div>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-line hero-title-line-first">SYSTEMS-MINDED</span>
            <span className="hero-title-line hero-title-line-middle">PRODUCT</span>
            <span className="hero-title-line hero-title-line-last">DESIGNER.</span>
          </h1>
          <div className="cta-row hero-cta-row">
            <a className="button button-primary" href="#work">
              View work
            </a>
            <a className="button" href={siteLinks.connect} target="_blank" rel="noreferrer">
              <LinkedinLogo size={18} />
              Let&apos;s connect
            </a>
          </div>
        </SectionReveal>

        <div className="hero-footer">
          <div className="hero-marquee">
            <p className="hero-marquee-label">SHIPPED AT</p>
            <div className="hero-marquee-outer">
              <div className="hero-marquee-track" aria-hidden="true">
                {([
                  { src: "/images/logos/idfy.png",     alt: "IDfy" },
                  { src: "/images/logos/ketto.png",    alt: "Ketto" },
                  { src: "/images/logos/wysa.webp",    alt: "Wysa" },
                  { src: "/images/logos/disecto.svg",  alt: "Disecto" },
                  { src: "/images/logos/onething.svg", alt: "OneThing Design" },
                  { src: "/images/logos/idfy.png",     alt: "IDfy" },
                  { src: "/images/logos/ketto.png",    alt: "Ketto" },
                  { src: "/images/logos/wysa.webp",    alt: "Wysa" },
                  { src: "/images/logos/disecto.svg",  alt: "Disecto" },
                  { src: "/images/logos/onething.svg", alt: "OneThing Design" },
                ] as { src: string; alt: string }[]).map((logo, i) => (
                  <div key={i} className="hero-marquee-item">
                    <img src={logo.src} alt={logo.alt} className="hero-marquee-logo" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <a className="scroll-chip" href="#services" aria-label="Scroll to services">
            <ArrowDown size={16} />
          </a>
        </div>
      </section>

      <section
        ref={servicesSectionRef}
        id="services"
        className="hero-services"
        aria-label="Service highlights"
        style={
          {
            "--services-progress": servicesProgress.toFixed(3),
          } as CSSProperties
        }
      >
        <SectionReveal className="hero-services-rail">
          <p className="section-label">Services</p>
          <p className="hero-services-status">
            Open to senior product designer roles
          </p>
          <a className="button hero-services-button" href="#work">
            <Lightning size={18} />
            See work
          </a>
        </SectionReveal>

        <div className="hero-services-main">
          <SectionReveal className="hero-services-intro">
            <h2 className="hero-services-title">What I bring</h2>
            <p className="hero-services-lede">
              I specialise in technically dense B2B products, working end-to-end
              from research to shipped interfaces.
            </p>
            <p className="hero-services-copy">
              I work best when the domain is complex:{" "}
              <span>compliance workflows, data governance, fintech decision tools.</span>{" "}
              If the problem is hard to frame, I am in my element.
            </p>
            <p className="hero-services-copy">
              My process is AI-native. I prototype and iterate{" "}
              <span>directly in code,</span> which means tighter handoffs and{" "}
              faster cycles without a separate handoff step.
            </p>
          </SectionReveal>

          <div className="hero-services-canvas" ref={servicesCanvasRef}>
            {heroServiceCards.map((card) => (
              <article
                key={card.title}
                className={`hero-service-card hero-service-card-${card.tone}`}
                style={getServiceCardStyle(card.id, servicesProgress)}
              >
                <div className="hero-service-card-head">
                  <h3>{card.title}</h3>
                </div>

                <div className="hero-service-card-metrics">
                  {card.metrics.map((metric) => (
                    <span key={metric}>{metric}</span>
                  ))}
                </div>

                <div className="hero-service-divider" />

                <ul className="hero-service-list">
                  {card.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>

                {"ctaLabel" in card && card.ctaLabel && "ctaHref" in card && card.ctaHref && (
                  <a
                    className="hero-service-link"
                    href={card.ctaHref}
                    target={card.ctaHref.startsWith("http") ? "_blank" : undefined}
                    rel={card.ctaHref.startsWith("http") ? "noreferrer" : undefined}
                    onClick={
                      !card.ctaHref.startsWith("http")
                        ? (e) => {
                            e.preventDefault();
                            const id = card.ctaHref.replace("#", "");
                            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                          }
                        : undefined
                    }
                  >
                    {card.ctaLabel}
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="work-section" id="work" aria-label="Selected work">
        <div className="work-layout">
          <div className="work-list">
            {caseStudies.map((study, index) => (
              <SectionReveal key={study.slug} delay={index * 90}>
                <article className={`work-card work-card-${study.workAccent}`}>
                  {study.workPreview === "placeholder" ? (
                    <div className="work-card-link work-card-link-disabled">
                      <WorkPreview variant={study.workPreview} brand={study.homeBrand} thumbnailImage={study.thumbnailImage} />

                      <div className="work-card-body">
                        <div className="work-card-copy">
                          <p className={`work-brand work-brand-${study.workAccent}`}>{study.homeBrand}</p>
                          <div className="work-card-text">
                            <div className="work-tag-row" aria-label={`${study.homeBrand} tags`}>
                              {study.homeTags.map((tag) => (
                                <span key={tag} className="work-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h2 className="work-headline">{study.homeHeadline}</h2>
                            <p className="work-description">{study.homeDescription}</p>
                          </div>
                        </div>

                        <div className="work-card-footer">
                          <span className="button button-primary work-card-open">
                            Open case study
                            <ArrowRight
                              className="work-card-open-icon"
                              size={16}
                              weight="regular"
                              color="#ffffff"
                              style={{ color: "#ffffff", stroke: "#ffffff" }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link className="work-card-link" href={`/case-studies/${study.slug}`}>
                      <WorkPreview variant={study.workPreview} brand={study.homeBrand} thumbnailImage={study.thumbnailImage} />

                      <div className="work-card-body">
                        <div className="work-card-copy">
                          <p className={`work-brand work-brand-${study.workAccent}`}>{study.homeBrand}</p>
                          <div className="work-card-text">
                            <div className="work-tag-row" aria-label={`${study.homeBrand} tags`}>
                              {study.homeTags.map((tag) => (
                                <span key={tag} className="work-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h2 className="work-headline">{study.homeHeadline}</h2>
                            <p className="work-description">{study.homeDescription}</p>
                          </div>
                        </div>

                        <div className="work-card-footer">
                          <span className="button button-primary work-card-open">
                            Open case study
                            <ArrowRight
                              className="work-card-open-icon"
                              size={16}
                              weight="regular"
                              color="#ffffff"
                              style={{ color: "#ffffff", stroke: "#ffffff" }}
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}
                </article>
              </SectionReveal>
            ))}
          </div>

          <aside className="work-rail">
            <SectionReveal className="work-rail-inner">
              <p className="work-rail-kicker">Work</p>
              <p className="work-rail-note">A sneak preview of selected projects between ‘23—’26</p>
            </SectionReveal>
          </aside>
        </div>
      </section>

      <section
        ref={principlesSectionRef}
        className="work-principles"
        aria-label="Principles"
        style={{ "--principles-progress": principlesProgress.toFixed(3) } as CSSProperties}
      >
        <p className="work-principles-title">Principles</p>
        <div className="work-principles-grid">
          {workPrincipleCards.map((card, index) => (
            <article
              key={card.kicker}
              className="work-principle-card"
              style={{ "--row": String(Math.floor(index / 2)) } as CSSProperties}
            >
              <div className="work-principle-copy">
                <p className="work-principle-kicker">{card.kicker}</p>
                <p className="work-principle-text">{card.body}</p>
              </div>
              <span className={`work-principle-ticket work-principle-ticket-${card.tone}`}>
                {card.badge}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section
        ref={aboutSectionRef}
        className="section about-section"
        id="about"
        style={
          {
            "--about-progress": aboutProgress.toFixed(3),
          } as CSSProperties
        }
      >
        <aside className="about-sticky">
          <SectionReveal className="about-sticky-inner">
            <p className="about-kicker">About</p>
            <p className="about-sticky-copy">
              Hey, I&apos;m Vaibhav. A systems-minded product designer based in India.
            </p>
            <a className="button about-connect" href={siteLinks.connect} target="_blank" rel="noreferrer">
              <LinkedinLogo size={18} />
              Let&apos;s connect
            </a>
          </SectionReveal>
        </aside>

        <div className="about-main">
          <SectionReveal className="about-copy">
            <h2 className="about-title">CLARITY FROM COMPLEXITY.</h2>
            <p className="about-text">
              I specialise in enterprise B2B products where the problems are
              technically dense, cross-functional, and hard to operationalize.
              My job is translating that complexity into something users can actually act on.
            </p>
            <p className="about-text">
              I have shipped products at IDfy, Ketto, and Wysa across data governance,
              fundraising, and mental health, with outcomes including a ₹10Cr+ ARR
              POC win and 30 to 40% revenue lifts.
            </p>
            <p className="about-text">
              Right now I am exploring senior product designer roles at product-led
              companies where design has real influence on direction.
            </p>
            <a className="button about-resume" href={siteLinks.resume} target="_blank" rel="noreferrer">
              <FileText size={18} />
              View resume
            </a>
          </SectionReveal>

          <SectionReveal className="about-media">
            <div className="about-photo-box">
              <img
                src="/images/about_me.png"
                alt="Vaibhav Arora"
                className="about-photo"
              />

              <article className="about-floating-card about-floating-card-top">
                <p className="about-floating-value">₹30CR+</p>
                <p className="about-floating-label">Revenue impact</p>
              </article>

              <article className="about-floating-card about-floating-card-right">
                <p className="about-floating-value">6+</p>
                <p className="about-floating-label">Products shipped</p>
              </article>

              <article className="about-floating-card about-floating-card-bottom">
                <p className="about-floating-value">3.5+</p>
                <p className="about-floating-label">Years experience</p>
              </article>
            </div>
          </SectionReveal>

          <SectionReveal className="about-links" style={{ display: "none" }}>
            <div className="about-links-columns">
              <div className="about-links-column">
                <p className="about-links-heading">Speaking</p>
                {aboutMediaItems.speaking.map((item) => (
                  <article key={item.title} className="about-link-card">
                    <div className="about-link-thumb" />
                    <p className="about-link-meta">{item.meta}</p>
                    <p className="about-link-title">{item.title}</p>
                    <a className="button about-link-cta" href={siteLinks.bookIntro} target="_blank" rel="noreferrer">
                      <ArrowUpRight size={16} />
                      {item.cta}
                    </a>
                  </article>
                ))}
              </div>

              <div className="about-links-column">
                <p className="about-links-heading">Writing</p>
                {aboutMediaItems.writing.map((item) => (
                  <article key={item.title} className="about-link-card">
                    <div className="about-link-thumb" />
                    <p className="about-link-meta">{item.meta}</p>
                    <p className="about-link-title">{item.title}</p>
                    <a className="button about-link-cta" href={siteLinks.bookIntro} target="_blank" rel="noreferrer">
                      <ArrowUpRight size={16} />
                      {item.cta}
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section
        ref={testimonialsSectionRef}
        className="about-testimonials"
        aria-label="Testimonials"
        style={
          {
            "--testimonials-progress": testimonialsProgress.toFixed(3),
          } as CSSProperties
        }
      >
        <SectionReveal className="about-testimonials-inner">
          <p className="about-testimonials-title">Testimonials</p>
          <div className="about-testimonials-rows">
            <div className="about-testimonials-row about-testimonials-row-top">
              {aboutTestimonials.slice(0, 3).map((item) => (
                <article key={item.name} className="about-testimonial-card">
                  <p className="about-testimonial-quote">{item.quote}</p>
                  <div className="about-testimonial-footer">
                    <div className="about-testimonial-attribution">
                      <p className="about-testimonial-name">{item.name}</p>
                      <p className="about-testimonial-role">{item.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="about-testimonials-row about-testimonials-row-bottom">
              {aboutTestimonials.slice(3).map((item) => (
                <article key={item.name} className="about-testimonial-card">
                  <p className="about-testimonial-quote">{item.quote}</p>
                  <div className="about-testimonial-footer">
                    <div className="about-testimonial-attribution">
                      <p className="about-testimonial-name">{item.name}</p>
                      <p className="about-testimonial-role">{item.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>

      </div>{/* end .portfolio-scroll-content */}

      <section className="contact-section" id="contact">
        <div className="contact-top">
          <SectionReveal className="contact-left">
            <p className="contact-label">Contact</p>
            <p className="contact-body">
              Open to senior product designer roles. Reach out at{" "}
              <a className="contact-email" href="mailto:vraroraa@protonmail.com">
                vraroraa@protonmail.com
              </a>
            </p>
            <a
              className="contact-book-btn"
              href={siteLinks.resume}
              target="_blank"
              rel="noreferrer"
            >
              <FileText size={18} weight="bold" />
              View resume
            </a>
          </SectionReveal>

          <SectionReveal className="contact-center" delay={80}>
            <h2 className="contact-heading">OPEN TO THE RIGHT OPPORTUNITY.</h2>
            <div className="contact-socials-block">
              <p className="contact-socials-label">Find me elsewhere in the internet</p>
              <div className="contact-socials-row">
                <a className="contact-social-link" href={siteLinks.linkedin} target="_blank" rel="noreferrer">
                  <LinkedinLogo size={20} />
                  LinkedIn
                </a>
                <a className="contact-social-link" href={siteLinks.twitter} target="_blank" rel="noreferrer">
                  <XLogo size={20} />
                  Twitter
                </a>
                <a className="contact-social-link" href={siteLinks.github} target="_blank" rel="noreferrer">
                  <GithubLogo size={20} />
                  GitHub
                </a>
              </div>
            </div>
          </SectionReveal>

          <a className="contact-scroll-top" href="#top" aria-label="Back to top">
            <span className="scroll-top-clip">
              <span className="scroll-top-track">
                <ArrowUp size={16} />
                <ArrowUp size={16} />
              </span>
            </span>
          </a>
        </div>

        {/* Decorative logotype */}
        <div className="contact-logotype" aria-hidden="true">
          <span className="contact-logo-word">Vaibhav</span>
        </div>

        <div className="contact-footer-bar">
          <div className="footer-left"></div>
          <span className="footer-center">Designed &amp; built with care from India</span>
          <span className="footer-right">©2026</span>
        </div>
      </section>



    </main>
  );
}
