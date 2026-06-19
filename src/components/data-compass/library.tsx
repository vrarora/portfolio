"use client";

import { ReactNode, useEffect, useState } from "react";
import { MagnifyingGlass, Star, CaretRight, CaretDown } from "@phosphor-icons/react";

export type NavItem = {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  href?: string;
};

export type TreeItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  indent?: number;
  hasChevron?: boolean;
};

export type CardTab = {
  label: string;
  active?: boolean;
};

export type BreadcrumbItem = {
  id?: string;
  label: string;
  href?: string;
};

export type FilterBarTab = {
  label: string;
  count?: number;
  active?: boolean;
};

export type TableColumn = {
  key: string;
  label: string;
  className?: string;
};

export type TableRow = {
  id: string;
  cells: Record<string, ReactNode>;
  onClick?: () => void;
};

export function DcSearchBar() {
  return (
    <div className="dc-search-bar">
      <MagnifyingGlass className="dc-search-icon" size={16} />
      <input
        type="text"
        className="dc-search-input"
        placeholder="Search domains, files, assets..."
      />
      <kbd className="dc-search-shortcut">⌘ + P</kbd>
    </div>
  );
}

export function DcTopNav({
  isSidebarOpen,
  onToggleSidebar,
}: {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}) {
  return (
    <header className="dc-top-nav">
      <div className="dc-nav-left">
        <button
          type="button"
          className="dc-nav-icon-btn"
          aria-label="Toggle navigation"
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6f6f6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="12" height="12" rx="1.5" />
              <path d="M6 2v12" />
              <path d="M10 6l-2 2 2 2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6f6f6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="12" height="12" rx="1.5" />
              <path d="M6 2v12" />
              <path d="M8 6l2 2-2 2" />
            </svg>
          )}
        </button>

        <a href="#" className="dc-nav-brand" aria-label="Catalog home">
          <svg className="dc-brand-logo" width="16" height="17" viewBox="0 0 16 17" fill="none">
            <path d="M8 0.5L0 5.1V11.9L8 16.5L16 11.9V5.1L8 0.5Z" fill="#2272b4" />
            <path d="M8 3.5L2 7.1V12.5L8 16.1L14 12.5V7.1L8 3.5Z" fill="#2272b4" />
          </svg>
          <span className="dc-brand-wordmark">Catalog</span>
        </a>
      </div>

      <div className="dc-nav-search-wrap">
        <DcSearchBar />
      </div>

      <div className="dc-nav-right">
        <button type="button" className="dc-nav-workspace-btn">
          <span className="dc-nav-workspace-label">my_organisation</span>
          <CaretDown size={8} color="#6f6f6f" />
        </button>
        <button type="button" className="dc-nav-icon-btn" aria-label="Notifications">
          <svg width="16" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 1a5 5 0 0 0-5 5v3l-1.5 2H14.5L13 9V6a5 5 0 0 0-5-5ZM6 13a2 2 0 0 0 4 0" stroke="#6f6f6f" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="dc-nav-icon-btn dc-nav-avatar-btn" aria-label="Account menu">
          <span className="dc-nav-avatar">V</span>
        </button>
      </div>
    </header>
  );
}

export function DcSidebar({
  items,
  isOpen = true,
  iconOnly = false,
}: {
  items: NavItem[];
  isOpen?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <aside className={`dc-sidebar${isOpen ? "" : " is-collapsed"}${iconOnly ? " is-icon-only" : ""}`}>
      {items.map((item) => {
        const cls = `dc-sidebar-item${item.active ? " is-active" : ""}`;
        const content = (
          <>
            {item.icon ? <span className="dc-sidebar-icon">{item.icon}</span> : null}
            {!iconOnly && item.label}
          </>
        );
        if (item.href) {
          return (
            <div key={item.label} className="dc-sidebar-item-wrap">
              <a href={item.href} className={cls} aria-label={item.label} title={iconOnly ? item.label : undefined}>
                {content}
              </a>
            </div>
          );
        }
        return (
          <div key={item.label} className="dc-sidebar-item-wrap">
            <button className={cls} type="button" title={iconOnly ? item.label : undefined}>
              {content}
            </button>
          </div>
        );
      })}
    </aside>
  );
}

