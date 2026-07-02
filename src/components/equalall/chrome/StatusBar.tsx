"use client";

export function StatusBar() {
  return (
    <div className="ea-status-bar" aria-hidden="true">
      <span className="ea-status-time">9:41</span>
      <span className="ea-status-glyphs">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.8" fill="currentColor" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.8" fill="currentColor" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.8" fill="currentColor" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.8" fill="currentColor" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <path
            d="M1.4 3.9a10.6 10.6 0 0 1 14.2 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M4 6.7a6.9 6.9 0 0 1 9 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M6.6 9.4a3.4 3.4 0 0 1 3.8 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="8.5" cy="11" r="1.1" fill="currentColor" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="3.5"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor" />
          <path
            d="M23.5 4v4a2.2 2.2 0 0 0 0-4z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </span>
    </div>
  );
}
