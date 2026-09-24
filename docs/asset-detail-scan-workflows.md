# Asset Detail — Scan Workflows Flow

**Route:** `/assets/:id`  
**Example:** `/assets/1` → Asset `hr_admin`  
**Entry point:** Reached by hovering a row on the Assets List page (`/assets`) and clicking the **Open** button that appears — see [assets-list.md](./assets-list.md).  
**Flow scope:** Asset detail page covering two scan workflow management tabs — Catalogue and Classification.

---

## 1. Page Structure

### 1.1 Global Shell

| Zone | Component | Data |
|------|-----------|------|
| Left sidebar | Icon-only vertical nav rail | 10 nav items: Explore, DSPM Control Centre, Dashboard, Structured Deep Dive, Assets, All Planes, Lineage, Business Process, Domains, Tag Categories |
| Top bar | App title + global search + user avatar | "Data Compass: Assets" · Search placeholder: "Search Domains, files, assets" |
| Logo | Wordmark "Data / Compass" (stacked two-line) | Top-left, above nav |

### 1.2 Asset Header

**Breadcrumb:**  
`Assets › hr_admin` — "Assets" is a clickable back link.

**Asset Identity Row:**
- Asset icon (database/table glyph) + name: `hr_admin`
- Risk badge: `High Risk` — accent chip in destructive/warning color, rounded pill

**Asset Metadata Bar** (single horizontal row of key-value pairs, pipe-separated):
| Field | Value |
|-------|-------|
| Type | Postgres |
| Category | Database |
| Environment | triton |
| Onboarded | 27 Feb 2026, 03:45 pm |
| Domain | hr.company.com |
| Subdomain | admin |
| Data Plane | IDfy-DP-Beta (with external link icon → "View in All Planes") |

**Design language note:** Render this as a compact metadata strip using muted-foreground labels and foreground values, separated by vertical pipes. The "High Risk" badge should use the destructive accent chip style.

---

## 2. Tab Navigation

Two tabs sit below the asset header, separated by a bottom-border active indicator:

| Tab | Count badge | Active indicator |
|-----|------------|-----------------|
| Catalogue | `10` with orange/warning dot | Blue underline when active |
| Classification | `8` with orange/warning dot | Blue underline when active |

The count badges use a small filled circle dot (warning color) to signal pending/active items. Both tabs render the same table structure — the content and contextual labels adapt per tab (e.g., search placeholder, new scan button label, toast copy).

---

## 3. Scan Workflows Table (shared structure for both tabs)

### 3.1 Toolbar

| Element | Type | Behavior |
|---------|------|----------|
| Search input | Text field | Placeholder: "Search [catalogue/classification] workflows…" · Filters table rows inline |
| Created At | Dropdown filter button | Expandable; filters/sorts by creation date |
| Created By | Dropdown filter button | Expandable; filters by creator |
| + New [Catalogue/Classification] Scan | Primary CTA button | Opens Configure Scan modal |

### 3.2 Table Columns