export function DcCardNav({
  items,
  onSelect,
}: {
  items: TreeItem[];
  onSelect?: (id: string) => void;
}) {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCollapsedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const visibleItems: TreeItem[] = [];
  let currentCollapsedIndent = -1;

  for (const item of items) {
    const indent = item.indent || 0;

    if (currentCollapsedIndent !== -1) {
      if (indent > currentCollapsedIndent) {
        continue;
      }
      currentCollapsedIndent = -1;
    }

    visibleItems.push(item);

    if (item.hasChevron && collapsedMap[item.id]) {
      currentCollapsedIndent = indent;
    }
  }

  return (
    <nav className="dc-card-nav">
      {visibleItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`dc-tree-item${item.active ? " is-active" : ""}`}
          style={{ paddingLeft: `${(item.active ? 5 : 8) + (item.indent || 0) * 24}px` }}
          onClick={() => onSelect?.(item.id)}
        >
          {item.hasChevron ? (
            <span
              className="dc-tree-chevron"
              onClick={(event) => toggleCollapse(item.id, event)}
              role="button"
              tabIndex={0}
              aria-label={collapsedMap[item.id] ? "Expand" : "Collapse"}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleCollapse(item.id, event as unknown as React.MouseEvent);
                }
              }}
            >
              {collapsedMap[item.id] ? <CaretRight size={10} /> : <CaretDown size={10} />}
            </span>
          ) : (
            <span className="dc-tree-chevron-placeholder" />
          )}
          {item.icon ? <span className="dc-tree-icon">{item.icon}</span> : null}
          <span className="dc-tree-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

type DcMainCardProps = {
  title: string;
  navItems: TreeItem[];
  children: ReactNode;
  rightPanel?: ReactNode;
  tabs?: CardTab[];
  breadcrumbs?: BreadcrumbItem[];
  onSelectNavItem?: (id: string) => void;
  onSelectBreadcrumb?: (id: string) => void;
};

