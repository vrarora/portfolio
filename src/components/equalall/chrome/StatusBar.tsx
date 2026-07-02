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
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <path
            d="M8 9.5a1.4 1.4 0 1 0 0 1.4 1.4 1.4 0 0 0 0-1.4zM8 9.6a1.3 1.3 0 1 1 0 .01z"
            fill="currentColor"
          />
          <path
            d="M8 10.8L5.7 8.5a3.25 3.25 0 0 1 4.6 0L8 10.8z"
            fill="currentColor"
          />
          <path
            d="M3.9 6.7a5.8 5.8 0 0 1 8.2 0l-1.3 1.3a4 4 0 0 0-5.6 0L3.9 6.7z"
            fill="currentColor"
          />
          <path
            d="M1.5 4.3a9.2 9.2 0 0 1 13 0l-1.3 1.3a7.4 7.4 0 0 0-10.4 0L1.5 4.3z"
            fill="currentColor"
          />
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
