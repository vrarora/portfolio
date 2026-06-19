"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowSquareOut,
  CaretDoubleLeft,
  CaretDoubleRight,
  CaretLeft,
  CaretRight,
  CaretRight as Caret,
  ChartBar,
  Clock,
  Compass,
  Copy,
  Database,
  DotsThreeVertical,
  Folder,
  Funnel,
  Gear,
  Graph,
  Info,
  MagnifyingGlass,
  Snowflake,
  SpinnerGap,
  Stack,
  Tag,
  Trash,
  User,
  X,
  CheckCircle,
} from "@phosphor-icons/react";
import { DcTopNav, DcSidebar, type NavItem } from "@/components/data-compass/library";
import "../../styles.css";
import "../../hover-tokens.css";

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const sidebarItems: NavItem[] = [
  { label: "Explore",          icon: <Compass size={16} />,  href: "/mockups/data-compass" },
  { label: "Dashboard",        icon: <ChartBar size={16} /> },
  { label: "Assets",           icon: <Folder size={16} />,   active: true, href: "/mockups/data-compass/assets" },
  { label: "Lineage",          icon: <Graph size={16} /> },
  { label: "Business Process", icon: <Gear size={16} /> },
  { label: "Domains",          icon: <Database size={16} /> },
  { label: "Tag Categories",   icon: <Tag size={16} /> },
];

// ─── Asset data ───────────────────────────────────────────────────────────────

const assetMeta: Record<string, {
  name: string;
  type: string;
  category: string;
  env: string;
  onboarded: string;
  domain: string;
  subdomain: string;
  dataPlane: string;
  risk: "High" | "Medium" | "Low";
  catalogueCount: number;
  classificationCount: number;
}> = {
  hr_admin: {
    name: "hr_admin",
    type: "Postgres",
    category: "Database",
    env: "triton",
    onboarded: "27 Feb 2026, 03:45 pm",
    domain: "hr.company.com",
    subdomain: "admin",
    dataPlane: "IDfy-DP-Beta",
    risk: "High",
    catalogueCount: 10,
    classificationCount: 8,
  },
};

const defaultMeta = assetMeta.hr_admin;

// ─── Workflow data ────────────────────────────────────────────────────────────

type WorkflowRow = {
  id: string;
  index: number;
  refId: string;
  schedule: string | null;
  scheduleOn: boolean;
  createdAt: string;
  createdBy: { initial: string; email: string; color: string };
  jobs: [number, number, number, number, number]; // running, completed, partial, failed, unknown
};