export function DcMainCard({
  title,
  navItems,
  children,
  rightPanel,
  tabs,
  breadcrumbs,
  onSelectNavItem,
  onSelectBreadcrumb,
}: DcMainCardProps) {
  return (
    <div className="dc-main-card">
      <div className="dc-main-card-nav">
        <div className="dc-nav-header">
          <span className="dc-nav-header-title">Catalog</span>
          <div className="dc-nav-header-actions">
            <button type="button" className="dc-nav-action-btn-sm" aria-label="Refresh">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6f6f6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.76L13.5 5M13.5 2v3h-3" />
                <path d="M13.5 8a5.5 5.5 0 0 1-8.25 4.76L2.5 11M2.5 14v-3h3" />
              </svg>
            </button>
            <button type="button" className="dc-nav-action-btn-sm" aria-label="Create">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6f6f6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v12M2 8h12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="dc-search-filter-row">
          <div className="dc-tree-search-wrap">
            <input type="text" className="dc-tree-search-input" placeholder="Type to search..." />
            <div className="dc-tree-search-divider" />
            <button type="button" className="dc-tree-filter-btn" aria-label="Filter">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6f6f6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2v4M4 10v4M12 2v2M12 8v6M8 2v8M8 12v2M2 6h4M6 10h4M10 8h4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="dc-tree-nav-container">
          <DcCardNav items={navItems} onSelect={onSelectNavItem} />
        </div>
      </div>

      <div className="dc-main-card-body">
        <div className="dc-card-header">
          <div className="dc-card-breadcrumb">
            {(breadcrumbs?.length ? breadcrumbs : [{ label: title }]).map((item, index, array) => (
              <div key={`${item.label}-${index}`} className="dc-breadcrumb-item">
                {item.id && onSelectBreadcrumb && index < array.length - 1 ? (
                  <button
                    type="button"
                    className="dc-breadcrumb-link dc-breadcrumb-button"
                    onClick={() => onSelectBreadcrumb(item.id!)}
                  >
                    {item.label}
                  </button>
                ) : item.href ? (
                  <a href={item.href} className="dc-breadcrumb-link">
                    {item.label}
                  </a>
                ) : index === array.length - 1 ? (
                  <span className="dc-breadcrumb-current">{item.label}</span>
                ) : (
                  <span className="dc-breadcrumb-link dc-breadcrumb-link-static">{item.label}</span>
                )}
                {index < array.length - 1 ? (
                  <span className="dc-card-breadcrumb-sep">
                    <CaretRight size={10} />
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="dc-card-title-row">
            <div className="dc-card-title-left">
              <h2 className="dc-card-title">{title}</h2>
              <button type="button" className="dc-icon-btn" aria-label="Favorite">
                <Star size={16} />
              </button>
            </div>
            <div className="dc-card-header-actions">
              <button type="button" className="dc-btn-secondary dc-btn-sm">Share</button>
              <button type="button" className="dc-btn-primary dc-btn-sm">
                Create <CaretDown size={10} />
              </button>
            </div>
          </div>
          {tabs?.length ? (
            <div className="dc-card-tabs" role="tablist" aria-label={`${title} sections`}>
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={tab.active ? "true" : "false"}
                  className={`dc-card-tab${tab.active ? " is-active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="dc-card-content">
          <div className="dc-card-content-layout">
            <div className="dc-card-content-main">{children}</div>
            {rightPanel ? <aside className="dc-card-content-side">{rightPanel}</aside> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DcFilterBar({
  placeholder = "Filter tables",
}: {
  placeholder?: string;
}) {
  return (
    <div className="dc-filter-bar">
      <div className="dc-filter-bar-left">
        <label className="dc-filter-search-wrap">
          <span className="dc-filter-search-icon" aria-hidden="true">
            <MagnifyingGlass size={16} />
          </span>
          <input aria-label="Search" className="dc-filter-search" placeholder={placeholder} />
        </label>
      </div>
      <div className="dc-filter-bar-right">
        <button className="dc-filter-action" type="button">
          <span className="dc-filter-action-label-wrap">
            <span className="dc-filter-action-label">Sort</span>
          </span>
          <span className="dc-filter-action-icon-wrap" aria-hidden="true">
            <svg className="dc-filter-action-icon" width="8" height="5" viewBox="0 0 8 5" fill="none">
              <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

export function DcDataTable({
  columns,
  rows,
  emptyState,
  selectedRowId,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  emptyState?: ReactNode;
  selectedRowId?: string;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / 10));
  const visibleRows = rows.slice(page * 10, page * 10 + 10);

  useEffect(() => {
    setPage(0);
  }, [rows]);

  return (
    <div className="dc-table-shell">
      <table className="dc-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                <div className="dc-table-head-cell">
                  <span>{column.label}</span>
                  <span className="dc-table-head-resizer" aria-hidden="true" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.length ? (
            visibleRows.map((row) => (
              <tr
                key={row.id}
                className={`dc-table-row${row.onClick ? " is-clickable" : ""}${selectedRowId === row.id ? " is-selected" : ""}`}
                onClick={row.onClick}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {row.cells[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="dc-table-empty" colSpan={columns.length}>
                {emptyState ?? "No child nodes available."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {rows.length ? (
        <div className="dc-table-pagination" aria-label="Pagination">
          <div className="dc-table-pagination-pages">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`dc-table-page-btn${index === page ? " is-active" : ""}`}
                aria-current={index === page ? "page" : undefined}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="dc-table-page-btn dc-table-page-btn-next"
              disabled={page >= totalPages - 1}
              aria-label="Next page"
              onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
            >
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
