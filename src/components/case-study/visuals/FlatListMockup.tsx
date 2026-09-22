"use client";

import "./flat-list.css";

const G = ({ w = "60%", h = 7, r = 3, mt = 0 }: { w?: string | number; h?: number; r?: number; mt?: number }) => (
  <div style={{ height: h, borderRadius: r, background: "#d9dce3", width: w, marginTop: mt, flexShrink: 0 }} />
);

const GLight = ({ w = "60%", h = 7, r = 3, mt = 0 }: { w?: string | number; h?: number; r?: number; mt?: number }) => (
  <div style={{ height: h, borderRadius: r, background: "#e5e8ed", width: w, marginTop: mt, flexShrink: 0 }} />
);


const FLAT_LIST_CARDS = [
  { title: 52, badge: 48, lines: [72, 88, 55] },
  { title: 38, badge: 52, lines: [80, 60, 90] },
  { title: 61, badge: 44, lines: [68, 75, 50] },
  { title: 44, badge: 56, lines: [90, 55, 78] },
  { title: 57, badge: 40, lines: [62, 84, 58] },
  { title: 35, badge: 60, lines: [76, 65, 82] },
  { title: 66, badge: 46, lines: [58, 92, 48] },
  { title: 42, badge: 50, lines: [85, 70, 63] },
];

export default function FlatListMockup() {
  const cards = [...FLAT_LIST_CARDS, ...FLAT_LIST_CARDS];
  return (
    <div style={{ background: "#eef0f2", borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1.75 / 1", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 7, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.13)", display: "flex", flexDirection: "column" }}>
        {/* browser bar */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "0 10px", height: 26, display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#d4d4d4", display: "block" }} />)}
          </div>
          <div style={{ background: "#e2e3e5", borderRadius: 3, height: 13, width: "36%", flexShrink: 0 }} />
        </div>

        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* icon nav rail */}
          <div style={{ width: 36, background: "#f7f7f7", borderRight: "1px solid #e4e6ea", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10, flexShrink: 0 }}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: i === 0 ? "#2272b4" : "#e8eaed" }} />
            ))}
          </div>

          {/* main content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#f7f7f7" }}>
            {/* toolbar */}
            <div style={{ padding: "8px 12px 7px", background: "#f7f7f7", borderBottom: "1px solid #e4e6ea", flexShrink: 0 }}>
              <div style={{ background: "#f0f1f3", borderRadius: 5, height: 22, marginBottom: 6, display: "flex", alignItems: "center", padding: "0 8px", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "#c8cdd6" }} />
                <GLight w="45%" h={7} />
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{ height: 16, width: 40, borderRadius: 3, border: "1px solid #e2e4e8", background: "#fff" }} />
                ))}
              </div>
            </div>

            {/* scrolling cards */}
            <div style={{ flex: 1, overflowY: "hidden", padding: "12px 10px" }}>
              <div className="flat-list-scroll">
                {cards.map((card, i) => (
                  <div key={i} style={{ background: "#ffffff", borderRadius: 6, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: "#e8eaed", flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <G w={`${card.title}%`} h={8} />
                        <div style={{ height: 14, borderRadius: 4, background: "#e5e8ed", width: card.badge, flexShrink: 0 }} />
                      </div>
                      {card.lines.map((lw, li) => (
                        <GLight key={li} w={`${lw}%`} h={6} mt={li === 0 ? 0 : 4} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
