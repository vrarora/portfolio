import "./playground.css";
import {
  MagnifyingGlass,
  List,
  HardDrives,
  ChartLineUp,
  CaretRight,
  ArrowsDownUp,
  Database,
  Folder,
  File,
  SidebarSimple,
} from "@phosphor-icons/react/dist/ssr";

type Risk = "High" | "Medium" | "Low";

type DomainRow = {
  name: string;
  subdomains: number;
  totalAssets: number;
  risk: Risk;
  createdOn: string;
  source: string;
  overflow: string;
};

const repoTabs = [
  { label: "Overview", icon: HardDrives, active: true },
  { label: "Analytics", icon: ChartLineUp, active: false },
] as const;

const treeItems = [
  "ORGANIZATION_1",
  "DOMAIN_1",
  "DOMAIN_2",
  "DOMAIN_3",
  "ASSET_1",
  "ASSET_2",
] as const;

const domainRows: DomainRow[] = [
  { name: "IDfy", subdomains: 1234, totalAssets: 1234, risk: "High", createdOn: "10-12-2022 12:04 PM", source: "Postgres", overflow: "+5" },
  { name: "Axis Finance Private Limited", subdomains: 1234, totalAssets: 1234, risk: "High", createdOn: "10-12-2022 12:04 PM", source: "GCS", overflow: "+5" },
  { name: "Federal", subdomains: 1234, totalAssets: 1234, risk: "Medium", createdOn: "10-12-2022 12:04 PM", source: "GCS", overflow: "+5" },
  { name: "VS", subdomains: 1234, totalAssets: 1234, risk: "Medium", createdOn: "10-12-2022 12:04 PM", source: "GCS", overflow: "+5" },
  { name: "Privy", subdomains: 1234, totalAssets: 1234, risk: "Low", createdOn: "10-12-2022 12:04 PM", source: "GCS", overflow: "+5" },
];

function RiskPill({ risk }: { risk: Risk }) {
  return <span className={`risk-pill risk-${risk.toLowerCase()}`}>{risk}</span>;
}

export default function PlaygroundPage() {
  return (
    <main className="dc-playground-gh">
      <header className="dc-top-utility">
        <div className="dc-brand-line">
          <List size={18} weight="bold" />
          <strong>Data Browser</strong>
        </div>

        <div className="dc-utility-actions">
          <a href="#">Download</a>
          <a href="#">Support</a>
          <a href="#">Docs</a>
          <button className="dc-avatar-btn" aria-label="Profile">S</button>
        </div>
      </header>

      <nav className="dc-module-tabs" aria-label="Primary sections">
        {repoTabs.map((tab) => (
          <button key={tab.label} className={tab.active ? "active" : ""}>
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="dc-body-grid">
        <aside className="dc-files-pane">
          <header className="dc-files-header">
            <SidebarSimple size={20} weight="duotone" aria-hidden="true" />
            <h2>Files</h2>
          </header>

          <label className="dc-pane-search">
            <MagnifyingGlass size={16} />
            <input type="search" placeholder="Go to file" />
          </label>

          <div className="dc-tree-list">
            <button className="dc-tree-item active">
              <CaretRight size={14} />
              <Folder size={17} weight="duotone" />
              assets
            </button>
            {treeItems.map((item) => (
              <button key={item} className="dc-tree-item">
                <File size={16} />
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="dc-main-pane">
          <div className="dc-subnav-row">
            <a href="#">All Machines</a>
            <span>/</span>
            <strong>10.70.253.121</strong>
          </div>

          <div className="dc-main-toolbar">
            <label className="dc-main-search">
              <MagnifyingGlass size={16} />
              <input type="search" placeholder="Search by name, owner, tag, version..." />
            </label>
          </div>

          <div className="dc-table-wrap">
            <table className="dc-table" aria-label="Domain assets">
              <thead>
                <tr>
                  <th>
                    Domains <ArrowsDownUp size={12} />
                  </th>
                  <th>Subdomains</th>
                  <th>Total Assets</th>
                  <th>Risk Level</th>
                  <th>Type of Data Sources</th>
                  <th>Created On</th>
                </tr>
              </thead>
              <tbody>
                {domainRows.map((row, idx) => (
                  <tr key={`${row.name}-${idx}`} className={idx === 0 ? "selected" : ""}>
                    <td>
                      <a href="#">{row.name}</a>
                    </td>
                    <td>{row.subdomains}</td>
                    <td>{row.totalAssets}</td>
                    <td>
                      <RiskPill risk={row.risk} />
                    </td>
                    <td>
                      <div className="dc-source-cell">
                        <span className="dc-source-pill">
                          <Database size={14} />
                          {row.source}
                        </span>
                        <span className="dc-overflow-pill">{row.overflow}</span>
                      </div>
                    </td>
                    <td>{row.createdOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="dc-table-footer">
            <p>Showing page 1 (rows 1 - 20 out of 46)</p>
            <div className="dc-pagination">
              <button aria-label="Previous page">«</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>…</button>
              <button>10</button>
              <button aria-label="Next page">»</button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}