const catalogueWorkflows: WorkflowRow[] = [
  { id: "wf1",  index: 1,  refId: "6f56abb5-f79d-48e2-b310-a71c3d9f0011", schedule: "0 9 * * 1",  scheduleOn: true,  createdAt: "28 Feb 2026, 06:19 pm", createdBy: { initial: "V", email: "vaibhav.arora@idfy.com",  color: "#434a93" }, jobs: [2, 5, 1, 2, 1] },
  { id: "wf2",  index: 2,  refId: "a3c2e1d0-9f8b-47a2-c520-d84f120a8822", schedule: "0 0 * * *",  scheduleOn: true,  createdAt: "25 Feb 2026, 10:00 am", createdBy: { initial: "S", email: "surya.patel@idfy.com",    color: "#2ea143" }, jobs: [0, 12, 0, 0, 0] },
  { id: "wf3",  index: 3,  refId: "b4d5f6a7-1c2d-48e3-e640-f95g231b9933", schedule: null,          scheduleOn: false, createdAt: "20 Feb 2026, 02:30 pm", createdBy: { initial: "R", email: "ravi.kumar@idfy.com",     color: "#9f5f00" }, jobs: [1, 8, 2, 1, 0] },
  { id: "wf4",  index: 4,  refId: "c5e6g7b8-2d3e-49f4-f751-g06h342c0044", schedule: "0 6 * * 1-5",scheduleOn: true,  createdAt: "15 Feb 2026, 11:45 am", createdBy: { initial: "A", email: "ananya.m@idfy.com",       color: "#c82d4c" }, jobs: [0, 3, 0, 1, 0] },
  { id: "wf5",  index: 5,  refId: "d6f7h8c9-3e4f-40g5-g862-h17i453d1155", schedule: "0 10 * * 0", scheduleOn: false, createdAt: "10 Feb 2026, 09:20 am", createdBy: { initial: "V", email: "vaibhav.arora@idfy.com",  color: "#434a93" }, jobs: [0, 6, 0, 0, 2] },
  { id: "wf6",  index: 6,  refId: "e7g8i9d0-4f5g-41h6-h973-i28j564e2266", schedule: "30 8 * * *", scheduleOn: true,  createdAt: "05 Feb 2026, 04:10 pm", createdBy: { initial: "S", email: "surya.patel@idfy.com",    color: "#2ea143" }, jobs: [1, 9, 1, 0, 0] },
  { id: "wf7",  index: 7,  refId: "f8h9j0e1-5g6h-42i7-i084-j39k675f3377", schedule: null,          scheduleOn: false, createdAt: "01 Feb 2026, 08:00 am", createdBy: { initial: "R", email: "ravi.kumar@idfy.com",     color: "#9f5f00" }, jobs: [0, 4, 0, 2, 1] },
  { id: "wf8",  index: 8,  refId: "g9i0k1f2-6h7i-43j8-j195-k40l786g4488", schedule: "0 12 1 * *", scheduleOn: true,  createdAt: "28 Jan 2026, 03:30 pm", createdBy: { initial: "A", email: "ananya.m@idfy.com",       color: "#c82d4c" }, jobs: [0, 7, 1, 0, 0] },
  { id: "wf9",  index: 9,  refId: "h0j1l2g3-7i8j-44k9-k206-l51m897h5599", schedule: "0 9 * * 1",  scheduleOn: true,  createdAt: "20 Jan 2026, 10:15 am", createdBy: { initial: "V", email: "vaibhav.arora@idfy.com",  color: "#434a93" }, jobs: [3, 2, 0, 1, 0] },
  { id: "wf10", index: 10, refId: "i1k2m3h4-8j9k-45l0-l317-m62n908i6600", schedule: null,          scheduleOn: false, createdAt: "15 Jan 2026, 07:45 am", createdBy: { initial: "S", email: "surya.patel@idfy.com",    color: "#2ea143" }, jobs: [0, 5, 0, 0, 0] },
];

