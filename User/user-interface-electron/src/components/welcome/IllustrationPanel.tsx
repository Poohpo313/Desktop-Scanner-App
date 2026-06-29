export function IllustrationPanel() {
  return (
    <aside className="illustration-panel" aria-hidden="true">
      <div className="illustration-panel__glow" />
      <div className="illustration-panel__shape illustration-panel__shape--1" />
      <div className="illustration-panel__shape illustration-panel__shape--2" />
      <div className="illustration-panel__shape illustration-panel__shape--3" />

      <div className="illustration-panel__document">
        <svg
          className="illustration-panel__doc-svg"
          viewBox="0 0 200 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="8" width="184" height="244" rx="16" fill="white" />
          <rect x="8" y="8" width="184" height="244" rx="16" stroke="#14B8A6" strokeWidth="2" />
          <rect x="32" y="40" width="136" height="12" rx="6" fill="#D1FAE5" />
          <rect x="32" y="68" width="120" height="8" rx="4" fill="#E2F0EB" />
          <rect x="32" y="88" width="128" height="8" rx="4" fill="#E2F0EB" />
          <rect x="32" y="108" width="104" height="8" rx="4" fill="#E2F0EB" />
          <rect x="32" y="136" width="136" height="72" rx="10" fill="#F0FBF6" stroke="#BDEAE5" />
          <path
            d="M52 168 L72 188 L108 152"
            stroke="#0F766E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="illustration-panel__badge">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="12" fill="#059669" />
            <path
              d="M7 12.5L10.2 15.5L17 8.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </aside>
  );
}
