'use client';

import { useState, useEffect } from 'react';
import { modelProbs, getH2H, MODEL, WC_REAL, FLAG_CODES, overProb } from '@/lib/model';

function Flag({ name, size = 16 }: { name: string; size?: number }) {
  const code = FLAG_CODES[name];
  if (!code) return null;
  const width = Math.round(size * 1.34);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width, height: size, borderRadius: 2, overflow: 'hidden', flexShrink: 0, verticalAlign: 'middle' }}>
      <img src={`https://flagcdn.com/h${size === 16 ? 20 : 40}/${code}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </span>
  );
}

type Bet = { label: string; prob: number; odd: number };

const LEAGUE_AVG = 1.68;

function remainingXG(xgFull: number, minute: number) {
  const rem = Math.max(0, 90 - Math.min(minute, 90)) / 90;
  return xgFull * rem;
}

const RED_ATT = 0.27;
const RED_DEF = 0.22;

function applyRedCards(xgFor: number, xgAgainst: number, ownReds: number, oppReds: number) {
  let adj = xgFor * Math.max(0.15, 1 - RED_ATT * ownReds);
  adj = adj * (1 + RED_DEF * oppReds);
  return Math.max(0.05, adj);
}

function inPlayProbs(xgH: number, xgA: number, min: number, scoreH: number, scoreA: number, redH: number, redA: number) {
  let xgHR = remainingXG(xgH, min);
  let xgAR = remainingXG(xgA, min);
  xgHR = applyRedCards(xgHR, xgAR, redH, redA);
  xgAR = applyRedCards(xgAR, xgHR, redA, redH);
  const poi = (l: number, k: number) => { let p = Math.exp(-l); for (let i = 0; i < k; i++) p *= l / (i + 1); return p; };
  let pH = 0, pD = 0, pA = 0, pO = 0, pB = 0;
  for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) {
    const p = poi(xgHR, i) * poi(xgAR, j);
    const tH = scoreH + i, tA = scoreA + j;
    if (tH > tA) pH += p; else if (tH === tA) pD += p; else pA += p;
    if (tH + tA > 2.5) pO += p;
    if (tH > 0 && tA > 0) pB += p;
  }
  if (scoreH + scoreA > 2) pO = 1;
  if (scoreH > 0 && scoreA > 0) pB = 1;
  return { home: pH, draw: pD, away: pA, over25: pO, under25: 1 - pO, btts: pB, xgHR, xgAR };
}

function eC(mp: number, odd: number | null) {
  if (!odd) return { txt: '—', cls: 'neu', ev: null };
  const e = (mp - 1 / odd) * 100;
  const ev = (mp * odd - 1) * 100;
  return { txt: (e >= 0 ? '+' : '') + e.toFixed(1) + '%', cls: e > 3 ? 'pos' : e < -3 ? 'neg' : 'neu', ev };
}

function defQ(ga: number) { return ga < 1 ? 'sólida' : ga < 1.4 ? 'buena' : ga < 1.8 ? 'media' : 'débil'; }

const inp: React.CSSProperties = { width: '100%', background: 'var(--sur2)', border: '1px solid rgba(201,168,76,.24)', color: '#f0ece0', fontFamily: "'Outfit',sans-serif", fontSize: 14, padding: '0 12px', height: 42, borderRadius: 9 };
const label12: React.CSSProperties = { fontSize: 11, color: '#7a8aaa', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.04em' };
const card: React.CSSProperties = { background: 'var(--sur)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' };
const secTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#7a8aaa', textTransform: 'uppercase' as const, letterSpacing: '.08em', marginBottom: 12 };

export default function CalcTab({ onRegister, locked, onUpgrade }: { onRegister: (bet: any) => void; locked?: boolean; onUpgrade?: () => void }) {
  if (locked) {
    return (
      <div style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Ya usaste tu análisis gratuito de hoy</h1>
        <p style={{ fontSize: 13, color: '#7a8aaa', lineHeight: 1.6, marginBottom: 22 }}>
          Tu plan Free incluye 1 análisis y apuesta por día. Vuelve mañana o hazte PRO para analizar partidos sin límites.
        </p>
        <button onClick={onUpgrade} style={{ height: 48, padding: '0 28px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
          Hazte PRO ahora →
        </button>
      </div>
    );
  }
  return <CalcTabUnlocked onRegister={onRegister} />;
}

type LiveFixture = { h: string; a: string; t: string; group: string; kickoffAt: string | null; live: { minute: number | null; homeGoals: number; awayGoals: number } | null };

// Sin "timeZone" explícito: Intl usa la zona horaria del dispositivo del cliente automáticamente,
// para que cada usuario vea la hora del partido convertida a su propia hora local.
const dayFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', hour12: false });

function CalcTabUnlocked({ onRegister }: { onRegister: (bet: any) => void }) {
  // Próximos partidos leídos en vivo desde /api/fixtures (tabla `matches`), no de un
  // fixture escrito a mano: así nunca muestra partidos ya jugados ni se queda corto
  // cuando avanza el torneo a la siguiente jornada o a eliminatorias.
  const [upcoming, setUpcoming] = useState<LiveFixture[]>([]);
  const [fixturesLoaded, setFixturesLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/fixtures').then(r => r.json()).then(d => {
      const list: LiveFixture[] = (d.fixtures || []).map((f: any) => ({
        h: f.home, a: f.away,
        t: f.kickoffAt ? timeFmt.format(new Date(f.kickoffAt)) : '--:--',
        group: f.kickoffAt ? dayFmt.format(new Date(f.kickoffAt)) : 'Fecha por confirmar',
        kickoffAt: f.kickoffAt,
        live: f.live,
      }));
      setUpcoming(list);
      setFixturesLoaded(true);
      if (list[0]) onFixtureChange(list[0]);
    }).catch(() => setFixturesLoaded(true));
  }, []);
  const upcomingByDay: { day: string; items: { m: LiveFixture; idx: number }[] }[] = [];
  upcoming.forEach((m, idx) => {
    const last = upcomingByDay[upcomingByDay.length - 1];
    if (last && last.day === m.group) last.items.push({ m, idx });
    else upcomingByDay.push({ day: m.group, items: [{ m, idx }] });
  });
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [neutral, setNeutral] = useState(true);
  const [odds, setOdds] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'sec'>('main');
  const [selected, setSelected] = useState<Bet[]>([]);
  const [stake, setStake] = useState('1');
  const [bookie, setBookie] = useState('Coolbet');

  // WC_REAL en vivo, calculado en el servidor desde la tabla `matches` (fallback al estático si falla)
  const [wcRealLive, setWcRealLive] = useState<typeof WC_REAL | null>(null);
  useEffect(() => {
    fetch('/api/wc-real').then(r => r.json()).then(d => setWcRealLive(d.wcReal)).catch(() => {});
  }, []);

  // Cambios de alineación titular vs. el partido anterior de cada equipo en este Mundial
  // (solo si ya hay alineación confirmada del partido elegido, ~30-40 min antes del kickoff).
  const [lineupChanges, setLineupChanges] = useState<{ home: { out: string[]; in: string[] } | null; away: { out: string[]; in: string[] } | null } | null>(null);
  useEffect(() => {
    if (!home || !away) return;
    fetch(`/api/lineup-changes?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}`)
      .then(r => r.json()).then(d => setLineupChanges(d)).catch(() => setLineupChanges(null));
  }, [home, away]);

  // Cuotas reales por casa (Coolbet/1xBet vía The Odds API, Betano vía OddsPapi).
  // Jugabet/Bet365/Otra no tienen cobertura en ninguna API revisada y siguen siempre manuales.
  const BOOKMAKER_KEY: Record<string, string> = { Coolbet: 'coolbet', '1xBet': '1xbet', Betano: 'betano' };
  const [realOdds, setRealOdds] = useState<Record<string, any>>({});
  useEffect(() => {
    fetch('/api/odds').then(r => r.json()).then(d => {
      const map: Record<string, any> = {};
      (d.odds || []).forEach((o: any) => { map[`${o.bookmaker}|${o.home_team}|${o.away_team}`] = o; });
      setRealOdds(map);
    }).catch(() => {});
  }, []);
  // Lista de [nombre de casa, datos] disponibles para este partido (una por cada API que tenga cuota cargada).
  const availableRealOdds = Object.entries(BOOKMAKER_KEY)
    .map(([label, key]) => ({ label, data: realOdds[`${key}|${home}|${away}`] }))
    .filter(r => r.data);
  // Línea de goles distinta a 2.5 (ej. 3.0), cuando la casa elegida no ofrece la de 2.5.
  const [customLine, setCustomLine] = useState<number | null>(null);
  // Qué campos de cuota vienen de una casa real (se pintan distinto a lo tipeado a mano).
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set());
  function useRealOdds(label: string, data: any) {
    const isLine25 = data.total_line == null || Number(data.total_line) === 2.5;
    setCustomLine(isLine25 ? null : Number(data.total_line));
    const filled: Record<string, string> = {
      ...(data.home_odds != null && { home: String(data.home_odds) }),
      ...(data.draw_odds != null && { draw: String(data.draw_odds) }),
      ...(data.away_odds != null && { away: String(data.away_odds) }),
      ...(isLine25 && data.over_odds != null && { over: String(data.over_odds) }),
      ...(isLine25 && data.under_odds != null && { under: String(data.under_odds) }),
      ...(!isLine25 && data.over_odds != null && { overCustom: String(data.over_odds) }),
      ...(!isLine25 && data.under_odds != null && { underCustom: String(data.under_odds) }),
    };
    setOdds(prev => ({ ...prev, ...filled }));
    setAutoFilledKeys(new Set(Object.keys(filled)));
    setBookie(label);
  }

  // Cambia una cuota a mano: deja de marcarse como "de la casa" y se pinta como manual.
  function setOddsField(k: string, v: string) {
    setOdds(prev => ({ ...prev, [k]: v }));
    setAutoFilledKeys(prev => {
      if (!prev.has(k)) return prev;
      const next = new Set(prev);
      next.delete(k);
      return next;
    });
  }
  function oddsInputColor(k: string) {
    if (autoFilledKeys.has(k)) return '#3aae6c';
    if (odds[k]) return '#f0ece0';
    return '#7a8aaa';
  }

  // Live mode
  const [live, setLive] = useState(false);
  const [liveMin, setLiveMin] = useState('');
  const [liveGh, setLiveGh] = useState('');
  const [liveGa, setLiveGa] = useState('');
  const [liveRh, setLiveRh] = useState('0');
  const [liveRa, setLiveRa] = useState('0');
  // Minuto/marcador detectados automáticamente desde API-Football (se pintan verde, igual que las cuotas reales).
  const [liveAutoFilled, setLiveAutoFilled] = useState(false);

  function setLiveField(setter: (v: string) => void, v: string) {
    setter(v);
    setLiveAutoFilled(false);
  }

  function onFixtureChange(m: any) {
    setHome(m.h); setAway(m.a);
    setOdds({}); setResult(null); setSelected([]); setCustomLine(null); setAutoFilledKeys(new Set());
    // Si el partido ya está jugándose (datos de API-Football sincronizados hace menos de 30 min),
    // se activa "En vivo" solo y se prellenan minuto/marcador. Expulsados siguen siendo manuales.
    if (m.live) {
      setLive(true);
      setLiveMin(String(m.live.minute ?? ''));
      setLiveGh(String(m.live.homeGoals ?? 0));
      setLiveGa(String(m.live.awayGoals ?? 0));
      setLiveAutoFilled(true);
    } else {
      setLive(false); setLiveMin(''); setLiveGh(''); setLiveGa('');
      setLiveAutoFilled(false);
    }
    setLiveRh('0'); setLiveRa('0');
  }
  function liveFieldColor(v: string) {
    if (liveAutoFilled) return '#3aae6c';
    if (v) return '#f0ece0';
    return '#7a8aaa';
  }

  function toD(v: string) { const n = parseFloat(v); return (!v || isNaN(n) || n < 1.01) ? null : n; }

  function calc() {
    const wcReal = wcRealLive || WC_REAL;
    const pFull = modelProbs(home, away, neutral, wcReal);
    const mH = MODEL[home], mA = MODEL[away];
    const wcH = wcReal[home], wcA = wcReal[away];
    const hd = getH2H(home, away);
    const min = parseInt(liveMin) || 0;
    const gh = parseInt(liveGh) || 0;
    const ga = parseInt(liveGa) || 0;
    const rh = parseInt(liveRh) || 0;
    const ra = parseInt(liveRa) || 0;
    const p = live ? { ...inPlayProbs(pFull.xgH, pFull.xgA, min, gh, ga, rh, ra), xgH: 0, xgA: 0, eloH: pFull.eloH, eloA: pFull.eloA } : pFull;
    if (live) { p.xgH = (p as any).xgHR; p.xgA = (p as any).xgAR; }
    const dcHomeDraw = p.home + p.draw;
    const dcAwayDraw = p.away + p.draw;
    const dcHomeAway = p.home + p.away;
    const bttsNo = 1 - p.btts;
    const dnbHome = p.home / (p.home + p.away || 1);
    const dnbAway = p.away / (p.home + p.away || 1);
    const eloFav = p.eloH > p.eloA ? home : away;
    const h2hExpl = hd && hd.data && hd.data.n >= 3 ? `Se tomó en cuenta que estos equipos ya se enfrentaron ${hd.data.n} veces antes` : 'No hay suficientes partidos anteriores entre estos dos equipos';
    const xT = p.xgH + p.xgA;
    const co = Math.round(xT * 2.8 + 7);
    const sH = Math.round(p.xgH * 5 + 3);
    const sA = Math.round(p.xgA * 5 + 2);
    const ta = Math.round(xT * 0.8 + 2.5);
    setResult({ p, mH, mA, wcH, wcA, hd, eloFav, h2hExpl, live, lv: { min, gh, ga, rh, ra }, dcHomeDraw, dcAwayDraw, dcHomeAway, bttsNo, dnbHome, dnbAway, sec: { co, sH, sA, ta } });
  }

  function toggleMarket(label: string, prob: number, userOddStr: string, fairOdd: number) {
    const odd = toD(userOddStr) || fairOdd;
    setSelected(prev => prev.find(m => m.label === label) ? prev.filter(m => m.label !== label) : [...prev, { label, prob, odd }]);
  }

  function toggleSecMarket(label: string, prob: number, odd: number) {
    setSelected(prev => prev.find(m => m.label === label) ? prev.filter(m => m.label !== label) : [...prev, { label, prob, odd }]);
  }

  const combOdd = selected.reduce((a, m) => a * m.odd, 1);
  const combProb = selected.reduce((a, m) => a * m.prob, 1);
  const stakeN = parseFloat(stake) || 1;

  async function register() {
    if (!selected.length) return;
    const pickText = selected.length > 1 ? `Combinada (${selected.length}): ${selected.map(m => m.label).join(' + ')}` : selected[0].label;
    const ev = parseFloat(((combProb * combOdd - 1) * 100).toFixed(1));
    await onRegister({ match_name: `${home} vs ${away}`, pick_label: pickText, odds: parseFloat(combOdd.toFixed(2)), stake: stakeN, ev, bookie, competition: 'Mundial 2026', match_date: null });
    setSelected([]);
  }

  const mkts = result ? [
    { label: `Gana ${home} (1)`, prob: result.p.home, oddKey: 'home', team: home },
    { label: 'Empatan (X)', prob: result.p.draw, oddKey: 'draw' },
    { label: `Gana ${away} (2)`, prob: result.p.away, oddKey: 'away', team: away },
    { label: 'Más de 2.5 goles', prob: result.p.over25, oddKey: 'over' },
    { label: 'Menos de 2.5 goles', prob: result.p.under25, oddKey: 'under' },
    { label: 'Ambos equipos anotan', prob: result.p.btts, oddKey: 'btts' },
    { label: 'NO ambos anotan', prob: result.bttsNo, oddKey: 'bttsno' },
    { label: `Gana ${home} o empatan`, prob: result.dcHomeDraw, oddKey: 'dc1x', team: home },
    { label: `Empatan o gana ${away}`, prob: result.dcAwayDraw, oddKey: 'dcx2', team: away },
    { label: `Gana ${home} o gana ${away}`, prob: result.dcHomeAway, oddKey: 'dc12' },
    { label: `Gana ${home} (sin contar empate)`, prob: result.dnbHome, oddKey: 'dnbh', team: home },
    { label: `Gana ${away} (sin contar empate)`, prob: result.dnbAway, oddKey: 'dnba', team: away },
    ...(customLine != null ? [
      { label: `Más de ${customLine} goles`, prob: overProb(result.p.xgH, result.p.xgA, customLine), oddKey: 'overCustom' },
      { label: `Menos de ${customLine} goles`, prob: 1 - overProb(result.p.xgH, result.p.xgA, customLine), oddKey: 'underCustom' },
    ] : []),
  ] : [];

  const secMkts = result ? [
    { label: 'Corners totales', est: result.sec.co, isOver: result.sec.co > 10, pick: `${result.sec.co > 10 ? 'Over' : 'Under'} ${result.sec.co - 2}.5`, fair: 1.85 },
    { label: 'Tarjetas amarillas', est: result.sec.ta, isOver: null, pick: 'Orientativo', fair: null },
    { label: `Tiros a puerta ${home}`, est: result.sec.sH, isOver: result.sec.sH > 4, pick: `${result.sec.sH > 4 ? 'Over' : 'Under'} ${result.sec.sH - 1}.5`, fair: 1.90, team: home },
    { label: `Tiros a puerta ${away}`, est: result.sec.sA, isOver: result.sec.sA > 3, pick: `${result.sec.sA > 3 ? 'Over' : 'Under'} ${result.sec.sA - 1}.5`, fair: 1.90, team: away },
  ] : [];

  const hasOdds = Object.values(odds).some(v => toD(v) !== null);
  const bestEV = result ? Math.max(...mkts.map(m => eC(m.prob, toD(odds[m.oddKey] || '')).ev || -999)) : -999;

  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 6 }}>¿Conviene apostar a este partido?</h1>
      <p style={{ fontSize: 13, color: '#7a8aaa', marginBottom: '1.5rem' }}>Ingresa las cuotas de tu casa y te decimos si hay ventaja.</p>

      {/* PASO 1 — PARTIDO */}
      <div style={card}>
        <div style={secTitle}>1 — Elige el partido</div>
        {fixturesLoaded && upcoming.length === 0 ? (
          <div style={{ fontSize: 13, color: '#7a8aaa', marginBottom: 10 }}>No hay partidos pendientes por ahora. Vuelve cuando se confirme la próxima jornada.</div>
        ) : (
          <select onChange={e => { const m = upcoming[parseInt(e.target.value)]; onFixtureChange(m); }} style={{ ...inp, marginBottom: 10, appearance: 'none' as const }}>
            {upcomingByDay.map((d, gi) => (
              <optgroup key={gi} label={d.day}>
                {d.items.map(({ m, idx }) => (
                  <option key={idx} value={idx}>{m.t} · {m.h} vs {m.a}</option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            {FLAG_CODES[home] && <span style={{ position: 'absolute', left: 10, top: 0, height: 42, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}><Flag name={home} /></span>}
            <input value={home} readOnly style={{ ...inp, paddingLeft: FLAG_CODES[home] ? 38 : 12, cursor: 'default', color: '#f0ece0' }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#7a8aaa' }}>VS</div>
          <div style={{ position: 'relative' }}>
            {FLAG_CODES[away] && <span style={{ position: 'absolute', left: 10, top: 0, height: 42, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}><Flag name={away} /></span>}
            <input value={away} readOnly style={{ ...inp, paddingLeft: FLAG_CODES[away] ? 38 : 12, cursor: 'default', color: '#f0ece0' }} />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#7a8aaa', cursor: 'pointer' }}>
          <input type="checkbox" checked={neutral} onChange={e => setNeutral(e.target.checked)} style={{ accentColor: '#c9a84c' }} />
          Sede neutral
        </label>
      </div>

      {/* PASO 2 — CUOTAS */}
      <div style={card}>
        <div style={secTitle}>2 — Cuotas de tu casa (opcional)</div>
        <p style={{ fontSize: 12, color: '#7a8aaa', marginBottom: 12, lineHeight: 1.6 }}>Una "cuota" es el número que multiplica tu dinero si ganas. Ej: cuota 2.00 con $10 apostados = $20 de vuelta. Déjalo vacío si no tienes.</p>
        {availableRealOdds.length > 0 && !live && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {availableRealOdds.map(({ label, data }) => (
              <button key={label} onClick={() => useRealOdds(label, data)} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center', height: 38, background: 'rgba(58,174,108,.1)', border: '1px solid rgba(58,174,108,.3)', color: '#3aae6c', fontSize: 12, fontWeight: 600, borderRadius: 9, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                ⚡ Usar cuotas reales de {label}
              </button>
            ))}
          </div>
        )}
        {availableRealOdds.length > 0 && !live && (
          <p style={{ fontSize: 11, color: '#7a8aaa', marginBottom: 14, lineHeight: 1.5 }}>
            ⓘ Estas son cuotas <strong>referenciales</strong>, obtenidas vía API desde {availableRealOdds.map(r => r.label).join('/')} y pueden no coincidir al segundo con la cuota en vivo de su página. Si vas a apostar en otra casa (o quieres la cuota exacta del momento), ingrésala manualmente abajo.
          </p>
        )}
        {availableRealOdds.length > 0 && live && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginBottom: 14, background: 'rgba(217,80,80,.08)', border: '1px solid rgba(217,80,80,.2)', color: '#7a8aaa', fontSize: 11, borderRadius: 9, padding: '8px 12px', lineHeight: 1.5 }}>
            ⚠️ Las cuotas reales que tenemos son de antes de que empezara el partido — no se actualizan en vivo, así que no las mostramos aquí para no confundirte.
          </div>
        )}
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', textTransform: 'uppercase', marginBottom: 6 }}>¿Quién gana el partido?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {[['home', `Gana ${home}`, home], ['draw', 'Empatan', null], ['away', `Gana ${away}`, away]].map(([k, ph, team]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 9, padding: '6px 10px' }}>
              <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{team && <Flag name={team} />}{ph}</span>
              <input type="number" step="0.01" placeholder="–" value={odds[k as string] || ''} onChange={e => setOddsField(k as string, e.target.value)} style={{ ...inp, width: 80, textAlign: 'center', flex: 'none', color: oddsInputColor(k as string), fontWeight: autoFilledKeys.has(k as string) ? 700 : 400 }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', textTransform: 'uppercase', marginBottom: 6 }}>¿Cuántos goles habrá?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {[['over', 'Más de 2.5 goles'], ['under', 'Menos de 2.5 goles'], ['btts', 'Ambos anotan']].map(([k, ph]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 9, padding: '6px 10px' }}>
              <span style={{ fontSize: 13 }}>{ph}</span>
              <input type="number" step="0.01" placeholder="–" value={odds[k] || ''} onChange={e => setOddsField(k, e.target.value)} style={{ ...inp, width: 80, textAlign: 'center', flex: 'none', color: oddsInputColor(k), fontWeight: autoFilledKeys.has(k) ? 700 : 400 }} />
            </div>
          ))}
          {customLine != null && [['overCustom', `Más de ${customLine} goles`], ['underCustom', `Menos de ${customLine} goles`]].map(([k, ph]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 9, padding: '6px 10px' }}>
              <span style={{ fontSize: 13 }}>{ph} <span style={{ color: '#7a8aaa', fontSize: 10 }}>(línea real de la casa)</span></span>
              <input type="number" step="0.01" placeholder="–" value={odds[k] || ''} onChange={e => setOddsField(k, e.target.value)} style={{ ...inp, width: 80, textAlign: 'center', flex: 'none', color: oddsInputColor(k), fontWeight: autoFilledKeys.has(k) ? 700 : 400 }} />
            </div>
          ))}
        </div>
        {/* Mercados adicionales */}
        <details style={{ marginBottom: 10 }}>
          <summary style={{ fontSize: 12, color: '#6b9fd4', cursor: 'pointer', marginBottom: 8 }}>▸ Ver más tipos de apuesta (Doble Oportunidad, Sin empate...)</summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {[['bttsno','NO ambos anotan'],['dc1x',`Gana ${home} o empatan`],['dcx2',`Empatan o gana ${away}`],['dc12',`Gana ${home} o ${away}`],['dnbh',`Gana ${home} (sin empate)`],['dnba',`Gana ${away} (sin empate)`]].map(([k,ph]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 9, padding: '6px 10px' }}>
                <span style={{ fontSize: 13 }}>{ph}</span>
                <input type="number" step="0.01" placeholder="–" value={odds[k]||''} onChange={e=>setOddsField(k, e.target.value)} style={{ ...inp, width: 80, textAlign: 'center', flex: 'none', color: oddsInputColor(k) }} />
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* PASO 3 — EN VIVO */}
      <div style={card}>
        <div style={secTitle}>3 — ¿El partido ya empezó? (opcional)</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: live ? 16 : 0 }}>
          <input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} style={{ accentColor: '#d95050', width: 16, height: 16 }} />
          <span style={{ color: live ? '#d95050' : '#7a8aaa', fontWeight: live ? 600 : 400 }}>Sí, el partido se está jugando ahora mismo</span>
        </label>
        {live && upcoming.find(u => u.h === home && u.a === away)?.live && (
          <p style={{ fontSize: 11, color: '#3aae6c', marginTop: 6 }}>⚡ Minuto y marcador detectados automáticamente — puedes ajustarlos si no coinciden. Expulsados siempre se ingresan a mano.</p>
        )}
        {live && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(217,80,80,.2)', borderRadius: 9, padding: '8px 10px', marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>Minuto actual</span>
              <input type="number" value={liveMin} onChange={e=>setLiveField(setLiveMin, e.target.value)} min="1" max="120" placeholder="–" style={{ ...inp, width: 70, textAlign: 'center', flex: 'none', color: liveFieldColor(liveMin), fontWeight: liveAutoFilled ? 700 : 400 }} />
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', textTransform: 'uppercase', marginBottom: 6 }}>Marcador</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 9, padding: '6px 10px' }}>
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>Goles <Flag name={home} />{home}</span>
                <input type="number" value={liveGh} onChange={e=>setLiveField(setLiveGh, e.target.value)} min="0" placeholder="–" style={{ ...inp, width: 70, textAlign: 'center', flex: 'none', color: liveFieldColor(liveGh), fontWeight: liveAutoFilled ? 700 : 400 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 9, padding: '6px 10px' }}>
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>Goles <Flag name={away} />{away}</span>
                <input type="number" value={liveGa} onChange={e=>setLiveField(setLiveGa, e.target.value)} min="0" placeholder="–" style={{ ...inp, width: 70, textAlign: 'center', flex: 'none', color: liveFieldColor(liveGa), fontWeight: liveAutoFilled ? 700 : 400 }} />
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', textTransform: 'uppercase', marginBottom: 6 }}>🟥 Expulsados</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(217,80,80,.18)', borderRadius: 9, padding: '6px 10px' }}>
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Flag name={home} />{home}</span>
                <input type="number" value={liveRh} onChange={e=>setLiveRh(e.target.value)} min="0" max="5" style={{ ...inp, width: 70, textAlign: 'center', flex: 'none' }} placeholder="0" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sur)', border: '1px solid rgba(217,80,80,.18)', borderRadius: 9, padding: '6px 10px' }}>
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Flag name={away} />{away}</span>
                <input type="number" value={liveRa} onChange={e=>setLiveRa(e.target.value)} min="0" max="5" style={{ ...inp, width: 70, textAlign: 'center', flex: 'none' }} placeholder="0" />
              </div>
            </div>

            <div style={{ background: 'rgba(217,80,80,.1)', border: '1px solid rgba(217,80,80,.25)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#7a8aaa' }}>
              ⚡ El análisis tomará en cuenta cuánto tiempo queda, el marcador actual y los expulsados.
            </div>
          </>
        )}
      </div>

      <button onClick={calc} style={{ width: '100%', height: 48, background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: '1.5rem' }}>
        Ver el análisis →
      </button>

      {result && (
        <>
          {/* Edge bar */}
          <div style={{ borderLeft: '3px solid #c9a84c', background: 'rgba(201,168,76,.08)', borderRadius: '0 8px 8px 0', padding: '10px 14px', fontSize: 13, color: '#7a8aaa', marginBottom: '1rem', lineHeight: 1.6 }}>
            {live ? `⚡ Partido en vivo: minuto ${result.lv.min}, van ${result.lv.gh}-${result.lv.ga}. Quedan ~${Math.max(0,90-result.lv.min)} minutos.` :
              !hasOdds ? 'Escribe al menos una cuota arriba para saber si conviene apostar.' :
              bestEV > 5 ? '¡Buena noticia! Encontramos al menos una apuesta donde el modelo cree que tienes ventaja.' :
              'El modelo y la cuota están bastante de acuerdo. No hay una ventaja clara aquí.'}
          </div>

          {/* xG strip */}
          <div style={{ background: 'var(--sur)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            {[{name:home,xg:result.p.xgH},{name:away,xg:result.p.xgA}].map((t,i) => (
              <div key={i}><div style={{fontSize:11,color:'#7a8aaa',display:'flex',alignItems:'center',gap:5}}><Flag name={t.name} size={12} />{t.name}</div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:28,color:'#c9a84c'}}>{t.xg.toFixed(2)}</div><div style={{fontSize:10,color:'#7a8aaa'}}>{live?'goles que le faltan':'goles esperados'}</div></div>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: 11, color: '#7a8aaa', textAlign: 'right' }}>ELO {result.p.eloH.toFixed(0)} vs {result.p.eloA.toFixed(0)}<br/>{neutral?'Sede neutral':'Con ventaja local'}</div>
          </div>

          {/* H2H */}
          {result.hd && result.hd.data && result.hd.data.n >= 1 && (
            <div style={{ background: 'rgba(107,159,212,.07)', border: '1px solid rgba(107,159,212,.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b9fd4', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>🔄 Cuando estos dos equipos jugaron antes</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                {[{l:`${home} ganó`, team: home, v: result.hd.t1First ? result.hd.data.w1 : result.hd.data.l1},{l:'Empates',team:null,v:result.hd.data.d},{l:`${away} ganó`,team:away,v:result.hd.t1First?result.hd.data.l1:result.hd.data.w1},{l:'Total partidos',team:null,v:result.hd.data.n}].map((s,i)=>(
                  <div key={i} style={{background:'rgba(107,159,212,.08)',border:'1px solid rgba(107,159,212,.18)',borderRadius:7,padding:'6px 14px',textAlign:'center', minWidth: '90px'}}>
                    <div style={{fontSize:10,color:'#7a8aaa', marginBottom: 2, whiteSpace: 'nowrap', display:'flex', alignItems:'center', justifyContent:'center', gap:4}}>{s.team && <Flag name={s.team} size={11} />}{s.l}</div>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:18,color:'#6b9fd4'}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,168,76,.15)', marginBottom: '1rem' }}>
            {[['main','Apuestas principales'],['sec','Otras opciones (corners, tarjetas...)']].map(([t,l])=>(
              <button key={t} onClick={()=>setActiveTab(t as any)} style={{background:'none',border:'none',borderBottom:activeTab===t?'2px solid #c9a84c':'2px solid transparent',color:activeTab===t?'#c9a84c':'#7a8aaa',fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:500,padding:'7px 14px 11px',cursor:'pointer',marginBottom:-1,whiteSpace:'nowrap'}}>
                {l}
              </button>
            ))}
          </div>

          {/* Main markets — table (desktop) + stacked cards (mobile) */}
          {activeTab === 'main' && (() => {
            const rows = mkts.map((m, i) => {
              const userOdd = odds[m.oddKey] || '';
              const uOdd = toD(userOdd);
              const fairOdd = m.prob > 0 ? 1 / m.prob : 0;
              const ev = eC(m.prob, uOdd);
              const isSelected = selected.some(s => s.label === m.label);
              const positive = ev.ev !== null && ev.ev > 5;
              return { m, i, userOdd, uOdd, fairOdd, ev, isSelected, positive };
            });
            return (
              <>
                <div className="mkt-table" style={{ background: 'var(--sur)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['','Tipo de apuesta','Probabilidad','Según tu cuota','Diferencia','Cuota justa',''].map((h,hi)=>(
                          <th key={hi} style={{fontSize:10,fontWeight:700,color:'#7a8aaa',textTransform:'uppercase',letterSpacing:'.05em',padding:'8px 10px',borderBottom:'1px solid rgba(201,168,76,.12)',textAlign:'left'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ m, i, userOdd, uOdd, fairOdd, ev, isSelected }) => (
                        <tr key={i} style={{ background: isSelected ? 'rgba(58,174,108,.05)' : 'transparent' }}>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleMarket(m.label, m.prob, userOdd, fairOdd)} style={{ width: 15, height: 15, accentColor: '#3aae6c' }} />
                          </td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontWeight: 500, fontSize: 13 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{(m as any).team && <Flag name={(m as any).team} />}{m.label}</span>
                          </td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontSize: 13 }}>{(m.prob * 100).toFixed(1)}%</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontSize: 13 }}>{uOdd ? ((1 / uOdd) * 100).toFixed(1) + '%' : '—'}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontSize: 13, color: ev.cls === 'pos' ? '#3aae6c' : ev.cls === 'neg' ? '#d95050' : '#7a8aaa', fontWeight: ev.cls !== 'neu' ? 700 : 400 }}>{ev.txt}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#6b9fd4', fontSize: 14 }}>{fairOdd > 0 ? fairOdd.toFixed(2) : '—'}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
                            {ev.ev !== null && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: ev.ev > 5 ? 'rgba(58,174,108,.13)' : 'rgba(201,168,76,.1)', color: ev.ev > 5 ? '#3aae6c' : '#c9a84c' }}>{ev.ev > 5 ? 'Conviene ✓' : 'No conviene'}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mkt-cards" style={{ flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
                  {rows.map(({ m, i, userOdd, uOdd, fairOdd, ev, isSelected, positive }) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: isSelected ? 'rgba(58,174,108,.08)' : 'var(--sur)', border: `1px solid ${isSelected ? 'rgba(58,174,108,.3)' : 'rgba(201,168,76,.12)'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleMarket(m.label, m.prob, userOdd, fairOdd)} style={{ width: 16, height: 16, accentColor: '#3aae6c', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>{(m as any).team && <Flag name={(m as any).team} />}{m.label}</div>
                        <div style={{ fontSize: 10, color: '#7a8aaa', marginTop: 2 }}>
                          Modelo {(m.prob * 100).toFixed(1)}%
                          {uOdd && <> · Tu cuota {((1 / uOdd) * 100).toFixed(1)}%</>}
                          {uOdd && <> · Dif. <span style={{ color: ev.cls === 'pos' ? '#3aae6c' : ev.cls === 'neg' ? '#d95050' : '#7a8aaa', fontWeight: 600 }}>{ev.txt}</span></>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#6b9fd4', fontSize: 14 }}>{fairOdd > 0 ? fairOdd.toFixed(2) : '—'}</div>
                        {ev.ev !== null && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: positive ? 'rgba(58,174,108,.18)' : 'rgba(201,168,76,.1)', color: positive ? '#3aae6c' : '#c9a84c' }}>{ev.txt}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </>
            );
          })()}

          {/* Secondary markets — table (desktop) + stacked cards (mobile) */}
          {activeTab === 'sec' && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, color: '#7a8aaa', marginBottom: 8, lineHeight: 1.5 }}>
                📐 Otras estimaciones del partido — cálculos aproximados, orientativos
              </div>

              <div className="mkt-table" style={{ background: 'var(--sur)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['','De qué se trata','Estimado','Referencia','Lo más probable','Cuota'].map((h,hi)=>(
                        <th key={hi} style={{fontSize:10,fontWeight:700,color:'#7a8aaa',textTransform:'uppercase',letterSpacing:'.05em',padding:'8px 10px',borderBottom:'1px solid rgba(201,168,76,.12)',textAlign:'left'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {secMkts.map((m, i) => {
                      const hasPick = m.isOver !== null;
                      const isSelected = selected.some(s => s.label === m.label + ': ' + m.pick);
                      return (
                        <tr key={i}>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
                            {hasPick && m.fair && <input type="checkbox" checked={isSelected} onChange={() => toggleSecMarket(m.label + ': ' + m.pick, 0.55, m.fair!)} style={{ width: 15, height: 15, accentColor: '#3aae6c' }} />}
                          </td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontSize: 13 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{(m as any).team && <Flag name={(m as any).team} />}{m.label}</span>
                          </td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontSize: 13 }}>{m.est}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)', fontSize: 13, color: '#7a8aaa' }}>~{m.est - 1}</td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: hasPick ? 'rgba(58,174,108,.13)' : 'rgba(201,168,76,.1)', color: hasPick ? '#3aae6c' : '#c9a84c' }}>{m.pick}</span>
                          </td>
                          <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
                            {m.fair ? <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#6b9fd4' }}>{m.fair.toFixed(2)}</span> : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ padding: '10px 14px', fontSize: 11, color: '#7a8aaa' }}>Orientativo.</div>
              </div>

              <div className="mkt-cards" style={{ flexDirection: 'column', gap: 8 }}>
                {secMkts.map((m, i) => {
                  const hasPick = m.isOver !== null;
                  const isSelected = selected.some(s => s.label === m.label + ': ' + m.pick);
                  return (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: isSelected ? 'rgba(58,174,108,.08)' : 'var(--sur)', border: `1px solid ${isSelected ? 'rgba(58,174,108,.3)' : 'rgba(201,168,76,.12)'}`, borderRadius: 10, padding: '10px 12px', cursor: hasPick && m.fair ? 'pointer' : 'default' }}>
                      {hasPick && m.fair ? (
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSecMarket(m.label + ': ' + m.pick, 0.55, m.fair!)} style={{ width: 16, height: 16, accentColor: '#3aae6c', flexShrink: 0 }} />
                      ) : <div style={{ width: 16, flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>{(m as any).team && <Flag name={(m as any).team} />}{m.label}</div>
                        <div style={{ fontSize: 10, color: '#7a8aaa', marginTop: 2 }}>Estimado: {m.est} · referencia ~{m.est - 1}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: hasPick ? 'rgba(58,174,108,.13)' : 'rgba(201,168,76,.1)', color: hasPick ? '#3aae6c' : '#c9a84c' }}>{m.pick}</span>
                        {m.fair && <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: '#6b9fd4', marginTop: 3 }}>{m.fair.toFixed(2)}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explanation panel */}
          <div style={{ background: 'var(--sur2)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 10, padding: '14px 16px', marginBottom: '1rem', fontSize: 12, lineHeight: 1.9 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>🔍 Por qué el modelo piensa esto</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
              {[{name:home,m:result.mH,wc:result.wcH,xg:result.p.xgH},{name:away,m:result.mA,wc:result.wcA,xg:result.p.xgA}].map((t,i)=>(
                <div key={i} style={{background:'var(--sur)',border:'1px solid rgba(201,168,76,.1)',borderRadius:8,padding:'10px 12px'}}>
                  <div style={{fontWeight:600,marginBottom:6,display:'flex',alignItems:'center',gap:6}}><Flag name={t.name} />{t.name}</div>
                  <div style={{fontSize:11,color:'#7a8aaa'}}>Datos: {t.wc&&t.m?'Mundial + histórico':t.wc?'WC real':t.m?'Histórico':'Estimado'}</div>
                  <div style={{fontSize:11,color:'#7a8aaa'}}>Nivel del equipo: <strong style={{color:'#6b9fd4'}}>{t.m?.elo||1500}</strong></div>
                  <div style={{fontSize:11,color:'#7a8aaa'}}>Goles por partido: {t.m?t.m.avgGF.toFixed(2):'—'}</div>
                  <div style={{fontSize:11,color:'#7a8aaa'}}>Goles recibidos: {t.m?t.m.avgGA.toFixed(2)+' ('+defQ(t.m.avgGA)+')':'—'}</div>
                  <div style={{fontSize:12,fontWeight:500,color:'#6b9fd4',marginTop:6}}>Goles esperados hoy: {typeof t.xg==='number'?t.xg.toFixed(2):'—'}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(201,168,76,.1)', paddingTop: 8, color: '#7a8aaa' }}>
              <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>El favorito según el nivel histórico es <strong style={{color:'#6b9fd4',display:'flex',alignItems:'center',gap:5}}><Flag name={result.eloFav} size={13} />{result.eloFav}</strong>.</div>
              <div style={{marginTop:4}}>{result.h2hExpl}.</div>
              {result.live && (result.lv.rh > 0 || result.lv.ra > 0) && (
                <div style={{color:'#d95050',marginTop:4}}>
                  🟥 Expulsados: {result.lv.rh > 0 ? `${home} juega con ${result.lv.rh} jugador${result.lv.rh>1?'es':''} menos` : ''}{result.lv.rh>0&&result.lv.ra>0?' · ':''}{result.lv.ra > 0 ? `${away} juega con ${result.lv.ra} jugador${result.lv.ra>1?'es':''} menos` : ''}.
                </div>
              )}
            </div>
          </div>

          {/* Cambios de alineación */}
          {(lineupChanges?.home || lineupChanges?.away) && (
            <div style={{ background: 'var(--sur2)', border: '1px solid rgba(217,80,80,.2)', borderRadius: 10, padding: '14px 16px', marginBottom: '1rem', fontSize: 12, lineHeight: 1.8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#d95050', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>🔄 Cambios de alineación vs. su partido anterior</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ name: home, c: lineupChanges?.home }, { name: away, c: lineupChanges?.away }].map((t, i) => (
                  <div key={i} style={{ background: 'var(--sur)', border: '1px solid rgba(201,168,76,.1)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Flag name={t.name} />{t.name}</div>
                    {!t.c ? (
                      <div style={{ fontSize: 11, color: '#7a8aaa' }}>Sin alineación previa registrada este Mundial — no hay con qué comparar.</div>
                    ) : t.c.out.length === 0 ? (
                      <div style={{ fontSize: 11, color: '#3aae6c' }}>Mismo 11 titular que la vez anterior.</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: '#d95050', marginBottom: 4 }}>Salen ({t.c.out.length}): {t.c.out.join(', ')}</div>
                        <div style={{ fontSize: 11, color: '#3aae6c' }}>Entran ({t.c.in.length}): {t.c.in.join(', ')}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bet Builder */}
          {selected.length > 0 && (
            <div style={{ background: 'var(--sur)', border: '1px solid rgba(58,174,108,.28)', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700 }}>🎯 Tu apuesta</span>
                <span style={{ fontSize: 11, color: '#7a8aaa' }}>{selected.length} elegida{selected.length !== 1 ? 's' : ''}</span>
              </div>
              {selected.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(201,168,76,.08)', fontSize: 13 }}>
                  <span>{m.label}</span>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#6b9fd4' }}>{m.odd.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 20, margin: '12px 0', flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: 10, color: '#7a8aaa' }}>Cuota combinada</div><div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: '#c9a84c' }}>{combOdd.toFixed(2)}</div></div>
                <div><div style={{ fontSize: 10, color: '#7a8aaa' }}>Probabilidad</div><div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: '#6b9fd4' }}>{(combProb * 100).toFixed(1)}%</div></div>
                <div><div style={{ fontSize: 10, color: '#7a8aaa' }}>Si ganas</div><div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: '#3aae6c' }}>+{((combOdd - 1) * stakeN).toFixed(2)}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                <div>
                  <label style={label12}>¿Cuánto vas a apostar?</label>
                  <input type="number" step="0.1" value={stake} onChange={e => setStake(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={label12}>¿En qué casa?</label>
                  <select value={bookie} onChange={e => setBookie(e.target.value)} style={{ ...inp, appearance: 'none' as const }}>
                    {['Coolbet', 'Betano', 'Bet365', 'Jugabet', '1xBet', 'Otra'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <button onClick={register} style={{ height: 42, padding: '0 16px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c)', color: '#0a0f1e', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 9, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Registrar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