const classificationWorkflows: WorkflowRow[] = catalogueWorkflows.slice(0, 8).map((w, i) => ({
  ...w,
  id: `clf${i + 1}`,
  index: i + 1,
  refId: w.refId.replace("f79d", "c3a1"),
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

function JobCircle({ count, cls, label }: { count: number; cls: string; label: string }) {
  return (
    <button
      className={`dca-job-circle ${cls}${count === 0 ? " is-zero" : ""}`}
      title={`${label}: ${count} job${count !== 1 ? "s" : ""}`}
      aria-label={`${label}: ${count} jobs`}
    >
      {count}
    </button>
  );
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      className={`dca-toggle${on ? " is-on" : ""}`}
      onClick={() => onChange(!on)}
    />
  );
}

function KebabMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="dca-kebab-wrap" ref={ref}>
      <button className="dca-kebab-btn" onClick={() => setOpen(p => !p)} aria-label="More actions">
        <DotsThreeVertical size={16} weight="bold" />
      </button>
      {open && (
        <div className="dca-kebab-menu">
          <button
            className="dca-kebab-item"
            onClick={() => { onDelete(); setOpen(false); }}
          >
            <Trash size={14} weight="fill" />
            Delete Workflow
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Configure Scan Modal ─────────────────────────────────────────────────────

type RepeatMode = "Daily" | "Weekly" | "Monthly" | "Yearly";

function ConfigureScanModal({
  tabLabel,
  onClose,
}: {
  tabLabel: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"one-time" | "recurring">("one-time");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");
  const [repeat, setRepeat] = useState<RepeatMode>("Weekly");
  const [days, setDays] = useState<string[]>(["Mo"]);

  const dayOptions = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function toggleDay(d: string) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  const cronExpr = mode === "recurring"
    ? (repeat === "Daily"   ? `0 ${hour} * * *`
    :  repeat === "Weekly"  ? `0 ${hour} * * ${days.map(d => dayOptions.indexOf(d)).join(",")}`
    :  repeat === "Monthly" ? `0 ${hour} 1 * *`
    :                         `0 ${hour} 1 1 *`)
    : "";

  const cronHuman = mode === "recurring"
    ? (repeat === "Daily"   ? `Runs every day at ${hour}:${minute} ${ampm}`
    :  repeat === "Weekly"  ? `Runs weekly at ${hour}:${minute} ${ampm}`
    :  repeat === "Monthly" ? `Runs on the 1st of every month at ${hour}:${minute} ${ampm}`
    :                         `Runs once a year at ${hour}:${minute} ${ampm}`)
    : "";

  const canTrigger = mode === "recurring" || date !== "";

  return (
    <div className="dca-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dca-modal">
        <div className="dca-modal-header">
          <h2 className="dca-modal-title">Configure {tabLabel} Scan</h2>
          <button className="dca-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="dca-modal-body">
          {/* Mode toggle */}
          <div className="dca-mode-toggle">
            <button
              className={`dca-mode-btn${mode === "one-time" ? " is-active" : ""}`}
              onClick={() => setMode("one-time")}
            >
              One Time
            </button>
            <button
              className={`dca-mode-btn${mode === "recurring" ? " is-active" : ""}`}
              onClick={() => setMode("recurring")}
            >
              Recurring
            </button>
          </div>

          {mode === "one-time" ? (
            <>
              <div className="dca-field">
                <label className="dca-field-label">Select Date <sup>*</sup></label>
                <input
                  type="date"
                  className="dca-field-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div className="dca-field">
                <label className="dca-field-label">Scan Starts At</label>
                <div className="dca-time-row">
                  <div className="dca-field">
                    <select className="dca-field-select" value={hour} onChange={e => setHour(e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div className="dca-field">
                    <select className="dca-field-select" value={minute} onChange={e => setMinute(e.target.value)}>
                      {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="dca-field">
                    <select className="dca-field-select" value={ampm} onChange={e => setAmpm(e.target.value)}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="dca-recur-section-header">
                  <Clock size={14} />
                  Setup Scan Schedule
                </div>
              </div>
              <div className="dca-field">
                <label className="dca-field-label">Repeat</label>
                <div className="dca-repeat-tabs">
                  {(["Daily", "Weekly", "Monthly", "Yearly"] as RepeatMode[]).map(r => (
                    <button
                      key={r}
                      className={`dca-repeat-tab${repeat === r ? " is-active" : ""}`}
                      onClick={() => setRepeat(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {repeat === "Weekly" && (
                <div className="dca-field">
                  <label className="dca-field-label">Days</label>
                  <div className="dca-day-selector">
                    {dayOptions.map(d => (
                      <button
                        key={d}
                        className={`dca-day-btn${days.includes(d) ? " is-active" : ""}`}
                        onClick={() => toggleDay(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="dca-field">
                <label className="dca-field-label">At</label>
                <div className="dca-time-row">
                  <div className="dca-field">
                    <select className="dca-field-select" value={hour} onChange={e => setHour(e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div className="dca-field">
                    <select className="dca-field-select" value={minute} onChange={e => setMinute(e.target.value)}>
                      {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="dca-field">
                    <select className="dca-field-select" value={ampm} onChange={e => setAmpm(e.target.value)}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="dca-cron-preview">
                <div className="dca-cron-expression">{cronExpr}</div>
                <div className="dca-cron-human">{cronHuman}</div>
              </div>
            </>
          )}
        </div>

        <div className="dca-modal-footer">
          <button className="dc-btn-secondary dc-btn-sm" onClick={onClose}>Cancel</button>
          <button
            className="dc-btn-primary dc-btn-sm"
            disabled={!canTrigger}
            style={{ opacity: canTrigger ? 1 : 0.5, cursor: canTrigger ? "pointer" : "not-allowed" }}
          >
            Trigger Scan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ tabLabel, onClose }: { tabLabel: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="dca-toast">
      <div className="dca-toast-icon">
        <CheckCircle size={12} weight="fill" />
      </div>
      <div className="dca-toast-body">
        <div className="dca-toast-title">{tabLabel} scan has started running</div>
        <div className="dca-toast-msg">Please check the status in the below table.</div>
      </div>
      <button className="dca-toast-close" onClick={onClose} aria-label="Close notification">
        <X size={12} />
      </button>
    </div>
  );
}

// ─── Workflows table ──────────────────────────────────────────────────────────

function WorkflowsTable({
  rows,
  tabLabel,
  onTrigger,
}: {
  rows: WorkflowRow[];
  tabLabel: string;
  onTrigger: () => void;
}) {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    Object.fromEntries(rows.map(r => [r.id, r.scheduleOn]))
  );
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [scanOpen, setScanOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const visible = rows
    .filter(r => !deleted.has(r.id))
    .filter(r => r.refId.includes(search) || r.createdBy.email.includes(search));

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 800);
  }

  function parseCron(expr: string): string {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) return expr;
    const [min, hr, , , dow] = parts;
    const minute = parseInt(min, 10);
    const hour = parseInt(hr, 10);

    let timeStr: string;
    if (hour === 0 && minute === 0) {
      timeStr = "midnight";
    } else if (hour === 12 && minute === 0) {
      timeStr = "noon";
    } else {
      const h = hour % 12 || 12;
      const m = minute === 0 ? "" : `:${String(minute).padStart(2, "0")}`;
      const ampm = hour < 12 ? "AM" : "PM";
      timeStr = `${h}${m} ${ampm}`;
    }

    const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    if (dow === "*") return timeStr === "midnight" ? "Every day at midnight" : `Every day at ${timeStr}`;
    if (dow === "1-5") return `Weekdays at ${timeStr}`;
    if (dow === "0-6") return `Every day at ${timeStr}`;
    const dayIdx = parseInt(dow, 10);
    if (!isNaN(dayIdx) && dayIdx >= 0 && dayIdx <= 6) return `Every ${DAY_NAMES[dayIdx]} at ${timeStr}`;
    return expr;
  }

  return (
    <>
      {scanOpen && (
        <ConfigureScanModal tabLabel={tabLabel} onClose={() => setScanOpen(false)} />
      )}

      {/* Toolbar */}
      <div className="dca-wf-toolbar">
        <div className="dca-wf-search-wrap">
          <span className="dca-wf-search-icon"><MagnifyingGlass size={13} /></span>
          <input
            className="dca-wf-search"
            placeholder={`Search ${tabLabel.toLowerCase()} workflows…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="dca-wf-filter-btn">
          <Funnel size={13} />
          Created At
          <CaretRight size={10} style={{ transform: "rotate(90deg)" }} />
        </button>
        <button className="dca-wf-filter-btn">
          <Funnel size={13} />
          Created By
          <CaretRight size={10} style={{ transform: "rotate(90deg)" }} />
        </button>
        <button
          className="dc-btn-primary dc-btn-sm dca-new-scan-btn"
          onClick={() => setScanOpen(true)}
        >
          + New {tabLabel} Scan
        </button>
      </div>

      {/* Table */}
      <div className="dca-wf-table-wrap">
        <table className="dca-wf-table">
          <thead>
            <tr>
              <th className="dca-col-idx"><div className="dca-wf-th-cell">#</div></th>
              <th className="dca-col-refid"><div className="dca-wf-th-cell">Reference ID</div></th>
              <th className="dca-col-schedule"><div className="dca-wf-th-cell">Schedule</div></th>
              <th className="dca-col-status"><div className="dca-wf-th-cell">Schedule Status</div></th>
              <th className="dca-col-createdat"><div className="dca-wf-th-cell">Created At</div></th>
              <th className="dca-col-createdby"><div className="dca-wf-th-cell">Created By</div></th>
              <th className="dca-col-jobs"><div className="dca-wf-th-cell">Jobs</div></th>
              <th className="dca-col-actions"><div className="dca-wf-th-cell">Actions</div></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr key={row.id}>
                <td className="dca-col-idx" style={{ color: "#6f6f6f", fontSize: "12px" }}>
                  {row.index}
                </td>
                <td className="dca-col-refid">
                  <div className="dca-refid-cell">
                    <span className="dca-refid-text" title={row.refId}>
                      {row.refId.slice(0, 18)}…
                    </span>
                    <button
                      className={`dca-copy-btn${copiedId === row.id ? " is-copied" : ""}`}
                      aria-label="Copy reference ID"
                      onClick={() => handleCopy(row.id, row.refId)}
                    >
                      {copiedId === row.id
                        ? <CheckCircle size={12} weight="fill" />
                        : <Copy size={12} />}
                    </button>
                  </div>
                </td>
                <td className="dca-col-schedule">
                  <div className="dca-schedule-cell">
                    {row.schedule ? (
                      <>
                        <span className="dca-schedule-pill">{row.schedule}</span>
                        <span className="dca-schedule-info-wrap" data-cron-label={parseCron(row.schedule)}>
                          <button className="dca-schedule-info-btn" aria-label="Schedule info">
                            <Info size={13} />
                          </button>
                        </span>
                      </>
                    ) : (
                      <span className="dca-schedule-na">N/A</span>
                    )}
                  </div>
                </td>
                <td className="dca-col-status">
                  <ToggleSwitch
                    on={!!toggleStates[row.id]}
                    onChange={v => setToggleStates(prev => ({ ...prev, [row.id]: v }))}
                  />
                </td>
                <td className="dca-col-createdat" style={{ whiteSpace: "nowrap" }}>
                  {row.createdAt}
                </td>
                <td className="dca-col-createdby">
                  <div className="dca-creator-cell">
                    <span className="dca-creator-avatar">
                      <User size={13} color="#6f6f6f" />
                    </span>
                    <span className="dca-creator-email">{row.createdBy.email}</span>
                  </div>
                </td>
                <td className="dca-col-jobs">
                  <div className="dca-job-circles">
                    <JobCircle count={row.jobs[0]} cls="dca-job-running"   label="Running"   />
                    <JobCircle count={row.jobs[1]} cls="dca-job-completed" label="Completed" />
                    <JobCircle count={row.jobs[2]} cls="dca-job-partial"   label="Partial"   />
                    <JobCircle count={row.jobs[3]} cls="dca-job-failed"    label="Failed"    />
                    <JobCircle count={row.jobs[4]} cls="dca-job-unknown"   label="Unknown"   />
                  </div>
                </td>
                <td className="dca-col-actions">
                  <div className="dca-actions-cell">
                    <button className="dca-trigger-btn" onClick={onTrigger}>
                      Trigger Job
                    </button>
                    <KebabMenu
                      onDelete={() => setDeleted(prev => new Set(prev).add(row.id))}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#6f6f6f" }}>
                  No workflows found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table pagination */}
        <div className="dca-wf-pagination">
          <div className="dca-page-size-wrap">
            Show{" "}
            <select className="dca-page-size-select" defaultValue="10">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>{" "}
            per page
          </div>
          <div className="dca-page-controls">
            <button className="dca-page-btn" disabled={page === 0} onClick={() => setPage(0)} aria-label="First"><CaretDoubleLeft size={10} /></button>
            <button className="dca-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)} aria-label="Prev"><CaretLeft size={10} /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`dca-page-btn${page === i ? " is-active" : ""}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button className="dca-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} aria-label="Next"><CaretRight size={10} /></button>
            <button className="dca-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} aria-label="Last"><CaretDoubleRight size={10} /></button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssetDetailClient({ id }: { id: string }) {
  const meta = assetMeta[id] ?? defaultMeta;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"catalogue" | "classification">("catalogue");
  const [toast, setToast] = useState(false);

  const tabLabel = activeTab === "catalogue" ? "Catalogue" : "Classification";
  const rows = activeTab === "catalogue" ? catalogueWorkflows : classificationWorkflows;

  return (
    <div className="dc-page">
      <DcTopNav isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(p => !p)} />

      {toast && <Toast tabLabel={tabLabel} onClose={() => setToast(false)} />}

      <div className="dca-layout">
        <DcSidebar items={sidebarItems} isOpen={isSidebarOpen} />

        <main className="dca-content-area">
          {/* Breadcrumb */}
          <div className="dca-breadcrumb">
            <a href="/mockups/data-compass/assets" className="dca-breadcrumb-link">
              Assets
            </a>
            <span className="dca-breadcrumb-sep">
              <Caret size={10} />
            </span>
            <span className="dca-breadcrumb-current">{meta.name}</span>
          </div>

          {/* Asset header */}
          <div className="dca-detail-header">
            <div className="dca-asset-identity">
              <div className="dca-asset-detail-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://thesvg.org/icons/postgresql/default.svg" alt="Postgres" width={18} height={18} style={{ display: "block" }} />
              </div>
              <h1 className="dca-asset-detail-name">{meta.name}</h1>
              <span className={`dca-risk-badge dca-risk-${meta.risk.toLowerCase()}`}>
                {meta.risk} Risk
              </span>
            </div>

            {/* Metadata bar */}
            <div className="dca-meta-bar">
              <div className="dca-meta-item">
                <span className="dca-meta-label">Type</span>
                <span className="dca-meta-value">{meta.type}</span>
              </div>
              <div className="dca-meta-item">
                <span className="dca-meta-label">Category</span>
                <span className="dca-meta-value">{meta.category}</span>
              </div>
              <div className="dca-meta-item">
                <span className="dca-meta-label">Environment</span>
                <span className="dca-meta-value">{meta.env}</span>
              </div>
              <div className="dca-meta-item">
                <span className="dca-meta-label">Onboarded</span>
                <span className="dca-meta-value">{meta.onboarded}</span>
              </div>
              <div className="dca-meta-item">
                <span className="dca-meta-label">Domain</span>
                <span className="dca-meta-value">{meta.domain}</span>
              </div>
              <div className="dca-meta-item">
                <span className="dca-meta-label">Subdomain</span>
                <span className="dca-meta-value">{meta.subdomain}</span>
              </div>
              <div className="dca-meta-item">
                <span className="dca-meta-label">Data Plane</span>
                <a href="#" className="dca-meta-link">
                  {meta.dataPlane}
                  <ArrowSquareOut size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="dca-scan-tabs">
            <button
              className={`dca-scan-tab${activeTab === "catalogue" ? " is-active" : ""}`}
              onClick={() => setActiveTab("catalogue")}
            >
              Catalogue
              <span className="dca-tab-badge">
                {meta.catalogueCount}
              </span>
            </button>
            <button
              className={`dca-scan-tab${activeTab === "classification" ? " is-active" : ""}`}
              onClick={() => setActiveTab("classification")}
            >
              Classification
              <span className="dca-tab-badge">
                {meta.classificationCount}
              </span>
            </button>
          </div>

          {/* Workflows table */}
          <WorkflowsTable
            key={activeTab}
            rows={rows}
            tabLabel={tabLabel}
            onTrigger={() => setToast(true)}
          />
        </main>
      </div>
    </div>
  );
}