| Column | Description |
|--------|-------------|
| `#` | Sequential row index |
| Reference ID | Truncated UUID (e.g., `6f56abb5-f79d-48…`) with inline **Copy ID** icon button on hover |
| Schedule | Cron expression in a monospace pill (e.g., `0 9 * * 1`) with info tooltip icon. Rows without a schedule show `N/A` |
| Schedule Status | Toggle switch — enabled (blue, on) = schedule active; disabled (gray, off) = no schedule / inactive. Rows with N/A schedule render the toggle as disabled/non-interactive |
| Created At | Timestamp: `DD Mon YYYY, HH:MM am/pm` · Sortable (up/down sort arrows in header) |
| Created By | Avatar initial chip (colored circle with user's first initial) + truncated email |
| Jobs | 5 status circles, each a clickable button showing a count. Tooltip on hover reveals label (e.g., "Completed: 5 jobs"). Colors map to job states: blue=running, green=completed, orange=partial, red=failed, gray=unknown |
| Actions | "Trigger Job" text link (primary color) + kebab menu (⋮) |

### 3.3 Table Row — Data Example (Row 1)

```
# 1
Reference ID: 6f56abb5-f79d-48… [copy]
Schedule: 0 9 * * 1  [info]   Status: ON
Created At: 28 Feb 2026, 06:19 pm
Created By: V  (user email)
Jobs: [2] [5] [1] [2] [1]
Actions: Trigger Job  ⋮
```

### 3.4 Job Status Circle Semantics

5 circles appear in a fixed order. Based on observed data:
- Circle 1 (blue tint) — Running jobs
- Circle 2 (green tint) — Completed jobs  
- Circle 3 (orange tint) — Partial / in-progress
- Circle 4 (red tint) — Failed jobs
- Circle 5 (gray tint) — Unknown / other

Each circle is a small rounded badge with a count number. Zero counts render with faded/muted style. Hovering shows a tooltip: `"[State]: N jobs"`.

### 3.5 Kebab Menu Actions

Single item visible on expand:
- 🗑 **Delete Workflow** — destructive action (red icon + red text)

### 3.6 Trigger Job Interaction

Clicking "Trigger Job" immediately fires the scan and shows a **toast notification** (top-right, success/green variant):
> **Classification scan has started running**  
> Please check the status in the below table.

The running jobs count in the row increments immediately.

### 3.7 Pagination

Row at bottom:
- "Show `10` per page" — `10` is a dropdown selector for page size
- Pagination controls: `«` first · `‹` prev · current page number (filled blue chip) · `›` next · `»` last

---

## 4. Configure Scan Modal

Triggered by: "+ New Catalogue Scan" or "+ New Classification Scan" button.

**Modal header:** "Configure [Catalogue/Classification] Scan" + `×` close button.

### 4.1 Mode Toggle

Segmented control at the top of the modal:
- **One Time** | **Recurring**

Selected tab is filled (white background with border highlight); unselected is muted/gray.

---

### 4.2 One Time Mode

| Field | Type | Options |
|-------|------|---------|
| Select Date | Date picker input | Calendar icon + "Select date" placeholder · Required (*) |
| Scan Starts At | Time picker | Hour dropdown (01–12) · Minute dropdown (00, 15, 30, 45) · AM/PM dropdown |

**Footer buttons:**
- **Cancel** — outlined/tertiary button, dismisses modal
- **Trigger Scan** — primary button · **Disabled** until a date is selected

---

### 4.3 Recurring Mode

**Section header:** `🕐 Setup Scan Schedule`

| Field | Type | Options |
|-------|------|---------|
| Repeat | Segmented tab group | Daily · Weekly · Monthly · Yearly |
| [Weekly only] Days | Day-of-week selector row | Su · Mo · Tu · We · Th · Fr · Sa (toggle chips) |
| At | Time picker | Hour (01–12) · Minute (00/15/30/45) · AM/PM |
| CRON preview | Read-only text | Auto-generated cron expression (e.g., `0 10 * * *`) |
| Human description | Read-only caption | Plain-English rendering (e.g., "Runs every day at 10:00 AM" / "Runs weekly at 10:00 AM") |

**Footer buttons:**
- **Cancel** — outlined/tertiary
- **Trigger Scan** — primary · **Enabled** (no additional required selection needed beyond defaults)

---

## 5. UX Patterns & Interaction Summary

| Pattern | Description |
|---------|-------------|
| Inline copy | UUID truncation with hover-reveal copy button — avoids clutter while enabling quick clipboard access |
| Schedule toggle | On/off switch directly in table row — no modal needed for enable/disable |
| Zero-state jobs | Faded circle badges when count is 0 — preserves column alignment without visual noise |
| Live feedback | Toast after "Trigger Job" confirms action without navigating away |
| Cron humanization | Recurring modal shows both raw CRON string and human-readable description simultaneously — helps non-technical users understand schedule |
| Required field gating | "Trigger Scan" is disabled until required fields (date for one-time) are filled |
| Contextual labels | Modal title, search placeholder, and CTA button text all adapt to the active tab (Catalogue vs Classification) |
| Risk signaling | "High Risk" badge on asset header gives immediate security context before engaging with scan workflows |

