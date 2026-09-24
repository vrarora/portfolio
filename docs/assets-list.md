# Assets List Page

**Route:** `/assets`  
**Entry point:** "Assets" nav item in the left sidebar.  
**Next step in flow:** Clicking an asset row navigates to the Asset Detail page → `/assets/:id` (see [asset-detail-scan-workflows.md](./asset-detail-scan-workflows.md))

---

## 1. Page Structure

### 1.1 Global Shell

| Zone | Component | Data |
|------|-----------|------|
| Left sidebar | Icon-only vertical nav rail | 10 nav items: Explore, DSPM Control Centre, Dashboard, Structured Deep Dive, **Assets** (active), All Planes, Lineage, Business Process, Domains, Tag Categories |
| Top bar | App title + global search + user avatar | "Data Compass: Assets" · Search placeholder: "Search Domains, files, assets" |
| Logo | Wordmark "Data / Compass" (stacked two-line) | Top-left, above nav |

---

## 2. Page Header

**Title:** `Assets Overview`  
**Subtitle:** `Summary of all connected assets across your organization`

Both sit in the main content area, above the table section. No actions in the header row itself.

---

## 3. Table Section

### 3.1 Table Header Row

**Left:** `All Data Assets (8)` — section label with total count in parentheses.

**Center:** Search input — placeholder: `Search by name, type, region…` — inline text filter across the table.

**Right (two buttons):**
| Button | Type | Behavior |
|--------|------|----------|
| Filters | Secondary button with filter icon (sliders) | Opens filter dropdown panel (see §4). Active state: button appears outlined/highlighted when filter panel is open |
| + Data Asset | Primary CTA button | Intended to add a new asset (currently a stub — no modal) |

### 3.2 Table Columns

| Column | Sortable | Description |
|--------|----------|-------------|
| Name | Yes (↑↓) | Asset icon (type-specific glyph) + asset name as plain text |
| Type | No | Database/connector type: Postgres, GCS, ElasticSearch, Metabase, Databricks, Snowflake, MySQL |
| Category | No | Always `Cloud` in current data |
| Size | Yes (↑↓) | Storage size: GB / TB / PB units |
| Last Catalogue Scan | Yes (↑↓) | Relative timestamp ("2 hours ago", "24 Nov' 25") or status badge if in-progress |
| Last Classification Scan | Yes (↑↓) | Same format — relative timestamp or status badge |
| Data Plane | No | Colored status dot + data plane name (truncated with `…` if long) |
| Action | No | Delete icon button (destructive red trash icon) |

### 3.3 Table Row Data

| Asset Name | Type | Category | Size | Last Catalogue Scan | Last Classification Scan | Data Plane |
|------------|------|----------|------|---------------------|--------------------------|-----------|
| hr_admin | Postgres | Cloud | 4 TB | 🔄 In Progress | 2 hours ago | 🔴 IDfy-DP-Beta |
| addressify | GCS | Cloud | 164 GB | 24 Nov' 25 | 2 hours ago | 🟢 Axis-DP-Prod |
| acquirze_finance | ElasticSearch | Cloud | 100 TB | 24 Nov' 25 | 2 hours ago | 🟢 Federal-DP-Main |
| syntegrate_marketing | Metabase | Cloud | 1 PB | 18 Jan' 26 | 🔄 In Progress | 🔴 Privy-DP-Core |
| datarize_engineering | Databricks | Cloud | 320 TB | 24 Nov' 25 | 2 hours ago | 🔴 IDfy-DP-Alpha |
| addressify_product | Snowflake | Cloud | 600 TB | 24 Nov' 25 | 2 hours ago | 🟢 Acme-DP-Prod |
| addressify_hr | MySQL | Cloud | 169 GB | 24 Nov' 25 | ⊗ Failed | 🔴 Soylent-DP-Prod |
| addressify_tech | Postgres | Cloud | 24 TB | 24 Nov' 25 | 2 hours ago | 🟢 VS-DP-Primary |

### 3.4 Scan Status Indicators

Used in Last Catalogue Scan and Last Classification Scan columns:

| State | Visual | Color |
|-------|--------|-------|
| In Progress | Spinning sun/radial icon + "In Progress" text | Orange/warning |
| Failed | Circle with X icon + "Failed" text | Red/destructive |
| Completed (relative) | Plain text: "2 hours ago" / "24 Nov' 25" | Default foreground |

### 3.5 Data Plane Status Dot

A small filled circle precedes the data plane name. Colors:
- **Red/orange dot** — plane has issues or is in a degraded state
- **Green dot** — plane is healthy/active

### 3.6 Row Hover State

On hover, the row reveals additional controls inline:
- **Open** button — appears as a secondary/ghost button within the Name cell area — clicking it navigates to the Asset Detail page (`/assets/:id`)
- **View** button — appears in the Data Plane cell on hover — behavior: likely navigates to the data plane detail

This means the primary navigation trigger to the Asset Detail is the **hover → Open** button on a row, not a click on the entire row.

### 3.7 Delete Action

A red trash icon appears in the Action column for every row. Behavior: deletes the asset (likely with a confirmation step — not yet captured).

---

## 4. Filters Panel

Triggered by the **Filters** button. Opens as a dropdown/popover anchored to the Filters button.

**Panel header:** `Filter by`

| Filter | Type | Default |
|--------|------|---------|
| Type | Dropdown select | All |
| Health | Dropdown select | All |

**Footer of panel:**
- Result count: `8 results found` (updates dynamically as filters change)
- **Apply** button — primary, applies active filter selections to the table

Closing the panel (clicking outside or pressing Filters again) dismisses without applying changes.

---

## 5. Pagination

Located at the bottom of the page.

| Control | Description |
|---------|-------------|
| Show `25` per page | Dropdown to change page size (25 is default) |
| `«` | Jump to first page |
| `‹` | Previous page |
| Page numbers | `1` (current, filled primary chip) · `2` · `…` · `10` |
| `›` | Next page |
| `»` | Jump to last page |

---

## 6. UX Patterns & Interaction Summary

| Pattern | Description |
|---------|-------------|
| Row-level navigation | Asset detail is accessed via hover-reveal "Open" button on a row — not a full-row click target |
| Inline scan status | Scan states (in-progress, failed, completed) are surfaced directly in the table without requiring drill-down |
| Data plane health dot | Quick visual health signal for each asset's data plane without needing to leave the list |
| Filter panel | Lightweight popover with result count preview before applying — prevents blank-state surprises |
| Type-specific icons | Each asset has a distinct icon (Postgres elephant, GCS cloud, ElasticSearch stacked layers, etc.) — aids quick identification in the list |
| Destructive action surfaced | Delete icon always visible in the Action column — not hidden behind a menu (unlike the workflow table's kebab) |
| Asset count in title | "All Data Assets (8)" keeps the user oriented on total scope while filtering/searching |
