'use client';

import { useState, useEffect, useRef } from 'react';

const ROWS = [
  { source: 'PostgreSQL', table: 'kyc_records',  field: 'aadhaar_num',   type: 'VARCHAR' },
  { source: 'S3 Bucket',  table: 'documents/',   field: 'pan_card_img',  type: 'BLOB'    },
  { source: 'Snowflake',  table: 'transactions', field: 'account_no',    type: 'BIGINT'  },
  { source: 'MySQL',      table: 'customers',    field: 'phone_number',  type: 'VARCHAR' },
  { source: 'GCS',        table: 'raw_uploads/', field: 'dob_field',     type: 'STRING'  },
  { source: 'PostgreSQL', table: 'audit_log',    field: 'ip_address',    type: 'INET'    },
  { source: 'Databricks', table: 'ml_features',  field: 'credit_score',  type: 'FLOAT'   },
  { source: 'MySQL',      table: 'onboarding',   field: 'address_line1', type: 'TEXT'    },
];

type Row = typeof ROWS[0];
type TypingRow = { source: string; table: string; field: string; type: string };
const COLS: (keyof TypingRow)[] = ['source', 'table', 'field', 'type'];
const TYPING_SPEED = 42;
const ROW_PAUSE = 520;
const MAX_VISIBLE = 9;

const COL = { source: '18%', table: '22%', field: '26%', type: '14%', pii: '14%' } as const;

const mono: React.CSSProperties = { fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.01em' };
const cell: React.CSSProperties = { padding: '0 10px', display: 'flex', alignItems: 'center', flexShrink: 0, overflow: 'hidden' };
const headerCell: React.CSSProperties = { ...cell, fontSize: 9, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' };

function CompletedRow({ row }: { row: Row }) {
  return (
    <div style={{ display: 'flex', height: 28, borderBottom: '1px solid #f0f1f3', alignItems: 'center', flexShrink: 0 }}>
      {COLS.map(col => (
        <div key={col} style={{ ...cell, width: COL[col] }}>
          <span style={{ ...mono, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[col]}</span>
        </div>
      ))}
      <div style={{ ...cell, width: COL.pii, justifyContent: 'center' }}>
        <div style={{ background: '#e5e8ed', borderRadius: 4, padding: '1px 7px', fontSize: 10, color: '#374151', fontWeight: 700, fontFamily: 'monospace', lineHeight: '14px' }}>?</div>
      </div>
    </div>
  );
}

function TypingRowEl({ typing, activeCol }: { typing: TypingRow; activeCol: keyof TypingRow | null }) {
  return (
    <div style={{ display: 'flex', height: 28, borderBottom: '1px solid #f0f1f3', alignItems: 'center', flexShrink: 0, background: '#fafbfc' }}>
      {COLS.map(col => (
        <div key={col} style={{ ...cell, width: COL[col] }}>
          <span style={{ ...mono, color: '#111827', whiteSpace: 'nowrap' }}>
            {typing[col]}{activeCol === col ? '▌' : ''}
          </span>
        </div>
      ))}
      <div style={{ ...cell, width: COL.pii, justifyContent: 'center' }}>
        {typing.source.length > 0 && (
          <div style={{ background: '#e5e8ed', borderRadius: 4, padding: '1px 7px', fontSize: 10, color: '#374151', fontWeight: 700, fontFamily: 'monospace', lineHeight: '14px' }}>?</div>
        )}
      </div>
    </div>
  );
}

export default function DataStreamVisual() {
  const [completed, setCompleted] = useState<Row[]>([]);
  const [typing, setTyping] = useState<TypingRow>({ source: '', table: '', field: '', type: '' });
  const [activeCol, setActiveCol] = useState<keyof TypingRow | null>(null);
  const [unclassified, setUnclassified] = useState(0);

  const rowIdxRef = useRef(0);
  const colIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function tick() {
      const row = ROWS[rowIdxRef.current];
      const col = COLS[colIdxRef.current];
      const target = row[col];
      const charIdx = charIdxRef.current;

      if (charIdx < target.length) {
        setActiveCol(col);
        setTyping(prev => ({ ...prev, [col]: target.slice(0, charIdx + 1) }));
        charIdxRef.current++;
        timerRef.current = setTimeout(tick, TYPING_SPEED);
      } else if (colIdxRef.current < COLS.length - 1) {
        colIdxRef.current++;
        charIdxRef.current = 0;
        timerRef.current = setTimeout(tick, TYPING_SPEED);
      } else {
        // row complete
        const done = ROWS[rowIdxRef.current];
        const nextRowIdx = (rowIdxRef.current + 1) % ROWS.length;
        const isLooping = nextRowIdx === 0;

        setCompleted(prev => isLooping ? [] : [...prev.slice(-(MAX_VISIBLE - 1)), done]);
        setUnclassified(prev => isLooping ? 0 : prev + 1);
        setTyping({ source: '', table: '', field: '', type: '' });
        setActiveCol(null);
        rowIdxRef.current = nextRowIdx;
        colIdxRef.current = 0;
        charIdxRef.current = 0;
        timerRef.current = setTimeout(tick, isLooping ? ROW_PAUSE * 2 : ROW_PAUSE);
      }
    }

    timerRef.current = setTimeout(tick, ROW_PAUSE);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div style={{ background: '#eef0f2', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1.75 / 1', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 7, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.13)', display: 'flex', flexDirection: 'column' }}>
        {/* browser bar */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 10px', height: 26, display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#d4d4d4', display: 'block' }} />)}
          </div>
          <div style={{ background: '#e2e3e5', borderRadius: 3, height: 13, width: '36%', flexShrink: 0 }} />
        </div>

        {/* table shell */}
        <div style={{ flex: 1, background: '#ffffff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* toolbar with counter */}
          <div style={{ padding: '7px 12px', borderBottom: '1px solid #e4e6ea', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ background: '#f4f5f7', borderRadius: 4, height: 20, flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px solid #c0c3c9', flexShrink: 0 }} />
              <div style={{ height: 7, borderRadius: 2, background: '#e5e8ed', width: '28%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: unclassified > 0 ? '#fff7ed' : '#f4f5f7', border: `1px solid ${unclassified > 0 ? '#fed7aa' : '#e4e6ea'}`, borderRadius: 4, padding: '3px 8px', transition: 'all 0.3s ease' }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: unclassified > 0 ? '#c2410c' : '#9ca3af', letterSpacing: '0.04em', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                UNCLASSIFIED PII: {unclassified}
              </span>
            </div>
          </div>

          {/* column headers */}
          <div style={{ display: 'flex', height: 26, borderBottom: '2px solid #e4e6ea', background: '#fafafa', alignItems: 'center', flexShrink: 0 }}>
            {(['source','table','field','type'] as const).map(col => (
              <div key={col} style={{ ...headerCell, width: COL[col] }}>{col}</div>
            ))}
            <div style={{ ...headerCell, width: COL.pii, color: '#374151', fontWeight: 700 }}>PII</div>
          </div>

          {/* rows */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden' }}>
            {completed.map((row, i) => <CompletedRow key={i} row={row} />)}
            <TypingRowEl typing={typing} activeCol={activeCol} />
          </div>
        </div>
      </div>
    </div>
  );
}
