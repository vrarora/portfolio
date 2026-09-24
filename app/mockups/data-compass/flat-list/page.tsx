"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  ChartBar,
  Compass,
  Database,
  FileText,
  Funnel,
  Gear,
  MagnifyingGlass,
  Stack,
  Table,
  X,
} from "@phosphor-icons/react";

import { ESTATE_TOTAL, FACETS, ROWS, type FlatRow, type NodeKind, type Sensitivity } from "./data";
import styles from "./flat-list.module.css";

const PAGE_SIZE = 20;

/* Embedded in the case study, the list scrolls itself and pages forward on a loop. */
const SCROLL_PX_PER_S = 140;
const PAUSE_MS = 900;
const LOOP_PAGES = 3;

type Filters = { sensitivity: Sensitivity[]; kind: NodeKind[]; pii: string[] };

const EMPTY: Filters = { sensitivity: [], kind: [], pii: [] };

const FACET_LABEL: Record<keyof Filters, string> = {
  sensitivity: "Sensitivity",
  kind: "Node type",
  pii: "PII type",
};

const number = new Intl.NumberFormat("en-IN");

function matches(row: FlatRow, filters: Filters, query: string) {
  if (filters.sensitivity.length && !filters.sensitivity.includes(row.sensitivity)) return false;
  if (filters.kind.length && !filters.kind.includes(row.kind)) return false;
  if (filters.pii.length && !row.pii.some((p) => filters.pii.includes(p))) return false;
  if (query && !`${row.name} ${row.path}`.toLowerCase().includes(query.toLowerCase())) return false;
  return true;
}

export default function FlatListMockup() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const embedded = window.self !== window.top;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!list || !embedded || reduced) return;

    let frame = 0;
    let timer = 0;
    let last = 0;
    let offset = 0;

    const step = (now: number) => {
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      offset += SCROLL_PX_PER_S * dt;
      list.scrollTop = offset;
      if (offset >= list.scrollHeight - list.clientHeight) {
        timer = window.setTimeout(() => {
          setPage((p) => (p >= LOOP_PAGES ? 1 : p + 1));
          offset = 0;
          last = 0;
          list.scrollTop = 0;
          timer = window.setTimeout(() => (frame = requestAnimationFrame(step)), PAUSE_MS);
        }, PAUSE_MS);
        return;
      }
      frame = requestAnimationFrame(step);
    };

    timer = window.setTimeout(() => (frame = requestAnimationFrame(step)), PAUSE_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  const filtered = useMemo(() => ROWS.filter((row) => matches(row, filters, query)), [filters, query]);

  // The mockup holds a sample; the count scales it up to the estate the page claims.
  const total = Math.round((ESTATE_TOTAL * filtered.length) / ROWS.length);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const visible = useMemo(() => {
    if (!filtered.length) return [];
    const start = ((page - 1) * PAGE_SIZE) % filtered.length;
    return Array.from({ length: Math.min(PAGE_SIZE, filtered.length) }, (_, i) => filtered[(start + i) % filtered.length]);
  }, [filtered, page]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  // Any change to what matches starts again from page one.
  const updateFilters = (next: (current: Filters) => Filters) => {
    setFilters(next);
    setPage(1);
  };

  const toggle = <K extends keyof Filters>(facet: K, value: Filters[K][number]) =>
    updateFilters((current) => {
      const list = current[facet] as string[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...current, [facet]: next };
    });

  const applied = (Object.keys(filters) as (keyof Filters)[]).flatMap((facet) =>
    (filters[facet] as string[]).map((value) => ({ facet, value })),
  );

  const first = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <div className={styles.app}>
      <nav className={styles.rail} aria-label="Primary">
        <span className={styles.logo}>
          <Compass size={18} weight="bold" />
        </span>
        <span className={`${styles.railItem} ${styles.railActive}`} title="Explore">
          <Stack size={18} />
        </span>
        <span className={styles.railItem} title="Assets">
          <Database size={18} />
        </span>
        <span className={styles.railItem} title="Dashboard">
          <ChartBar size={18} />
        </span>
        <span className={`${styles.railItem} ${styles.railEnd}`} title="Settings">
          <Gear size={18} />
        </span>
      </nav>

      <main className={styles.panel}>
        <header className={styles.header}>
          <p className={styles.crumb}>Penguin Bank</p>
          <h1 className={styles.title}>Explore</h1>
          <p className={styles.meta}>Every column and file found across all assets</p>
        </header>

        <div className={styles.toolbar}>
          <label className={styles.search}>
            <MagnifyingGlass size={16} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search columns, files and paths"
              aria-label="Search"
            />
          </label>
          <span className={styles.divider} aria-hidden />
          <div className={styles.filterWrap} ref={menuRef}>
            <button type="button" className={styles.filterButton} onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
              <Funnel size={16} />
              Filters
              {applied.length > 0 && <span className={styles.count}>{applied.length}</span>}
            </button>
            {menuOpen && (
              <div className={styles.menu} role="menu">
                {(Object.keys(FACETS) as (keyof Filters)[]).map((facet) => (
                  <div key={facet} className={styles.menuGroup}>
                    <p className={styles.menuLabel}>{FACET_LABEL[facet]}</p>
                    <div className={styles.menuOptions}>
                      {(FACETS[facet] as string[]).map((value) => {
                        const on = (filters[facet] as string[]).includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            role="menuitemcheckbox"
                            aria-checked={on}
                            className={`${styles.option} ${on ? styles.optionOn : ""}`}
                            onClick={() => toggle(facet, value as never)}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {applied.length > 0 && (
          <div className={styles.applied}>
            {applied.map(({ facet, value }) => (
              <span key={`${facet}-${value}`} className={styles.chip}>
                <span className={styles.chipKey}>{FACET_LABEL[facet]}</span>
                <span className={styles.chipValue}>{value}</span>
                <button type="button" className={styles.chipX} onClick={() => toggle(facet, value as never)} aria-label={`Remove ${value}`}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <button type="button" className={styles.clear} onClick={() => updateFilters(() => EMPTY)}>
              Clear all
            </button>
          </div>
        )}

        <div ref={listRef} className={styles.listScroll}>
          <ul className={styles.list}>
            {visible.map((row, i) => (
              <li key={`${page}-${i}-${row.id}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.nameCell}>
                    {row.kind === "Column" ? <Table size={14} /> : <FileText size={14} />}
                    <span className={`${styles.mono} ${styles.truncate}`}>{row.name}</span>
                  </span>
                  <span className={styles.kind}>{row.kind}</span>
                  <span className={styles.badge} data-level={row.sensitivity}>
                    {row.sensitivity}
                  </span>
                </div>
                <p className={`${styles.mono} ${styles.path}`}>{row.path}</p>
                <div className={styles.cardBottom}>
                  <span className={styles.piiRow}>
                    {row.pii.map((p) => (
                      <span key={p} className={styles.pii}>
                        {p}
                      </span>
                    ))}
                  </span>
                  <span className={styles.scanned}>Scanned {row.scanned.toLowerCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className={styles.pager}>
          <span className={styles.subtle}>
            {number.format(first)}-{number.format(last)} of {number.format(total)} results
          </span>
          <div className={styles.pageControls}>
            <button type="button" className={styles.pageButton} disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <CaretLeft size={14} />
            </button>
            <span className={styles.pageNumber}>
              Page {number.format(page)} of {number.format(pages)}
            </span>
            <button type="button" className={styles.pageButton} disabled={page === pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
              <CaretRight size={14} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
