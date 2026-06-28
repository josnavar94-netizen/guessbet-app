'use client';

import { LEAGUES } from '@/lib/leagues';

const card: React.CSSProperties = { background: 'var(--sur)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' };
const secTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#7a8aaa', textTransform: 'uppercase' as const, letterSpacing: '.08em', marginBottom: 12 };

export default function LeagueSelector({ league, setLeague }: { league: string; setLeague: (id: string) => void }) {
  return (
    <div style={card}>
      <div style={secTitle}>Liga</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {LEAGUES.map(l => (
          <button
            key={l.id}
            disabled={!l.available}
            onClick={() => l.available && setLeague(l.id)}
            title={l.available ? l.name : `${l.name} — Próximamente`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              minWidth: 96, flexShrink: 0, padding: '10px 12px', borderRadius: 10,
              border: league === l.id ? '1px solid #c9a84c' : '1px solid rgba(201,168,76,.15)',
              background: league === l.id ? 'rgba(201,168,76,.12)' : 'var(--sur2)',
              cursor: l.available ? 'pointer' : 'not-allowed',
              opacity: l.available ? 1 : 0.45,
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            <span style={{ fontSize: 20 }}>{l.flag}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: league === l.id ? '#c9a84c' : '#f0ece0', textAlign: 'center', lineHeight: 1.2 }}>{l.name}</span>
            {!l.available && <span style={{ fontSize: 9, color: '#7a8aaa', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.04em' }}>Próximamente</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
