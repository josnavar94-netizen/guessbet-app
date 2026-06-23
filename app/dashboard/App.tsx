'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { modelProbs, bestPick, getH2H, FLAG_CODES, FIXTURES, TOURNAMENTS, ACTIVE_TOURNAMENT } from '@/lib/model';
import CalcTab from './CalcTab';
import PremiumTab from './PremiumTab';
import InstallAppSection from '../InstallApp';

type Tab = 'home' | 'calc' | 'hist' | 'mybet' | 'premium';

function Flag({ name, size = 16 }: { name: string; size?: number }) {
  const code = FLAG_CODES[name];
  if (!code) return null;
  return <img src={`https://flagcdn.com/h${size <= 16 ? 20 : 40}/${code}.png`} alt="" style={{ height: size, width: 'auto', borderRadius: 2, flexShrink: 0, verticalAlign: 'middle' }} />;
}

type DbBet = {
  id: number;
  match_name: string;
  pick_label: string;
  odds: number;
  stake: number;
  ev: number | null;
  bookie: string;
  competition: string;
  match_date: string | null;
  result: 'open' | 'won' | 'lost';
  pl: number;
  created_at: string;
};

export default function App({ username, email, plan }: { username: string; email: string; plan: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('home');
  const [bets, setBets] = useState<DbBet[]>([]);
  const [loadingBets, setLoadingBets] = useState(true);

  // ── Fetch bets ──
  const fetchBets = useCallback(async () => {
    setLoadingBets(true);
    try {
      const res = await fetch('/api/bets');
      const data = await res.json();
      setBets(data.bets || []);
    } catch {}
    setLoadingBets(false);
  }, []);

  useEffect(() => { fetchBets(); }, [fetchBets]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function saveBet(bet: Omit<DbBet, 'id' | 'result' | 'pl' | 'created_at'>) {
    const res = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bet, match_name: bet.match_name, pick_label: bet.pick_label }),
    });
    if (res.ok) { await fetchBets(); setTab('mybet'); }
  }

  async function updateBet(id: number, result: 'won' | 'lost') {
    await fetch(`/api/bets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    });
    await fetchBets();
  }

  async function deleteBet(id: number) {
    if (!confirm('¿Eliminar esta apuesta?')) return;
    await fetch(`/api/bets/${id}`, { method: 'DELETE' });
    await fetchBets();
  }

  const s = {
    page: { display: 'none' } as React.CSSProperties,
    activePage: { display: 'block' } as React.CSSProperties,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ background: 'rgba(17,27,48,.97)', borderBottom: '1px solid rgba(201,168,76,.18)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', paddingTop: 'env(safe-area-inset-top)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
          <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', marginRight: 24, flexShrink: 0 }}>
            <img src="/logo-guessbet.png" alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: '-.02em', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GuessBet</span>
          </button>
          {(['home','calc','hist','mybet','premium'] as Tab[]).map((t) => {
            const labels: Record<Tab,string> = { home: 'Inicio', calc: 'Analizar un partido', hist: 'Resultados pasados', mybet: 'Mis apuestas', premium: 'Premium' };
            return (
              <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #c9a84c' : '2px solid transparent', color: tab === t ? '#c9a84c' : t === 'premium' ? '#c9a84c' : '#7a8aaa', fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: t === 'premium' ? 700 : 500, padding: '14px 12px', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1 }}>
                {t === 'premium' ? '★ Premium' : labels[t]}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#7a8aaa' }}>👤 {username}</span>
            {plan === 'premium' && <span style={{ fontSize: 10, background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>PRO</span>}
            <button onClick={logout} style={{ height: 30, padding: '0 10px', fontSize: 12, background: 'transparent', border: '1px solid rgba(201,168,76,.2)', borderRadius: 7, color: '#7a8aaa', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Salir</button>
          </div>
        </div>
      </nav>

      {/* PAGES */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>
        {tab === 'home' && <HomeTab username={username} setTab={setTab} bets={bets} />}
        {tab === 'calc' && <CalcTab onRegister={saveBet} />}
        {tab === 'hist' && <HistTab />}
        {tab === 'mybet' && <MyBetsTab bets={bets} loading={loadingBets} updateBet={updateBet} deleteBet={deleteBet} />}
        {tab === 'premium' && <PremiumTab plan={plan} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────
function HomeTab({ username, setTab, bets }: { username: string; setTab: (t: Tab) => void; bets: DbBet[] }) {
  const results = TOURNAMENTS[ACTIVE_TOURNAMENT]?.results || [];
  const totalMatches = results.length;
  const totalGoals = results.reduce((s, m) => s + m.gh + m.ga, 0);
  const avgGoals = totalMatches ? (totalGoals / totalMatches).toFixed(2) : '0';
  const homeWins = results.filter(m => m.gh > m.ga).length;
  const draws = results.filter(m => m.gh === m.ga).length;
  const awayWins = results.filter(m => m.gh < m.ga).length;
  const goalCount: Record<number,number> = {};
  results.forEach(m => { const t = m.gh + m.ga; goalCount[t] = (goalCount[t]||0)+1; });
  const maxG = Math.max(...Object.keys(goalCount).map(Number));
  const maxC = Math.max(...Object.values(goalCount));
  const hwP = Math.round(homeWins/totalMatches*100);
  const dwP = Math.round(draws/totalMatches*100);
  const awP = 100-hwP-dwP;
  const closedBets = bets.filter(b => b.result !== 'open');
  const wonBets = closedBets.filter(b => b.result === 'won');
  const wr = closedBets.length ? Math.round(wonBets.length/closedBets.length*100) : null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '2rem 1rem 1.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: 14 }}>⚽ Mundial 2026</div>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(32px,8vw,52px)', lineHeight: 1.08, marginBottom: 16, letterSpacing: '-.03em' }}>
          <span style={{ color: '#f0ece0' }}>La ventaja que el mercado</span><br />
          <span style={{ background: 'linear-gradient(135deg,#e8c96a 0%,#c9a84c 50%,#8a6a1f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>no quiere que tengas.</span>
        </h1>
        <p style={{ fontSize: 16, color: '#7a8aaa', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 28px' }}>
          Ingresa las cuotas de tu casa de apuestas y en segundos sabes si conviene apostar — basado en 20 años de datos reales de fútbol.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('calc')} style={{ height: 48, padding: '0 28px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            Analizar un partido →
          </button>
          <button onClick={() => setTab('mybet')} style={{ height: 48, padding: '0 22px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>
            Mis apuestas {bets.length > 0 && `(${bets.length})`}
          </button>
        </div>
      </div>

      {/* Qué hace GuessBet */}
      <div style={{ margin: '2rem 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.25rem' }}>Qué hace GuessBet</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { icon: '📊', title: 'Calcula la probabilidad real', desc: 'Modelo entrenado con más de 14.000 partidos de los últimos 20 años, ajustado con los resultados reales del Mundial 2026' },
            { icon: '⚖️', title: 'Compara contra tu cuota', desc: 'Comparamos esa probabilidad contra la cuota de tu casa de apuestas y te decimos si hay una ventaja real o no' },
            { icon: '📈', title: 'Registra tu rendimiento', desc: 'Guarda cada apuesta que haces y mide tu ROI, aciertos y racha real con el tiempo' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#7a8aaa', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cómo funciona, paso a paso */}
      <div style={{ margin: '2rem 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.25rem' }}>Cómo se usa</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { icon: '⚽', n: '1', title: 'Elige el partido', desc: 'Selecciona cualquier partido próximo del Mundial 2026, agrupados por fecha' },
            { icon: '💰', n: '2', title: 'Copia la cuota', desc: 'Escribe el número que te ofrece tu casa de apuestas para cada mercado' },
            { icon: '✅', n: '3', title: 'Decide con datos', desc: 'Te mostramos en qué apuestas el modelo cree que tienes ventaja' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 26, color: '#c9a84c', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontWeight: 600, fontSize: 13, margin: '6px 0 5px' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#7a8aaa', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ margin: '2rem 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.2rem' }}>El Mundial en números</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Goles por partido */}
          <div style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', marginBottom: 16 }}>⚽ Goles por partido</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90, paddingTop: 18, position: 'relative' }}>
              {Array.from({ length: Math.min(maxG+1, 8) }, (_, g) => {
                const count = goalCount[g] || 0;
                const pct = maxC > 0 ? (count/maxC)*100 : 0;
                const barH = Math.max(6, pct*0.72);
                const isAvg = g === Math.round(parseFloat(avgGoals));
                return (
                  <div key={g} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -16, fontSize: 9, color: '#7a8aaa', width: '100%', textAlign: 'center' }}>{count || ''}</div>
                    <div style={{ marginTop: 'auto', width: '100%', height: barH, background: isAvg ? 'linear-gradient(180deg,#e8c96a,#c9a84c)' : 'rgba(201,168,76,.2)', borderRadius: '4px 4px 0 0', border: `1px solid ${isAvg ? 'rgba(201,168,76,.5)' : 'rgba(201,168,76,.1)'}` }} />
                    <div style={{ fontSize: 10, color: isAvg ? '#c9a84c' : '#7a8aaa', marginTop: 4 }}>{g}{g===7?'+':''}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#7a8aaa', textAlign: 'center', marginTop: 8 }}>Promedio: <strong style={{ color: '#c9a84c' }}>{avgGoals}</strong> goles/partido</div>
          </div>

          {/* Resultados */}
          <div style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', marginBottom: 12 }}>📈 Resultados</div>
            <div style={{ display: 'flex', gap: 0, height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ flex: hwP, background: 'var(--gn)' }} />
              <div style={{ flex: dwP, background: '#c9a84c' }} />
              <div style={{ flex: awP, background: 'var(--bl, #6b9fd4)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, textAlign: 'center' }}>
              {[{v:homeWins,l:'Local',p:hwP,c:'var(--gn)'},{v:draws,l:'Empate',p:dwP,c:'#c9a84c'},{v:awayWins,l:'Visitante',p:awP,c:'#6b9fd4'}].map((r,i)=>(
                <div key={i}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 24, color: r.c }}>{r.v}</div>
                  <div style={{ fontSize: 10, color: '#7a8aaa' }}>{r.l}</div>
                  <div style={{ fontSize: 10, color: r.c }}>{r.p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tu rendimiento (si tiene apuestas) */}
      {bets.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,var(--sur),rgba(24,34,64,.8))', border: '1px solid rgba(201,168,76,.24)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>📊 Tu rendimiento</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <div><div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 22 }}>{bets.length}</div><div style={{ fontSize: 11, color: '#7a8aaa' }}>Apuestas</div></div>
            <div><div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: wr !== null && wr >= 50 ? 'var(--gn)' : '#d95050' }}>{wr !== null ? wr + '%' : '—'}</div><div style={{ fontSize: 11, color: '#7a8aaa' }}>Aciertos</div></div>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: closedBets.reduce((s,b)=>s+Number(b.pl),0) >= 0 ? 'var(--gn)' : '#d95050' }}>
                {closedBets.length ? (closedBets.reduce((s,b)=>s+Number(b.pl),0) >= 0 ? '+' : '') + closedBets.reduce((s,b)=>s+Number(b.pl),0).toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#7a8aaa' }}>P&L</div>
            </div>
          </div>
        </div>
      )}

      {/* Instala la app */}
      <div style={{ margin: '2.5rem 0 1rem' }}>
        <InstallAppSection />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HIST TAB
// ─────────────────────────────────────────────
function HistTab() {
  const [selectedDate, setSelectedDate] = useState('all');
  const results = TOURNAMENTS[ACTIVE_TOURNAMENT]?.results || [];
  const byDate: Record<string,{d:string,count:number}> = {};
  results.forEach(m => { if(!byDate[m.dateKey])byDate[m.dateKey]={d:m.d,count:0}; byDate[m.dateKey].count++; });
  const dateKeys = Object.keys(byDate).sort((a,b) => b.localeCompare(a));
  const months: Record<string,string> = {'01':'ene','02':'feb','03':'mar','04':'abr','05':'may','06':'jun','07':'jul','08':'ago','09':'sep','10':'oct','11':'nov','12':'dic'};
  const filtered = selectedDate === 'all' ? results : results.filter(m => m.dateKey === selectedDate);

  return (
    <div>
      <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:26, marginBottom:4 }}>Partidos ya jugados</h1>
      <p style={{ fontSize:13, color:'#7a8aaa', marginBottom:'1.5rem' }}>Resultados reales del Mundial 2026</p>
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:'1.25rem', scrollbarWidth:'none' }}>
        {[{key:'all',day:'Todo',month:`${results.length} partidos`,count:0},...dateKeys.map(k=>({key:k,day:k.split('-')[2],month:months[k.split('-')[1]]||'',count:byDate[k].count}))].map(chip => (
          <button key={chip.key} onClick={() => setSelectedDate(chip.key)} style={{ flexShrink:0, background:selectedDate===chip.key?'rgba(201,168,76,.15)':'var(--sur)', border:`1px solid ${selectedDate===chip.key?'rgba(201,168,76,.4)':'rgba(201,168,76,.15)'}`, borderRadius:11, padding:'8px 14px', cursor:'pointer', textAlign:'center', minWidth:60 }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:selectedDate===chip.key?'#c9a84c':'#f0ece0', lineHeight:1 }}>{chip.day}</div>
            <div style={{ fontSize:10, color:'#7a8aaa', marginTop:3 }}>{chip.month}</div>
            {chip.count>0 && <div style={{ fontSize:9, color:'#7a8aaa' }}>{chip.count} partido{chip.count!==1?'s':''}</div>}
          </button>
        ))}
      </div>
      <div>
        {filtered.map((m, i) => (
          <div key={i} style={{ background:'var(--sur)', border:'1px solid rgba(201,168,76,.1)', borderRadius:11, padding:'12px 15px', marginBottom:8, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'#7a8aaa', minWidth:42 }}>{m.d}</span>
            <span style={{ flex:1, fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:7 }}><Flag name={m.h} />{m.h}</span>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:16, color:'#c9a84c', background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.3)', padding:'3px 12px', borderRadius:7, flexShrink:0 }}>{m.gh} - {m.ga}</span>
            <span style={{ flex:1, fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:7, justifyContent:'flex-end' }}>{m.a}<Flag name={m.a} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MY BETS TAB
// ─────────────────────────────────────────────
function MatchTitle({ matchName }: { matchName: string }) {
  const parts = matchName.split(' vs ');
  if (parts.length !== 2) return <>{matchName}</>;
  const [a, b] = parts;
  return <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}><Flag name={a.trim()} />{a} vs <Flag name={b.trim()} />{b}</span>;
}

function MyBetsTab({ bets, loading, updateBet, deleteBet }: { bets: DbBet[]; loading: boolean; updateBet: Function; deleteBet: Function }) {
  const [filter, setFilter] = useState<'all'|'open'|'won'|'lost'>('all');
  const [newBet, setNewBet] = useState({ match:'',pick:'',odds:'',stake:'',bookie:'Coolbet',comp:'Mundial 2026',date:'',ev:'' });
  const [tab, setTab] = useState<'nueva'|'lista'>('lista');

  const closed = bets.filter(b => b.result !== 'open');
  const open = bets.filter(b => b.result === 'open');
  const won = bets.filter(b => b.result === 'won');
  const totalPL = closed.reduce((s,b) => s + Number(b.pl), 0);
  const totalStake = bets.reduce((s,b) => s + Number(b.stake), 0);
  const wr = closed.length ? Math.round(won.length/closed.length*100) : null;
  const roi = totalStake > 0 ? ((totalPL/totalStake)*100).toFixed(1) : null;
  const filtered = filter === 'all' ? bets : bets.filter(b => b.result === filter);

  // Racha actual (recorre desde la apuesta cerrada más reciente hacia atrás)
  const closedDesc = [...closed].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  let streak = 0;
  let streakType: 'won'|'lost'|null = closedDesc[0]?.result === 'lost' ? 'lost' : closedDesc[0]?.result === 'won' ? 'won' : null;
  for (const b of closedDesc) {
    if (b.result === streakType) streak++; else break;
  }

  // Profit acumulado (orden cronológico) para el mini-gráfico
  const closedAsc = [...closed].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  let running = 0;
  const cumulative = closedAsc.map(b => { running += Number(b.pl); return running; });

  const statCard = (label: string, value: string|number, color?: string) => (
    <div style={{ background:'var(--sur)', padding:'10px 12px' }}>
      <div style={{ fontSize:10, color:'#7a8aaa', textTransform:'uppercase', letterSpacing:'.03em', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color: color || '#f0ece0' }}>{value}</div>
    </div>
  );

  if (loading) return <p style={{ color:'#7a8aaa' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:26, marginBottom:4 }}>Mis apuestas</h1>
          <p style={{ fontSize:13, color:'#7a8aaa' }}>Tu historial personal guardado en tu cuenta</p>
        </div>
        <button onClick={() => setTab(tab==='nueva'?'lista':'nueva')} style={{ height:38, padding:'0 14px', background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.3)', color:'#c9a84c', fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, borderRadius:9, cursor:'pointer' }}>
          {tab==='nueva'?'← Ver lista':'+ Anotar apuesta'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(96px,1fr))', gap:1, background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.2)', borderRadius:12, overflow:'hidden', marginBottom:'1.25rem' }}>
        {statCard('Apuestas', bets.length)}
        {statCard('Aciertos', wr !== null ? wr+'%' : '—', wr !== null ? (wr>=50?'#3aae6c':'#d95050') : undefined)}
        {statCard('P&L', closed.length ? (totalPL>=0?'+':'')+totalPL.toFixed(2) : '—', totalPL>=0?'#3aae6c':'#d95050')}
        {statCard('ROI', roi ? (Number(roi)>=0?'+':'')+roi+'%' : '—', roi&&Number(roi)>=0?'#3aae6c':'#d95050')}
        {statCard('Racha', streak > 0 ? `${streak} ${streakType==='won'?'ganadas':'perdidas'}` : '—', streak>0 ? (streakType==='won'?'#3aae6c':'#d95050') : undefined)}
      </div>

      {/* Profit acumulado */}
      {cumulative.length >= 2 && (
        <div style={{ background:'var(--sur)', border:'1px solid rgba(201,168,76,.12)', borderRadius:12, padding:'12px 14px', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:11, color:'#7a8aaa', textTransform:'uppercase', letterSpacing:'.04em' }}>Profit acumulado</span>
            <span style={{ fontSize:10, color: totalPL>=0?'#3aae6c':'#d95050' }}>últimas {cumulative.length}</span>
          </div>
          {(() => {
            const w = 600, h = 70;
            const min = Math.min(0, ...cumulative);
            const max = Math.max(0, ...cumulative);
            const range = max - min || 1;
            const pts = cumulative.map((v, i) => {
              const x = cumulative.length > 1 ? (i / (cumulative.length - 1)) * w : 0;
              const y = h - ((v - min) / range) * h;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');
            const lineColor = totalPL >= 0 ? '#3aae6c' : '#d95050';
            return (
              <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2.5" />
              </svg>
            );
          })()}
        </div>
      )}

      {tab === 'nueva' ? (
        <div style={{ background:'var(--sur)', border:'1px solid var(--b)', borderRadius:12, padding:'1.25rem' }}>
          <div style={{ fontWeight:700, marginBottom:16 }}>Anotar nueva apuesta</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:11, color:'#7a8aaa', display:'block', marginBottom:4 }}>¿Qué partido?</label>
              <input value={newBet.match} onChange={e=>setNewBet({...newBet,match:e.target.value})} placeholder="Ej: Argentina vs Francia" style={{ width:'100%', background:'var(--sur2)', border:'1px solid rgba(201,168,76,.24)', color:'#f0ece0', fontFamily:"'Outfit',sans-serif", fontSize:14, padding:'0 12px', height:42, borderRadius:9 }} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:11, color:'#7a8aaa', display:'block', marginBottom:4 }}>¿Qué apostaste?</label>
              <input value={newBet.pick} onChange={e=>setNewBet({...newBet,pick:e.target.value})} placeholder="Ej: Gana Argentina" style={{ width:'100%', background:'var(--sur2)', border:'1px solid rgba(201,168,76,.24)', color:'#f0ece0', fontFamily:"'Outfit',sans-serif", fontSize:14, padding:'0 12px', height:42, borderRadius:9 }} />
            </div>
            {[{k:'odds',label:'Cuota',ph:'1.42'},{k:'stake',label:'¿Cuánto apostaste?',ph:'10'}].map(f => (
              <div key={f.k}>
                <label style={{ fontSize:11, color:'#7a8aaa', display:'block', marginBottom:4 }}>{f.label}</label>
                <input type="number" step="0.01" value={(newBet as any)[f.k]} onChange={e=>setNewBet({...newBet,[f.k]:e.target.value})} placeholder={f.ph} style={{ width:'100%', background:'var(--sur2)', border:'1px solid rgba(201,168,76,.24)', color:'#f0ece0', fontFamily:"'Outfit',sans-serif", fontSize:14, padding:'0 12px', height:42, borderRadius:9 }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize:11, color:'#7a8aaa', display:'block', marginBottom:4 }}>Casa de apuestas</label>
              <select value={newBet.bookie} onChange={e=>setNewBet({...newBet,bookie:e.target.value})} style={{ width:'100%', background:'var(--sur2)', border:'1px solid rgba(201,168,76,.24)', color:'#f0ece0', fontFamily:"'Outfit',sans-serif", fontSize:14, padding:'0 12px', height:42, borderRadius:9 }}>
                {['Coolbet','Betano','Bet365','Jugabet','1xBet','Otra'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:'#7a8aaa', display:'block', marginBottom:4 }}>Fecha</label>
              <input type="date" value={newBet.date} onChange={e=>setNewBet({...newBet,date:e.target.value})} style={{ width:'100%', background:'var(--sur2)', border:'1px solid rgba(201,168,76,.24)', color:'#f0ece0', fontFamily:"'Outfit',sans-serif", fontSize:14, padding:'0 12px', height:42, borderRadius:9 }} />
            </div>
          </div>
          <button onClick={async()=>{
            if(!newBet.match||!newBet.pick||!newBet.odds||!newBet.stake){alert('Completa partido, apuesta, cuota y monto.');return;}
            // This will be handled by parent via API
            const res = await fetch('/api/bets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({match_name:newBet.match,pick_label:newBet.pick,odds:parseFloat(newBet.odds),stake:parseFloat(newBet.stake),bookie:newBet.bookie,competition:newBet.comp,match_date:newBet.date||null})});
            if(res.ok){setNewBet({match:'',pick:'',odds:'',stake:'',bookie:'Coolbet',comp:'Mundial 2026',date:'',ev:''});setTab('lista');window.location.reload();}
          }} style={{ width:'100%', height:46, background:'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color:'#0a0f1e', fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer' }}>
            + Guardar apuesta
          </button>
        </div>
      ) : (
        <>
          <div style={{ display:'flex', gap:6, marginBottom:'1rem', flexWrap:'wrap' }}>
            {[{k:'all',l:'Todas'},{k:'open',l:'Esperando'},{k:'won',l:'Ganadas'},{k:'lost',l:'Perdidas'}].map(f => (
              <button key={f.k} onClick={()=>setFilter(f.k as any)} style={{ height:32, padding:'0 14px', fontSize:12, fontFamily:"'Outfit',sans-serif", background:filter===f.k?'rgba(201,168,76,.15)':'transparent', border:`1px solid ${filter===f.k?'rgba(201,168,76,.4)':'rgba(201,168,76,.15)'}`, color:filter===f.k?'#c9a84c':'#7a8aaa', borderRadius:20, cursor:'pointer', fontWeight:filter===f.k?600:400 }}>
                {f.l}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#7a8aaa' }}>
              {bets.length === 0 ? 'Todavía no has anotado ninguna apuesta. Usa "+ Anotar apuesta" para empezar.' : 'No hay apuestas con este filtro.'}
            </div>
          ) : filtered.map(b => {
            const bc = b.result==='won'?'#3aae6c':b.result==='lost'?'#d95050':'#c9a84c';
            const pl = Number(b.pl);
            const stake = Number(b.stake);
            const odds = Number(b.odds);
            const potWin = ((odds-1)*stake).toFixed(2);
            return (
              <div key={b.id} style={{ background:'var(--sur)', borderLeft:`3px solid ${bc}`, borderRadius:'0 11px 11px 0', border:'1px solid rgba(201,168,76,.1)', padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}><MatchTitle matchName={b.match_name} /></div>
                    <div style={{ fontSize:11, color:'#7a8aaa', marginTop:2 }}>{b.competition} · {b.bookie}</div>
                  </div>
                  <div style={{ display:'flex', gap:5 }}>
                    {b.result==='open' && <>
                      <button onClick={()=>updateBet(b.id,'won')} style={{ height:26, padding:'0 8px', fontSize:11, borderRadius:6, border:'1px solid rgba(58,174,108,.4)', background:'rgba(58,174,108,.1)', color:'#3aae6c', cursor:'pointer' }}>✓ Gané</button>
                      <button onClick={()=>updateBet(b.id,'lost')} style={{ height:26, padding:'0 8px', fontSize:11, borderRadius:6, border:'1px solid rgba(217,80,80,.3)', background:'rgba(217,80,80,.1)', color:'#d95050', cursor:'pointer' }}>✗ Perdí</button>
                    </>}
                    <button onClick={()=>deleteBet(b.id)} style={{ height:26, padding:'0 8px', fontSize:11, borderRadius:6, border:'1px solid rgba(201,168,76,.15)', background:'transparent', color:'#7a8aaa', cursor:'pointer' }}>🗑</button>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', fontSize:13 }}>
                  <span style={{ fontWeight:500 }}>{b.pick_label}</span>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:'#6b9fd4' }}>@ {odds.toFixed(2)}</span>
                  <span style={{ color:'#7a8aaa' }}>Aposté: {stake}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:`${bc}22`, color:bc }}>
                    {b.result==='won'?'✓ Ganaste':b.result==='lost'?'✗ Perdiste':'⏳ Esperando'}
                  </span>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:bc, marginLeft:'auto' }}>
                    {b.result==='open'?`Podrías ganar +${potWin}`:(pl>=0?'Ganaste +':'Perdiste ')+Math.abs(pl).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
