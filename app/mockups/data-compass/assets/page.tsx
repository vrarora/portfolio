"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChartBar,
  CloudArrowUp,
  Compass,
  Database,
  Folder,
  Funnel,
  Gear,
  Graph,
  Lightning,
  MagnifyingGlass,
  Snowflake,
  Stack,
  Tag,
  Trash,
  XCircle,
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
  ArrowsDownUp,
  SpinnerGap,
  X,
} from "@phosphor-icons/react";
import { ZapIcon, LayersIcon, ScanLineIcon } from "@animateicons/react/lucide";
import { DcTopNav, DcSidebar, type NavItem } from "@/components/data-compass/library";
import "../styles.css";
import "../hover-tokens.css";

// ─── Custom FilterSelect component ───────────────────────────────────────────

interface FilterSelectProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}

function FilterSelect({ label, options, value, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="dca-filter-select-wrapper">
      <div className="dca-filter-select-btn-container">
        <button
          className={`dca-filter-select-btn${open ? " is-open" : ""}${value ? " has-value" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <span className="dca-filter-select-label">
            {value ? `${label}: ${value}` : label}
          </span>
          <span className="dca-filter-select-chevron">
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
              <path d="M1 1L4 4L7 1" stroke="#6f6f6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        {value && (
          <div
            className="dca-filter-select-clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onChange(null);
              }
            }}
          >
            <X size={9} weight="bold" />
          </div>
        )}
      </div>

      {open && (
        <div className="dca-filter-select-dropdown">
          {options.map((opt) => (
            <button
              key={opt}
              className={`dca-filter-select-option${opt === value ? " is-selected" : ""}`}
              onClick={() => {
                onChange(opt === value ? null : opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar nav items ───────────────────────────────────────────────────────

const sidebarItems: NavItem[] = [
  { label: "Explore",          icon: <Compass size={16} />,  href: "/mockups/data-compass" },
  { label: "Dashboard",        icon: <ChartBar size={16} /> },
  { label: "Assets",           icon: <Folder size={16} />,   active: true, href: "/mockups/data-compass/assets" },
  { label: "Lineage",          icon: <Graph size={16} /> },
  { label: "Business Process", icon: <Gear size={16} /> },
  { label: "Domains",          icon: <Database size={16} /> },
  { label: "Tag Categories",   icon: <Tag size={16} /> },
];

// ─── Data ────────────────────────────────────────────────────────────────────

type ScanState = "in-progress" | "failed" | string;
type DpStatus  = "healthy" | "error";

type AssetRow = {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  catalogueScan: ScanState;
  classificationScan: ScanState;
  dataPlane: { name: string; status: DpStatus };
};

const assets: AssetRow[] = [
  { id: "hr_admin",              name: "hr_admin",              type: "Postgres",     category: "Cloud", size: "4 TB",    catalogueScan: "in-progress",  classificationScan: "2 hours ago",  dataPlane: { name: "IDfy-DP-Beta",    status: "error"   } },
  { id: "addressify",            name: "addressify",            type: "GCS",          category: "Cloud", size: "164 GB",  catalogueScan: "24 Nov' 25",   classificationScan: "2 hours ago",  dataPlane: { name: "Axis-DP-Prod",    status: "healthy" } },
  { id: "acquirze_finance",      name: "acquirze_finance",      type: "ElasticSearch",category: "Cloud", size: "100 TB",  catalogueScan: "24 Nov' 25",   classificationScan: "2 hours ago",  dataPlane: { name: "Federal-DP-Main", status: "healthy" } },
  { id: "syntegrate_marketing",  name: "syntegrate_marketing",  type: "Metabase",     category: "Cloud", size: "1 PB",    catalogueScan: "18 Jan' 26",   classificationScan: "in-progress",  dataPlane: { name: "Privy-DP-Core",   status: "error"   } },
  { id: "datarize_engineering",  name: "datarize_engineering",  type: "Databricks",   category: "Cloud", size: "320 TB",  catalogueScan: "24 Nov' 25",   classificationScan: "2 hours ago",  dataPlane: { name: "IDfy-DP-Alpha",   status: "error"   } },
  { id: "addressify_product",    name: "addressify_product",    type: "Snowflake",    category: "Cloud", size: "600 TB",  catalogueScan: "24 Nov' 25",   classificationScan: "2 hours ago",  dataPlane: { name: "Acme-DP-Prod",    status: "healthy" } },
  { id: "addressify_hr",         name: "addressify_hr",         type: "MySQL",        category: "Cloud", size: "169 GB",  catalogueScan: "24 Nov' 25",   classificationScan: "failed",       dataPlane: { name: "Soylent-DP-Prod", status: "error"   } },
  { id: "addressify_tech",       name: "addressify_tech",       type: "Postgres",     category: "Cloud", size: "24 TB",   catalogueScan: "24 Nov' 25",   classificationScan: "2 hours ago",  dataPlane: { name: "VS-DP-Primary",   status: "healthy" } },
];

// ─── Asset type icon ──────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, { icon: React.ReactElement; color: string }> = {
  // eslint-disable-next-line @next/next/no-img-element
  Postgres:     { icon: <img src="https://thesvg.org/icons/postgresql/default.svg" alt="Postgres" width={14} height={14} style={{ display: "block" }} />, color: "#336791" },
  MySQL:        { icon: <Database size={14} weight="fill" />, color: "#00758f" },
  GCS:          { icon: <CloudArrowUp size={14} weight="fill" />, color: "#4285f4" },
  ElasticSearch:{ icon: <Stack size={14} weight="fill" />, color: "#f5b626" },
  Metabase:     { icon: <ChartBar size={14} weight="fill" />, color: "#509ee3" },
  Databricks:   { icon: <Lightning size={14} weight="fill" />, color: "#ff3621" },
  Snowflake:    { icon: <Snowflake size={14} weight="fill" />, color: "#29b5e8" },
};

function TypeIcon({ type }: { type: string }) {
  const t = TYPE_ICON[type] ?? { icon: <Database size={14} weight="fill" />, color: "#6f6f6f" };
  return (
    <span className="dca-type-icon" style={{ color: t.color }}>
      {t.icon}
    </span>
  );
}

// ─── Scan status cell ─────────────────────────────────────────────────────────

function ScanStatus({ value }: { value: ScanState }) {
  if (value === "in-progress") {
    return (
      <span className="dca-scan-status dca-scan-in-progress">
        <span className="dca-scan-spinner"><SpinnerGap size={13} weight="bold" /></span>
        In Progress
      </span>
    );
  }
  if (value === "failed") {
    return (
      <span className="dca-scan-status dca-scan-failed">
        <XCircle size={13} weight="fill" />
        Failed
      </span>
    );
  }
  return <span>{value}</span>;
}

// ─── Filter popover ───────────────────────────────────────────────────────────

function FilterPopover({
  onClose,
  resultCount,
}: {
  onClose: () => void;
  resultCount: number;
}) {
  const [type, setType] = useState("all");
  const [health, setHealth] = useState("all");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="dca-filter-popover" ref={ref}>
      <div className="dca-filter-popover-title">Filter by</div>
      <div className="dca-filter-field">
        <label className="dca-filter-label">Type</label>
        <select className="dca-filter-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="all">All</option>
          <option value="postgres">Postgres</option>
          <option value="mysql">MySQL</option>
          <option value="gcs">GCS</option>
          <option value="elasticsearch">ElasticSearch</option>
          <option value="metabase">Metabase</option>
          <option value="databricks">Databricks</option>
          <option value="snowflake">Snowflake</option>
        </select>
      </div>
      <div className="dca-filter-field">
        <label className="dca-filter-label">Health</label>
        <select className="dca-filter-select" value={health} onChange={e => setHealth(e.target.value)}>
          <option value="all">All</option>
          <option value="healthy">Healthy</option>
          <option value="error">Error</option>
        </select>
      </div>
      <div className="dca-filter-popover-footer">
        <span className="dca-filter-count">{resultCount} results found</span>
        <button className="dc-btn-primary dc-btn-sm" onClick={onClose}>Apply</button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Connector modal ──────────────────────────────────────────────────────────

function ConnectorLogo({ src, alt, fallbackSrc, size = 24 }: { src: string; alt: string; fallbackSrc?: string; size?: number }) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
  };
  return <img src={src} alt={alt} width={size} height={size} style={{ display: "block" }} onError={handleError} />;
}

type ConnectorDef = {
  id: string;
  name: string;
  desc: string;
  logoSrc: string;
  fallbackSrc?: string;
  category: string;
};

const CONNECTORS: ConnectorDef[] = [
  { id: "postgres",      name: "PostgreSQL",          desc: "Connect a Postgres database",            logoSrc: "https://thesvg.org/icons/postgresql/default.svg",                                                                              category: "database"  },
  { id: "mysql",         name: "MySQL",                desc: "Connect a MySQL database",               logoSrc: "https://cdn.simpleicons.org/mysql/00758f",                                                                                     category: "database"  },
  { id: "snowflake",     name: "Snowflake",            desc: "Connect a Snowflake data warehouse",     logoSrc: "https://cdn.simpleicons.org/snowflake/29b5e8",                                                                                 category: "warehouse" },
  { id: "databricks",    name: "Databricks",           desc: "Connect a Databricks lakehouse",         logoSrc: "https://cdn.simpleicons.org/databricks/ff3621",                                                                                category: "warehouse" },
  { id: "gcs",           name: "Google Cloud Storage", desc: "Connect a GCS bucket",                   logoSrc: "https://cdn.simpleicons.org/googlecloudstorage/4285f4",                                                                        category: "storage"   },
  { id: "elasticsearch", name: "Elasticsearch",        desc: "Connect an Elasticsearch cluster",       logoSrc: "https://cdn.simpleicons.org/elasticsearch/f5b626",                                                                             category: "database"  },
  { id: "metabase",      name: "Metabase",             desc: "Connect a Metabase instance",            logoSrc: "https://cdn.simpleicons.org/metabase/509ee3",                                                                                  category: "analytics" },
  { id: "bigquery",      name: "BigQuery",             desc: "Connect a BigQuery project",             logoSrc: "https://cdn.simpleicons.org/googlebigquery/669df6",                                                                            category: "warehouse" },
  { id: "redshift",      name: "Redshift",             desc: "Connect an Amazon Redshift cluster",     logoSrc: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/aws-redshift.svg",   fallbackSrc: "https://cdn.simpleicons.org/amazonaws/8c4fff", category: "warehouse" },
  { id: "mongodb",       name: "MongoDB",              desc: "Connect a MongoDB Atlas cluster",        logoSrc: "https://cdn.simpleicons.org/mongodb/00ed64",                                                                                   category: "database"  },
  { id: "s3",            name: "Amazon S3",            desc: "Connect an S3 bucket",                   logoSrc: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/aws-s3.svg",         fallbackSrc: "https://cdn.simpleicons.org/amazonaws/ff9900", category: "storage"   },
  { id: "looker",        name: "Looker",               desc: "Connect a Looker instance",              logoSrc: "https://cdn.simpleicons.org/looker/4285f4",                                                                                    category: "analytics" },
];

const CONNECTOR_TABS = ["All", "Database", "Warehouse", "Storage", "Analytics"] as const;

type ScanScope = "quick" | "standard" | "comprehensive";

type AnimateIconHandle = { startAnimation: () => void; stopAnimation: () => void };
type AnimateIconComponent = React.ForwardRefExoticComponent<
  { size?: number; color?: string; isAnimated?: boolean; style?: React.CSSProperties; className?: string } &
  React.RefAttributes<AnimateIconHandle>
>;

const SCAN_TIERS: { id: ScanScope; label: string; desc: string; files: string; eta: string; recommended?: boolean; IconComponent: AnimateIconComponent; iconColor: string; iconColorNeutral: string }[] = [
  { id: "quick",         label: "Quick",         desc: "Fast spot-check for initial triage",     files: "10k files",  eta: "ETA ~2 min",  IconComponent: ZapIcon as AnimateIconComponent,      iconColor: "#2272b4", iconColorNeutral: "#6b7280", recommended: true },
  { id: "standard",      label: "Standard",      desc: "Balanced depth across all file types",   files: "50k files",  eta: "ETA ~8 min",  IconComponent: LayersIcon as AnimateIconComponent,   iconColor: "#2272b4", iconColorNeutral: "#6b7280" },
  { id: "comprehensive", label: "Comprehensive", desc: "Full depth scan on every file type",     files: "100k files", eta: "ETA ~18 min", IconComponent: ScanLineIcon as AnimateIconComponent, iconColor: "#6b7280", iconColorNeutral: "#6b7280" },
];

function ConfigureAssetStep({ connector, onBack, onClose, onSave }: { connector: ConnectorDef; onBack: () => void; onClose: () => void; onSave: () => void }) {
  const [scope, setScope] = useState<ScanScope | null>(null);
  const iconRefs = useRef<Array<AnimateIconHandle | null>>([null, null, null]);

  useEffect(() => {
    SCAN_TIERS.forEach((_, idx) => {
      iconRefs.current[idx]?.stopAnimation();
    });
    if (!scope) return;

    const selectedIdx = SCAN_TIERS.findIndex((t) => t.id === scope);
    const selectedRef = iconRefs.current[selectedIdx];
    if (!selectedRef) return;

    selectedRef.startAnimation();
    const interval = setInterval(() => {
      selectedRef.stopAnimation();
      setTimeout(() => selectedRef.startAnimation(), 80);
    }, 2000);
    return () => clearInterval(interval);
  }, [scope]);

  return (
    <>
      {/* Header */}
      <div className="dca-modal-header">
        <div className="dca-configure-header-left">
          <button className="dca-configure-back-btn" onClick={onBack} aria-label="Back">
            <ArrowLeft size={15} />
          </button>
          <span className="dca-configure-header-logo">
            <ConnectorLogo src={connector.logoSrc} alt={connector.name} fallbackSrc={connector.fallbackSrc} size={18} />
          </span>
          <h2 className="dca-modal-title">Add {connector.name}</h2>
        </div>
        <div className="dca-configure-header-right">
          <button className="dc-btn-primary dc-btn-sm" onClick={() => { onSave(); onClose(); }}>Save and Continue</button>
          <button className="dca-modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
      </div>

      {/* Body — two columns: form left, scan scope right */}
      <div className="dca-configure-body">
        {/* Form */}
        <div className="dca-configure-form">
          <div className="dca-configure-row">
            <div className="dca-configure-field">
              <label className="dca-configure-label">Domain Name</label>
              <select className="dca-configure-select">
                <option value="">Select domain</option>
                <option>Engineering</option>
                <option>Finance</option>
                <option>Marketing</option>
                <option>HR</option>
              </select>
            </div>
            <div className="dca-configure-field">
              <label className="dca-configure-label">Subdomain Name</label>
              <select className="dca-configure-select">
                <option value="">Select subdomain</option>
                <option>Data Platform</option>
                <option>Analytics</option>
                <option>Infrastructure</option>
              </select>
            </div>
          </div>
          <div className="dca-configure-row">
            <div className="dca-configure-field">
              <label className="dca-configure-label">Environment</label>
              <select className="dca-configure-select">
                <option value="">Select environment</option>
                <option>Production</option>
                <option>Staging</option>
                <option>Development</option>
                <option>QA</option>
              </select>
            </div>
            <div className="dca-configure-field">
              <label className="dca-configure-label">Asset Name <span className="dca-configure-required">*</span></label>
              <input className="dca-configure-input" type="text" placeholder="Service name" />
            </div>
          </div>
          <div className="dca-configure-field">
            <label className="dca-configure-label">Asset Label <span className="dca-configure-required">*</span></label>
            <input className="dca-configure-input" type="text" placeholder="Label" />
          </div>
          <div className="dca-configure-field">
            <label className="dca-configure-label">Asset Description <span className="dca-configure-required">*</span></label>
            <textarea className="dca-configure-textarea" placeholder="Describe what this asset is and the type of data it holds." rows={3} />
          </div>
        </div>

        {/* Scan scope — right column */}
        <div className="dca-scan-scope">
          <p className="dca-scan-scope-title">Select Scan Scope</p>
          <div className="dca-scan-scope-list">
            {SCAN_TIERS.map((tier, idx) => (
              <label key={tier.id} className={`dca-scan-tier${scope === tier.id ? " is-selected" : ""}${idx < SCAN_TIERS.length - 1 ? " has-divider" : ""}`} onClick={() => setScope(tier.id)}>
                <span className="dca-scan-tier-icon">
                  <tier.IconComponent
                    ref={(el) => { iconRefs.current[idx] = el; }}
                    size={18}
                    color={scope === tier.id ? tier.iconColor : tier.iconColorNeutral}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  />
                </span>
                <span className="dca-scan-tier-body">
                  <span className="dca-scan-tier-name">
                    {tier.label}
                    {tier.recommended && <span className="dca-scan-recommended">Recommended</span>}
                  </span>
                  <span className="dca-scan-tier-desc">{tier.desc}</span>
                </span>
                <span className="dca-scan-tier-meta">
                  <span className="dca-scan-tier-files">{tier.files}</span>
                  <span className="dca-scan-tier-eta">{tier.eta}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ConnectorModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [tab, setTab] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ConnectorDef | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (e.target === backdropRef.current) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const visible = CONNECTORS.filter(c => {
    const matchesTab = tab === "All" || c.category === tab.toLowerCase();
    const matchesQuery = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="dca-modal-backdrop" ref={backdropRef}>
      <div className={`dca-connector-modal${selected ? " is-configure" : ""}`} role="dialog" aria-modal="true" aria-label="Add Data Asset">

        {selected ? (
          <ConfigureAssetStep connector={selected} onBack={() => setSelected(null)} onClose={onClose} onSave={onSave} />
        ) : (
          <>
            {/* Header */}
            <div className="dca-modal-header">
              <h2 className="dca-modal-title">Add Data Asset</h2>
              <button className="dca-modal-close" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Search + tabs */}
            <div className="dca-connector-toolbar">
              <div className="dca-connector-search-wrap">
                <MagnifyingGlass size={14} className="dca-connector-search-icon" />
                <input
                  className="dca-connector-search"
                  type="text"
                  placeholder="Search connectors…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="dca-connector-tabs">
                {CONNECTOR_TABS.map(t => (
                  <button
                    key={t}
                    className={`dca-connector-tab${tab === t ? " is-active" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Connector grid */}
            <div className="dca-connector-grid-wrap">
              {visible.length === 0 ? (
                <p className="dca-connector-empty">No connectors match your search.</p>
              ) : (
                <div className="dca-connector-grid">
                  {visible.map(c => (
                    <button key={c.id} className="dca-connector-card" onClick={() => setSelected(c)}>
                      <span className="dca-connector-card-icon">
                        <ConnectorLogo src={c.logoSrc} alt={c.name} fallbackSrc={c.fallbackSrc} size={24} />
                      </span>
                      <span className="dca-connector-card-name">{c.name}</span>
                      <span className="dca-connector-card-desc">{c.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function AssetsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [connectorOpen, setConnectorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [storageType, setStorageType] = useState<string | null>(null);
  const [health, setHealth] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [assetList, setAssetList] = useState<AssetRow[]>(assets);
  const [toast, setToast] = useState(false);
  const PAGE_SIZE = 25;

  function handleAssetSave() {
    setAssetList(prev => [
      ...prev,
      {
        id: `gcs_${Date.now()}`,
        name: "new_gcs_bucket",
        type: "GCS",
        category: "Cloud",
        size: "—",
        catalogueScan: "in-progress",
        classificationScan: "—",
        dataPlane: { name: "IDfy-DP-Beta", status: "healthy" },
      },
    ]);
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  }

  const filtered = assetList.filter(a => {
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    const matchesStorage = !storageType || a.type === storageType;
    const matchesHealth = !health || a.dataPlane.status === (health === "Healthy" ? "healthy" : "error");
    return matchesSearch && matchesStorage && matchesHealth;
  });

  const totalPages = 10; // Spec shows 10 pages in pagination
  const visibleRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="dc-page">
      <DcTopNav isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(p => !p)} />
      <div className="dca-layout">
        <DcSidebar items={sidebarItems} isOpen={isSidebarOpen} />

        <main className="dca-content-area">
          {/* Page header */}
          <div className="dca-page-header">
            <h1 className="dca-page-title">Assets</h1>
          </div>

          {/* Table section */}
          <div className="dca-table-section">
            {/* Filters bar */}
            <div className="dca-filters-bar">
              <div className="dca-filter-input-wrap">
                <span className="dca-filter-search-icon">
                  <MagnifyingGlass size={14} />
                </span>
                <input
                  className="dca-filter-input"
                  placeholder="Search assets…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <FilterSelect
                label="Storage Type"
                options={["Postgres", "GCS", "ElasticSearch", "Metabase", "Databricks", "Snowflake", "MySQL"]}
                value={storageType}
                onChange={setStorageType}
              />

              <FilterSelect
                label="Health"
                options={["Healthy", "Offline"]}
                value={health}
                onChange={setHealth}
              />

              <button className="dc-btn-primary dc-btn-sm" style={{ marginLeft: "auto", height: "32px", boxSizing: "border-box" }} onClick={() => setConnectorOpen(true)}>
                + Data Asset
              </button>
            </div>

            {/* Table */}
            <table className="dca-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>
                    <div className="dca-th-cell">
                      Name
                      <button className="dca-sort-btn" aria-label="Sort"><ArrowsDownUp size={10} /></button>
                    </div>
                  </th>
                  <th style={{ minWidth: 130 }}>
                    <div className="dca-th-cell">Type</div>
                  </th>
                  <th style={{ minWidth: 100 }}>
                    <div className="dca-th-cell">Category</div>
                  </th>
                  <th style={{ minWidth: 90 }}>
                    <div className="dca-th-cell">
                      Size
                      <button className="dca-sort-btn" aria-label="Sort"><ArrowsDownUp size={10} /></button>
                    </div>
                  </th>
                  <th style={{ minWidth: 160 }}>
                    <div className="dca-th-cell">
                      Last Catalogue Scan
                      <button className="dca-sort-btn" aria-label="Sort"><ArrowsDownUp size={10} /></button>
                    </div>
                  </th>
                  <th style={{ minWidth: 180 }}>
                    <div className="dca-th-cell">
                      Last Classification Scan
                      <button className="dca-sort-btn" aria-label="Sort"><ArrowsDownUp size={10} /></button>
                    </div>
                  </th>
                  <th style={{ minWidth: 170 }}>
                    <div className="dca-th-cell">Data Plane</div>
                  </th>
                  <th style={{ width: 56 }}>
                    <div className="dca-th-cell">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(row => (
                  <tr key={row.id} className="dca-asset-row">
                    <td>
                      <div className="dca-name-cell">
                        <TypeIcon type={row.type} />
                        <span className="dca-asset-name">{row.name}</span>
                        <a
                          href={`/mockups/data-compass/assets/${row.id}`}
                          className="dca-open-btn"
                        >
                          Open
                        </a>
                      </div>
                    </td>
                    <td>{row.type}</td>
                    <td>{row.category}</td>
                    <td>{row.size}</td>
                    <td><ScanStatus value={row.catalogueScan} /></td>
                    <td><ScanStatus value={row.classificationScan} /></td>
                    <td>
                      <div className="dca-dp-cell">
                        <span className={`dca-dp-dot dca-dp-dot-${row.dataPlane.status}`} />
                        <span className="dca-dp-name">{row.dataPlane.name}</span>
                        <button className="dca-view-btn">View</button>
                      </div>
                    </td>
                    <td>
                      <button className="dca-delete-btn" aria-label="Delete asset">
                        <Trash size={15} weight="fill" />
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#6f6f6f" }}>
                      No assets match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="dca-pagination">
              <div className="dca-page-size-wrap">
                Show{" "}
                <select className="dca-page-size-select" defaultValue="25">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>{" "}
                per page
              </div>

              <div className="dca-page-controls">
                <button className="dca-page-btn" aria-label="First page" disabled={page === 0} onClick={() => setPage(0)}>
                  <CaretDoubleLeft size={11} />
                </button>
                <button className="dca-page-btn" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <CaretLeft size={11} />
                </button>
                {[0, 1].map(i => (
                  <button
                    key={i}
                    className={`dca-page-btn${page === i ? " is-active" : ""}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <span className="dca-page-ellipsis">…</span>
                <button className="dca-page-btn" onClick={() => setPage(totalPages - 1)}>
                  {totalPages}
                </button>
                <button className="dca-page-btn" aria-label="Next page" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <CaretRight size={11} />
                </button>
                <button className="dca-page-btn" aria-label="Last page" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
                  <CaretDoubleRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {connectorOpen && <ConnectorModal onClose={() => setConnectorOpen(false)} onSave={handleAssetSave} />}

      {toast && (
        <div className="dca-toast-pill">
          <span className="dca-toast-pill-check">✓</span>
          Successfully installed connector
        </div>
      )}
    </div>
  );
}
