// app/dashboard/CalcPage.tsx
// This component injects the full HTML calc page directly for 100% feature parity
'use client';
import { useEffect, useRef } from 'react';

const CALC_HTML = `<div class="wrap" style="max-width:780px;">
  <div style="margin-bottom:1.5rem;">
    <div style="font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--am);text-transform:uppercase;margin-bottom:6px;">⚙️ Analiza un partido</div>
    <h1 style="font-size:22px;margin-bottom:6px;">¿Conviene apostar a este partido?</h1>
    <p style="font-size:13px;color:var(--mu);line-height:1.6;">Elige un partido, escribe las cuotas que te ofrece tu casa de apuestas, y te decimos si el modelo cree que tienes ventaja o no.</p>
  </div>
  <div class="card" style="font-size:12px;color:var(--mu);line-height:1.9;margin-bottom:1rem;">
    <strong style="color:var(--tx);">¿En qué se basa esto?</strong><br>
    📊 Más de <strong style="color:var(--tx);">14.000 partidos de fútbol</strong> jugados en los últimos 20 años (mundiales, eliminatorias, amistosos, etc., cada uno cuenta según su importancia)<br>
    📡 Los <strong style="color:var(--tx);">resultados reales que ya van</strong> en este Mundial 2026<br>
    🔄 <strong style="color:var(--tx);">Partidos anteriores entre los mismos dos equipos</strong>, cuando hay suficiente historial entre ellos
  </div>

  <div class="card">
    <div class="sec">1 — Elige el partido</div>
    <select class="fsel" id="fsel" onchange="onFC()" style="margin-bottom:10px;"></select>
    <div style="display:grid;grid-template-columns:1fr 32px 1fr;gap:6px;align-items:center;margin-bottom:8px;">
      <div class="fg"><label id="lh">Equipo local</label><input type="text" id="th" value="Iraq"/></div>
      <div style="text-align:center;font-size:11px;font-weight:600;color:var(--mu);padding-top:18px;">VS</div>
      <div class="fg"><label id="la">Equipo visitante</label><input type="text" id="ta" value="Norway"/></div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mu);">
      <input type="checkbox" id="neutral" checked style="width:14px;height:14px;accent-color:var(--am);"/>
      <label for="neutral">Sede neutral</label>
      <span style="font-size:11px;color:var(--mu2);background:var(--b);padding:2px 8px;border-radius:20px;margin-left:4px;" id="stad">Gillette, Boston</span>
    </div>
  </div>

  <div class="card">
    <div class="sec">Paso 2 — Copia las cuotas desde tu casa de apuestas</div>
    <p style="font-size:12px;color:var(--mu);margin-bottom:12px;line-height:1.6;">
      Una "cuota" es el número que multiplica tu dinero si ganas la apuesta. Por ejemplo, si apuestas $10 con una cuota de 2.00, ganarías $20 en total. Busca estos números en la app o web donde apuestas, y escríbelos aquí (puedes dejar vacíos los que no encuentres).
    </p>
    <div style="display:flex;gap:5px;margin-bottom:10px;">
      <button class="active" id="fmt-dec" onclick="setFmt('decimal',this)" style="height:28px;padding:0 12px;font-size:12px;border-radius:20px;background:var(--adim);border-color:var(--abr);color:var(--am);">Formato decimal (ej. 1.91)</button>
      <button id="fmt-am" onclick="setFmt('american',this)" style="height:28px;padding:0 12px;font-size:12px;border-radius:20px;">Formato americano (ej. -110)</button>
    </div>

    <div style="font-size:11px;font-weight:600;color:var(--mu);text-transform:uppercase;margin:10px 0 6px;">¿Quién gana el partido?</div>
    <div class="g3">
      <div class="fg"><label id="l1">Gana Iraq</label><input type="number" id="oh" placeholder="ej. 3.80" step="0.01"/></div>
      <div class="fg"><label>Empatan</label><input type="number" id="od" placeholder="ej. 3.50" step="0.01"/></div>
      <div class="fg"><label id="l2">Gana Norway</label><input type="number" id="oa" placeholder="ej. 1.85" step="0.01"/></div>
    </div>

    <div style="font-size:11px;font-weight:600;color:var(--mu);text-transform:uppercase;margin:14px 0 6px;">¿Cuántos goles habrá en total?</div>
    <div class="g3">
      <div class="fg"><label>Más de 2.5 goles</label><input type="number" id="oo" placeholder="ej. 1.90" step="0.01"/></div>
      <div class="fg"><label>Menos de 2.5 goles</label><input type="number" id="ou" placeholder="ej. 1.80" step="0.01"/></div>
      <div class="fg"><label>Ambos equipos anotan</label><input type="number" id="ob" placeholder="ej. 1.95" step="0.01"/></div>
    </div>

    <button type="button" onclick="toggleExtraMarkets()" id="extra-toggle" style="background:none;border:none;color:var(--bl);font-size:12px;cursor:pointer;padding:4px 0;margin:10px 0 8px;display:flex;align-items:center;gap:4px;">
      <span id="extra-arrow">▸</span> Ver más tipos de apuesta (opcional)
    </button>
    <div id="extra-markets" class="hidden">
      <p style="font-size:12px;color:var(--mu);margin-bottom:10px;line-height:1.6;">
        Estas son formas alternativas de apostar al mismo partido. No es necesario llenarlas — solo hazlo si tu casa de apuestas las ofrece y te interesan.
      </p>
      <div style="font-size:11px;font-weight:600;color:var(--mu);text-transform:uppercase;margin-bottom:6px;">¿Ningún equipo anota? (lo contrario a "ambos anotan")</div>
      <div class="g3" style="margin-bottom:14px;">
        <div class="fg"><label>NO ambos anotan</label><input type="number" id="obn" placeholder="ej. 1.41" step="0.01"/></div>
      </div>
      <div style="font-size:11px;font-weight:600;color:var(--mu);text-transform:uppercase;margin-bottom:6px;">Te devuelven el dinero si hay empate (apuesta más segura, paga menos)</div>
      <div class="g3" style="margin-bottom:14px;">
        <div class="fg"><label id="lbl-dnbh">Gana Local (sin contar empate)</label><input type="number" id="odnbh" placeholder="ej. 1.06" step="0.01"/></div>
        <div class="fg"><label id="lbl-dnba">Gana Visitante (sin contar empate)</label><input type="number" id="odnba" placeholder="ej. 19.50" step="0.01"/></div>
      </div>
      <div style="font-size:11px;font-weight:600;color:var(--mu);text-transform:uppercase;margin-bottom:6px;">Aciertas si pasa cualquiera de estas dos cosas (más fácil de ganar, paga menos)</div>
      <div class="g3" style="margin-bottom:8px;">
        <div class="fg"><label id="lbl-dc1x">Gana Local o empatan</label><input type="number" id="odc1x" placeholder="ej. 1.06" step="0.01"/></div>
        <div class="fg"><label id="lbl-dcx2">Empatan o gana Visitante</label><input type="number" id="odcx2" placeholder="ej. 7.80" step="0.01"/></div>
        <div class="fg"><label id="lbl-dc12">Gana Local o gana Visitante (no hay empate)</label><input type="number" id="odc12" placeholder="ej. 1.06" step="0.01"/></div>
      </div>
    </div>

    <button class="btn-am" onclick="runCalc()" style="width:100%;margin-top:6px;">Ver resultado del análisis</button>
  </div>

  <div class="card" id="live-card">
    <div class="ctit"><span class="n" style="background:rgba(239,68,68,.2);color:var(--rd);">●</span> ¿El partido ya empezó? <span style="font-size:10px;font-weight:400;color:var(--mu);margin-left:6px;">Opcional — esto recalcula todo según cómo va el partido en este momento</span></div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <input type="checkbox" id="live-toggle" onchange="toggleLive()" style="width:15px;height:15px;accent-color:var(--rd);" />
      <label for="live-toggle" style="font-size:13px;color:var(--mu);cursor:pointer;">Sí, el partido se está jugando ahora mismo</label>
    </div>
    <div id="live-fields" class="hidden">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
        <div class="fg">
          <label>¿En qué minuto va?</label>
          <input type="number" id="live-min" placeholder="ej. 67" min="1" max="120" value="45" />
        </div>
        <div class="fg">
          <label id="live-lbl-h">Goles local</label>
          <input type="number" id="live-gh" value="0" min="0" max="20" />
        </div>
        <div class="fg">
          <label id="live-lbl-a">Goles visitante</label>
          <input type="number" id="live-ga" value="0" min="0" max="20" />
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div class="fg">
          <label id="live-lbl-rh">🟥 ¿Expulsaron a algún jugador del equipo local?</label>
          <input type="number" id="live-rh" value="0" min="0" max="5" placeholder="0 si no hay" />
        </div>
        <div class="fg">
          <label id="live-lbl-ra">🟥 ¿Expulsaron a algún jugador del equipo visitante?</label>
          <input type="number" id="live-ra" value="0" min="0" max="5" placeholder="0 si no hay" />
        </div>
      </div>
      <div style="background:var(--rdim);border:1px solid var(--rbr);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--mu);display:flex;align-items:center;gap:8px;">
        <span style="color:var(--rd);font-size:14px;">⚡</span>
        Al llenar esto, el análisis toma en cuenta cuánto tiempo queda, cómo va el marcador, y si algún equipo tiene menos jugadores en la cancha.
      </div>
    </div>
  </div>

  <div id="res" class="hidden">
    <div id="explanation"></div>
    <div class="h2h-box hidden" id="h2hbox">
      <div class="h2h-title">🔄 Cuando estos dos equipos jugaron antes</div>
      <div class="h2h-row" id="h2hrow"></div>
    </div>
    <div class="xg-strip">
      <div class="xgt"><div class="xn" id="xnh"></div><div class="xv" id="xvh">—</div><div style="font-size:10px;color:var(--mu);margin-top:2px;" id="xg-label-h">goles que se espera que marque</div></div>
      <div style="font-size:13px;color:var(--mu);">vs</div>
      <div class="xgt"><div class="xn" id="xna"></div><div class="xv" id="xva">—</div><div style="font-size:10px;color:var(--mu);margin-top:2px;" id="xg-label-a">goles que se espera que marque</div></div>
      <div style="margin-left:auto;font-size:11px;color:var(--mu);" id="slbl"></div>
      <div id="dsrc" style="font-size:11px;"></div>
    </div>
    <div class="edge-bar" id="enote"></div>
    <p style="font-size:12px;color:var(--mu);margin:0 0 10px;line-height:1.6;">
      Marca la casilla junto a cualquier apuesta que te interese. Puedes elegir solo una, o combinar varias para armar una sola apuesta (esto se llama "combinada": todas tienen que cumplirse para ganar, pero el premio es más grande).
    </p>
    <div class="tabs">
      <button class="tab active" onclick="setRT('main',this)">Apuestas principales</button>
      <button class="tab" onclick="setRT('sec',this)">Otras opciones (corners, tarjetas...)</button>
    </div>
    <div class="card" id="tmain" style="padding:0;overflow:hidden;">
      <table class="mt"><thead><tr><th style="width:24px;"></th><th>Tipo de apuesta</th><th title="Qué tan probable cree el modelo que es esto">Probabilidad</th><th title="Lo que tu cuota dice que cree el mercado">Según tu cuota</th><th title="Diferencia entre lo que cree el modelo y lo que paga la cuota">Diferencia</th><th title="La cuota que el modelo considera justa para esta probabilidad">Cuota justa</th><th></th></tr></thead>
      <tbody id="mtb"></tbody></table>
    </div>

    <div class="card" id="betbuilder-card" style="border:1px solid var(--gbr);">
      <div class="ctit" style="justify-content:space-between;">
        <span><span class="n" style="background:var(--gdim);color:var(--gn);">🎯</span> Tu apuesta <span style="font-size:10px;font-weight:400;color:var(--mu);margin-left:6px;">Lo que vas a registrar</span></span>
        <span id="bb-count" style="font-size:11px;color:var(--mu);">0 elegidas</span>
      </div>
      <div id="bb-legs" style="margin-bottom:10px;">
        <div style="font-size:12px;color:var(--mu2);font-style:italic;padding:8px 0;">Marca las casillas de la tabla de arriba para armar tu apuesta combinada.</div>
      </div>
      <div id="bb-summary" class="hidden" style="background:var(--sur2);border-radius:8px;padding:10px 12px;margin-bottom:10px;">
        <div style="display:flex;gap:20px;flex-wrap:wrap;">
          <div><div style="font-size:10px;color:var(--mu);">Cuota combinada</div><div id="bb-odd" style="font-size:18px;font-weight:700;font-family:'Space Grotesk',sans-serif;color:var(--am);">—</div></div>
          <div><div style="font-size:10px;color:var(--mu);">Prob. combinada</div><div id="bb-prob" style="font-size:18px;font-weight:700;font-family:'Space Grotesk',sans-serif;color:var(--bl);">—</div></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;">
        <div class="fg"><label>¿Cuánto vas a apostar?</label><input type="number" id="bb-stake" value="1" step="0.1" min="0.1"/></div>
        <div class="fg"><label>¿En qué casa de apuestas?</label>
          <select id="bb-bookie" style="width:100%;background:var(--sur2);border:1px solid var(--b2);color:var(--tx);font-family:'Inter',sans-serif;font-size:13px;padding:0 10px;height:38px;border-radius:7px;">
            <option>Coolbet</option><option>Betano</option><option>Bet365</option><option>Jugabet</option><option>1xBet</option><option>Otra</option>
          </select>
        </div>
        <button class="btn-am" onclick="registerBetBuilder()" id="bb-register-btn" disabled style="opacity:.4;cursor:not-allowed;">+ Registrar apuesta</button>
      </div>
    </div>
    <div class="card hidden" id="tsec" style="padding:0;overflow:hidden;">
      <div style="padding:10px 14px;font-size:12px;font-weight:600;color:var(--mu);border-bottom:1px solid var(--b);">📐 Otras estimaciones del partido (corners, tarjetas, tiros) — son cálculos aproximados, no tan precisos como las apuestas de arriba</div>
      <table class="mt"><thead><tr><th style="width:24px;"></th><th>De qué se trata</th><th>Estimado</th><th>Número de referencia</th><th>Lo más probable</th><th>Cuota</th></tr></thead>
      <tbody id="stb"></tbody></table>
      <div style="padding:10px 14px;font-size:11px;color:var(--mu);">Estos números son orientativos. Si tu casa de apuestas ofrece estas opciones, escribe la cuota para poder agregarlas a tu apuesta.</div>
    </div>
  </div>
`;

const CLIENT_SCRIPT = `

// ═══ DATOS REALES ═══
// 14.438 partidos competitivos 2004-2026 · ajustados por ELO del rival
// Fuente: github.com/martj42/international_results
const MODEL = {"Argentina":{"avgGF":1.487,"avgGA":0.72,"winRate":0.574,"ptsRate":0.663,"pj":190,"homeGF":1.604,"awayGF":1.063,"homeGA":0.459,"awayGA":0.951,"elo":1936.0},"Australia":{"avgGF":1.918,"avgGA":0.74,"winRate":0.58,"ptsRate":0.643,"pj":169,"homeGF":2.624,"awayGF":1.526,"homeGA":0.428,"awayGA":0.735,"elo":1816.0},"Belgium":{"avgGF":2.261,"avgGA":0.865,"winRate":0.59,"ptsRate":0.651,"pj":166,"homeGF":3.281,"awayGF":1.785,"homeGA":0.79,"awayGA":1.031,"elo":1776.0},"Bosnia-Herzegovina":{"avgGF":1.754,"avgGA":1.273,"winRate":0.404,"ptsRate":0.481,"pj":146,"homeGF":1.85,"awayGF":1.642,"homeGA":1.089,"awayGA":1.484,"elo":1532.0},"Brazil":{"avgGF":1.7,"avgGA":0.64,"winRate":0.59,"ptsRate":0.671,"pj":178,"homeGF":1.989,"awayGF":1.402,"homeGA":0.507,"awayGA":0.818,"elo":1851.0},"Canada":{"avgGF":1.858,"avgGA":0.865,"winRate":0.492,"ptsRate":0.559,"pj":132,"homeGF":2.425,"awayGF":1.105,"homeGA":0.668,"awayGA":1.114,"elo":1743.0},"Cape Verde":{"avgGF":1.129,"avgGA":1.016,"winRate":0.407,"ptsRate":0.488,"pj":123,"homeGF":1.477,"awayGF":0.815,"homeGA":0.751,"awayGA":1.464,"elo":1603.0},"Colombia":{"avgGF":1.142,"avgGA":0.785,"winRate":0.434,"ptsRate":0.532,"pj":159,"homeGF":1.505,"awayGF":0.845,"homeGA":0.623,"awayGA":0.952,"elo":1816.0},"Croatia":{"avgGF":1.725,"avgGA":0.829,"winRate":0.541,"ptsRate":0.621,"pj":183,"homeGF":2.151,"awayGF":1.534,"homeGA":0.559,"awayGA":0.973,"elo":1788.0},"Curacao":{"avgGF":1.875,"avgGA":1.396,"winRate":0.363,"ptsRate":0.438,"pj":113,"homeGF":2.49,"awayGF":1.328,"homeGA":0.964,"awayGA":1.729,"elo":1560.0},"Czech Republic":{"avgGF":1.773,"avgGA":0.964,"winRate":0.512,"ptsRate":0.571,"pj":162,"homeGF":2.13,"awayGF":1.582,"homeGA":0.814,"awayGA":0.98,"elo":1622.0},"Ecuador":{"avgGF":1.084,"avgGA":1.066,"winRate":0.338,"ptsRate":0.425,"pj":142,"homeGF":1.541,"awayGF":0.735,"homeGA":0.628,"awayGA":1.281,"elo":1760.0},"Egypt":{"avgGF":1.696,"avgGA":0.749,"winRate":0.575,"ptsRate":0.65,"pj":179,"homeGF":2.272,"awayGF":1.282,"homeGA":0.536,"awayGA":0.975,"elo":1730.0},"France":{"avgGF":1.751,"avgGA":0.67,"winRate":0.602,"ptsRate":0.685,"pj":181,"homeGF":2.342,"awayGF":1.468,"homeGA":0.508,"awayGA":0.667,"elo":1908.0},"Germany":{"avgGF":2.59,"avgGA":0.805,"winRate":0.682,"ptsRate":0.736,"pj":179,"homeGF":3.034,"awayGF":2.678,"homeGA":0.805,"awayGA":0.847,"elo":1829.0},"Ghana":{"avgGF":1.538,"avgGA":0.762,"winRate":0.518,"ptsRate":0.601,"pj":168,"homeGF":2.193,"awayGF":1.216,"homeGA":0.496,"awayGA":0.672,"elo":1596.0},"Haiti":{"avgGF":2.036,"avgGA":1.114,"winRate":0.486,"ptsRate":0.548,"pj":144,"homeGF":2.227,"awayGF":2.129,"homeGA":0.937,"awayGA":1.301,"elo":1638.0},"Iran":{"avgGF":1.967,"avgGA":0.625,"winRate":0.621,"ptsRate":0.696,"pj":177,"homeGF":2.581,"awayGF":1.618,"homeGA":0.377,"awayGA":0.622,"elo":1816.0},"Iraq":{"avgGF":1.341,"avgGA":0.883,"winRate":0.436,"ptsRate":0.537,"pj":204,"homeGF":1.617,"awayGF":1.224,"homeGA":0.65,"awayGA":0.986,"elo":1712.0},"Cote d'Ivoire":{"avgGF":1.874,"avgGA":0.715,"winRate":0.592,"ptsRate":0.675,"pj":169,"homeGF":2.617,"awayGF":1.379,"homeGA":0.611,"awayGA":0.846,"elo":1734.0},"Japan":{"avgGF":2.027,"avgGA":0.712,"winRate":0.601,"ptsRate":0.674,"pj":233,"homeGF":2.565,"awayGF":1.864,"homeGA":0.502,"awayGA":0.585,"elo":1852.0},"Jordan":{"avgGF":1.639,"avgGA":0.814,"winRate":0.487,"ptsRate":0.569,"pj":154,"homeGF":2.224,"awayGF":1.177,"homeGA":0.62,"awayGA":1.14,"elo":1708.0},"Mexico":{"avgGF":1.735,"avgGA":0.754,"winRate":0.604,"ptsRate":0.661,"pj":222,"homeGF":2.419,"awayGF":1.357,"homeGA":0.39,"awayGA":1.071,"elo":1833.0},"Morocco":{"avgGF":1.756,"avgGA":0.589,"winRate":0.579,"ptsRate":0.664,"pj":152,"homeGF":2.539,"awayGF":1.13,"homeGA":0.335,"awayGA":0.892,"elo":1849.0},"Netherlands":{"avgGF":2.227,"avgGA":0.761,"winRate":0.652,"ptsRate":0.709,"pj":181,"homeGF":3.022,"awayGF":1.872,"homeGA":0.583,"awayGA":0.911,"elo":1822.0},"New Zealand":{"avgGF":2.123,"avgGA":0.823,"winRate":0.57,"ptsRate":0.631,"pj":79,"homeGF":3.534,"awayGF":1.287,"homeGA":0.713,"awayGA":0.95,"elo":1660.0},"Norway":{"avgGF":1.808,"avgGA":0.942,"winRate":0.507,"ptsRate":0.575,"pj":136,"homeGF":2.012,"awayGF":1.577,"homeGA":0.776,"awayGA":1.068,"elo":1716.0},"Panama":{"avgGF":1.427,"avgGA":1.063,"winRate":0.428,"ptsRate":0.513,"pj":194,"homeGF":1.881,"awayGF":0.985,"homeGA":0.617,"awayGA":1.199,"elo":1753.0},"Paraguay":{"avgGF":0.877,"avgGA":1.094,"winRate":0.296,"ptsRate":0.399,"pj":152,"homeGF":1.083,"awayGF":0.646,"homeGA":0.828,"awayGA":1.289,"elo":1673.0},"Portugal":{"avgGF":2.047,"avgGA":0.732,"winRate":0.618,"ptsRate":0.689,"pj":199,"homeGF":2.654,"awayGF":1.973,"homeGA":0.627,"awayGA":0.786,"elo":1850.0},"Qatar":{"avgGF":1.661,"avgGA":1.0,"winRate":0.464,"ptsRate":0.535,"pj":194,"homeGF":2.149,"awayGF":1.231,"homeGA":0.746,"awayGA":1.336,"elo":1627.0},"Saudi Arabia":{"avgGF":1.541,"avgGA":0.833,"winRate":0.502,"ptsRate":0.58,"pj":205,"homeGF":2.114,"awayGF":1.48,"homeGA":0.619,"awayGA":0.795,"elo":1670.0},"Scotland":{"avgGF":1.505,"avgGA":1.046,"winRate":0.475,"ptsRate":0.538,"pj":141,"homeGF":1.79,"awayGF":1.103,"homeGA":0.928,"awayGA":1.255,"elo":1681.0},"Senegal":{"avgGF":1.719,"avgGA":0.684,"winRate":0.573,"ptsRate":0.674,"pj":164,"homeGF":2.46,"awayGF":1.439,"homeGA":0.357,"awayGA":0.85,"elo":1800.0},"South Africa":{"avgGF":1.351,"avgGA":0.859,"winRate":0.425,"ptsRate":0.542,"pj":186,"homeGF":1.48,"awayGF":1.124,"homeGA":0.682,"awayGA":1.075,"elo":1625.0},"South Korea":{"avgGF":1.701,"avgGA":0.692,"winRate":0.544,"ptsRate":0.636,"pj":171,"homeGF":2.217,"awayGF":1.647,"homeGA":0.426,"awayGA":0.657,"elo":1812.0},"Spain":{"avgGF":2.236,"avgGA":0.601,"winRate":0.706,"ptsRate":0.767,"pj":197,"homeGF":2.935,"awayGF":2.137,"homeGA":0.411,"awayGA":0.696,"elo":1956.0},"Sweden":{"avgGF":1.847,"avgGA":0.926,"winRate":0.512,"ptsRate":0.572,"pj":168,"homeGF":2.267,"awayGF":1.678,"homeGA":0.747,"awayGA":1.125,"elo":1644.0},"Switzerland":{"avgGF":1.705,"avgGA":0.889,"winRate":0.481,"ptsRate":0.581,"pj":158,"homeGF":2.271,"awayGF":1.528,"homeGA":0.712,"awayGA":1.028,"elo":1743.0},"Tunisia":{"avgGF":1.654,"avgGA":0.783,"winRate":0.522,"ptsRate":0.621,"pj":186,"homeGF":2.399,"awayGF":1.391,"homeGA":0.414,"awayGA":0.844,"elo":1668.0},"Turkey":{"avgGF":1.715,"avgGA":1.056,"winRate":0.5,"ptsRate":0.574,"pj":156,"homeGF":1.889,"awayGF":1.609,"homeGA":0.95,"awayGA":1.077,"elo":1729.0},"USA":{"avgGF":1.865,"avgGA":0.806,"winRate":0.62,"ptsRate":0.667,"pj":200,"homeGF":2.238,"awayGF":1.313,"homeGA":0.569,"awayGA":1.162,"elo":1755.0},"Uruguay":{"avgGF":1.247,"avgGA":0.913,"winRate":0.42,"ptsRate":0.524,"pj":176,"homeGF":1.629,"awayGF":0.944,"homeGA":0.744,"awayGA":1.105,"elo":1775.0},"Uzbekistan":{"avgGF":1.785,"avgGA":0.786,"winRate":0.568,"ptsRate":0.634,"pj":148,"homeGF":2.148,"awayGF":1.506,"homeGA":0.52,"awayGA":1.022,"elo":1754.0},"Zimbabwe":{"avgGF":1.229,"avgGA":1.106,"winRate":0.331,"ptsRate":0.424,"pj":148,"homeGF":1.516,"awayGF":0.813,"homeGA":0.776,"awayGA":1.271,"elo":1467.0},"Algeria":{"avgGF":1.825,"avgGA":0.9,"winRate":0.53,"ptsRate":0.612,"pj":166,"homeGF":2.694,"awayGF":1.364,"homeGA":0.728,"awayGA":1.069,"elo":1780.0},"Austria":{"avgGF":1.741,"avgGA":1.051,"winRate":0.482,"ptsRate":0.549,"pj":137,"homeGF":2.068,"awayGF":1.52,"homeGA":0.901,"awayGA":1.181,"elo":1687.0}};
const H2H = {"Norway|Sweden":{"n":5,"w1":3,"d":2,"l1":0,"avgGF1":2.356,"avgGA1":1.493,"wr1":0.6},"Egypt|Zimbabwe":{"n":5,"w1":5,"d":0,"l1":0,"avgGF1":2.323,"avgGA1":1.077,"wr1":1.0},"Algeria|Egypt":{"n":6,"w1":3,"d":1,"l1":2,"avgGF1":1.198,"avgGA1":1.407,"wr1":0.5},"Algeria|Zimbabwe":{"n":6,"w1":1,"d":4,"l1":1,"avgGF1":1.872,"avgGA1":1.628,"wr1":0.167},"Morocco|South Africa":{"n":6,"w1":2,"d":2,"l1":2,"avgGF1":1.211,"avgGA1":1.355,"wr1":0.333},"Senegal|Tunisia":{"n":6,"w1":2,"d":2,"l1":2,"avgGF1":0.724,"avgGA1":0.645,"wr1":0.333},"Algeria|Morocco":{"n":4,"w1":1,"d":1,"l1":2,"avgGF1":0.907,"avgGA1":2.204,"wr1":0.25},"Morocco|Tunisia":{"n":4,"w1":0,"d":2,"l1":2,"avgGF1":1.296,"avgGA1":1.704,"wr1":0.0},"Iran|Qatar":{"n":13,"w1":8,"d":3,"l1":2,"avgGF1":1.898,"avgGA1":0.927,"wr1":0.615},"Iraq|Uzbekistan":{"n":3,"w1":0,"d":1,"l1":2,"avgGF1":0.653,"avgGA1":1.327,"wr1":0.0},"Argentina|Ecuador":{"n":15,"w1":7,"d":4,"l1":4,"avgGF1":1.577,"avgGA1":0.862,"wr1":0.467},"Jordan|Qatar":{"n":5,"w1":2,"d":0,"l1":3,"avgGF1":0.93,"avgGA1":1.479,"wr1":0.4},"Brazil|Paraguay":{"n":16,"w1":7,"d":6,"l1":3,"avgGF1":1.612,"avgGA1":0.821,"wr1":0.438},"Australia|New Zealand":{"n":4,"w1":4,"d":0,"l1":0,"avgGF1":1.75,"avgGA1":0.25,"wr1":1.0},"Argentina|Brazil":{"n":22,"w1":7,"d":5,"l1":10,"avgGF1":0.94,"avgGA1":1.429,"wr1":0.318},"Colombia|Ecuador":{"n":13,"w1":6,"d":3,"l1":4,"avgGF1":1.076,"avgGA1":0.838,"wr1":0.462},"Cape Verde|South Africa":{"n":6,"w1":2,"d":2,"l1":2,"avgGF1":1.116,"avgGA1":1.116,"wr1":0.333},"Argentina|Paraguay":{"n":17,"w1":6,"d":7,"l1":4,"avgGF1":1.383,"avgGA1":0.823,"wr1":0.353},"Colombia|Uruguay":{"n":16,"w1":4,"d":4,"l1":8,"avgGF1":1.368,"avgGA1":1.459,"wr1":0.25},"Iran|Jordan":{"n":6,"w1":4,"d":0,"l1":2,"avgGF1":0.942,"avgGA1":0.5,"wr1":0.667},"Croatia|Switzerland":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Germany|Netherlands":{"n":8,"w1":3,"d":3,"l1":2,"avgGF1":1.633,"avgGA1":1.852,"wr1":0.375},"Croatia|France":{"n":8,"w1":2,"d":2,"l1":4,"avgGF1":1.414,"avgGA1":1.961,"wr1":0.25},"Czech Republic|Netherlands":{"n":6,"w1":4,"d":0,"l1":2,"avgGF1":1.7,"avgGA1":1.48,"wr1":0.667},"Cote d'Ivoire|Egypt":{"n":7,"w1":2,"d":2,"l1":3,"avgGF1":1.241,"avgGA1":1.448,"wr1":0.286},"Ghana|South Africa":{"n":7,"w1":5,"d":1,"l1":1,"avgGF1":1.551,"avgGA1":0.402,"wr1":0.714},"Portugal|Spain":{"n":7,"w1":1,"d":4,"l1":2,"avgGF1":1.017,"avgGA1":1.157,"wr1":0.143},"Iraq|Jordan":{"n":12,"w1":5,"d":2,"l1":5,"avgGF1":0.971,"avgGA1":1.04,"wr1":0.417},"France|Switzerland":{"n":7,"w1":2,"d":5,"l1":0,"avgGF1":1.778,"avgGA1":1.016,"wr1":0.286},"Czech Republic|Germany":{"n":5,"w1":2,"d":0,"l1":3,"avgGF1":1.415,"avgGA1":1.585,"wr1":0.4},"Iran|Iraq":{"n":11,"w1":7,"d":3,"l1":1,"avgGF1":1.553,"avgGA1":0.836,"wr1":0.636},"Netherlands|Sweden":{"n":5,"w1":2,"d":2,"l1":1,"avgGF1":1.756,"avgGA1":0.976,"wr1":0.4},"Netherlands|Portugal":{"n":4,"w1":0,"d":0,"l1":4,"avgGF1":0.507,"avgGA1":1.507,"wr1":0.0},"Mexico|Uruguay":{"n":5,"w1":2,"d":1,"l1":2,"avgGF1":1.565,"avgGA1":1.196,"wr1":0.4},"Argentina|Mexico":{"n":6,"w1":4,"d":1,"l1":1,"avgGF1":1.916,"avgGA1":0.645,"wr1":0.667},"Ecuador|Uruguay":{"n":14,"w1":4,"d":4,"l1":6,"avgGF1":0.921,"avgGA1":1.246,"wr1":0.286},"Argentina|Uruguay":{"n":16,"w1":11,"d":2,"l1":3,"avgGF1":1.568,"avgGA1":0.75,"wr1":0.688},"Ecuador|Mexico":{"n":4,"w1":1,"d":1,"l1":2,"avgGF1":1.0,"avgGA1":1.25,"wr1":0.25},"Brazil|Mexico":{"n":6,"w1":3,"d":1,"l1":2,"avgGF1":1.367,"avgGA1":0.48,"wr1":0.5},"Paraguay|Uruguay":{"n":15,"w1":2,"d":5,"l1":8,"avgGF1":0.532,"avgGA1":1.355,"wr1":0.133},"Jordan|South Korea":{"n":7,"w1":1,"d":4,"l1":2,"avgGF1":1.009,"avgGA1":1.13,"wr1":0.143},"Argentina|Colombia":{"n":18,"w1":9,"d":6,"l1":3,"avgGF1":1.278,"avgGA1":0.722,"wr1":0.5},"Brazil|Uruguay":{"n":13,"w1":6,"d":6,"l1":1,"avgGF1":1.895,"avgGA1":1.0,"wr1":0.462},"Saudi Arabia|Uzbekistan":{"n":9,"w1":5,"d":1,"l1":3,"avgGF1":1.871,"avgGA1":1.231,"wr1":0.556},"Iraq|Saudi Arabia":{"n":12,"w1":5,"d":1,"l1":6,"avgGF1":0.882,"avgGA1":1.024,"wr1":0.417},"Iran|Japan":{"n":5,"w1":2,"d":1,"l1":2,"avgGF1":0.988,"avgGA1":1.398,"wr1":0.4},"Japan|Jordan":{"n":5,"w1":2,"d":2,"l1":1,"avgGF1":2.169,"avgGA1":0.795,"wr1":0.4},"Iran|South Korea":{"n":13,"w1":5,"d":6,"l1":2,"avgGF1":1.005,"avgGA1":0.777,"wr1":0.385},"Cape Verde|Ghana":{"n":4,"w1":1,"d":0,"l1":3,"avgGF1":0.407,"avgGA1":2.389,"wr1":0.25},"Bosnia-Herzegovina|Spain":{"n":4,"w1":0,"d":2,"l1":2,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Panama|USA":{"n":23,"w1":4,"d":7,"l1":12,"avgGF1":0.745,"avgGA1":1.74,"wr1":0.174},"Croatia|Sweden":{"n":4,"w1":3,"d":0,"l1":1,"avgGF1":1.242,"avgGA1":0.726,"wr1":0.75},"Colombia|Paraguay":{"n":16,"w1":9,"d":4,"l1":3,"avgGF1":1.189,"avgGA1":0.962,"wr1":0.562},"Norway|Scotland":{"n":6,"w1":2,"d":2,"l1":2,"avgGF1":1.667,"avgGA1":1.167,"wr1":0.333},"Belgium|Spain":{"n":4,"w1":0,"d":0,"l1":4,"avgGF1":0.25,"avgGA1":2.75,"wr1":0.0},"Brazil|Colombia":{"n":13,"w1":5,"d":6,"l1":2,"avgGF1":0.945,"avgGA1":0.706,"wr1":0.385},"Brazil|Ecuador":{"n":13,"w1":7,"d":5,"l1":1,"avgGF1":1.611,"avgGA1":0.472,"wr1":0.538},"Iraq|Qatar":{"n":9,"w1":4,"d":1,"l1":4,"avgGF1":0.957,"avgGA1":1.426,"wr1":0.444},"Saudi Arabia|South Korea":{"n":6,"w1":2,"d":3,"l1":1,"avgGF1":0.837,"avgGA1":0.673,"wr1":0.333},"Belgium|Bosnia-Herzegovina":{"n":8,"w1":4,"d":1,"l1":3,"avgGF1":2.375,"avgGA1":1.625,"wr1":0.5},"Ecuador|Paraguay":{"n":12,"w1":3,"d":5,"l1":4,"avgGF1":1.485,"avgGA1":1.485,"wr1":0.25},"Mexico|USA":{"n":19,"w1":7,"d":3,"l1":9,"avgGF1":1.163,"avgGA1":1.355,"wr1":0.368},"South Korea|Uzbekistan":{"n":8,"w1":5,"d":3,"l1":0,"avgGF1":1.638,"avgGA1":0.877,"wr1":0.625},"Mexico|Panama":{"n":19,"w1":12,"d":5,"l1":2,"avgGF1":1.565,"avgGA1":0.582,"wr1":0.632},"Argentina|Tunisia":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Australia|Germany":{"n":3,"w1":0,"d":0,"l1":3,"avgGF1":1.31,"avgGA1":3.738,"wr1":0.0},"Japan|Mexico":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Argentina|Australia":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":2.71,"avgGA1":1.355,"wr1":1.0},"Germany|Tunisia":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"Australia|Tunisia":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":0.645,"avgGA1":0.71,"wr1":0.5},"Argentina|Germany":{"n":4,"w1":0,"d":2,"l1":2,"avgGF1":0.592,"avgGA1":2.0,"wr1":0.0},"Brazil|Japan":{"n":4,"w1":2,"d":1,"l1":1,"avgGF1":2.962,"avgGA1":1.415,"wr1":0.5},"Brazil|Germany":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.71,"avgGA1":5.226,"wr1":0.5},"Germany|Mexico":{"n":3,"w1":2,"d":0,"l1":1,"avgGF1":2.095,"avgGA1":1.524,"wr1":0.667},"Colombia|Panama":{"n":3,"w1":1,"d":0,"l1":2,"avgGF1":2.44,"avgGA1":1.28,"wr1":0.333},"Mexico|South Africa":{"n":3,"w1":1,"d":1,"l1":1,"avgGF1":1.357,"avgGA1":0.929,"wr1":0.333},"Canada|USA":{"n":11,"w1":3,"d":2,"l1":6,"avgGF1":0.994,"avgGA1":1.541,"wr1":0.273},"Colombia|Mexico":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Panama|South Africa":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Japan|South Korea":{"n":10,"w1":3,"d":4,"l1":3,"avgGF1":1.18,"avgGA1":1.27,"wr1":0.3},"Czech Republic|Norway":{"n":4,"w1":3,"d":1,"l1":0,"avgGF1":1.25,"avgGA1":0.5,"wr1":0.75},"Switzerland|Turkey":{"n":4,"w1":2,"d":0,"l1":2,"avgGF1":2.0,"avgGA1":1.735,"wr1":0.5},"Australia|Uruguay":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":0.5,"avgGA1":0.5,"wr1":0.5},"Cote d'Ivoire|Morocco":{"n":7,"w1":1,"d":3,"l1":3,"avgGF1":0.608,"avgGA1":1.052,"wr1":0.143},"Senegal|Zimbabwe":{"n":4,"w1":4,"d":0,"l1":0,"avgGF1":1.75,"avgGA1":0.25,"wr1":1.0},"Egypt|Morocco":{"n":3,"w1":2,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":0.333,"wr1":0.667},"South Africa|Tunisia":{"n":3,"w1":0,"d":1,"l1":2,"avgGF1":0.333,"avgGA1":1.667,"wr1":0.0},"Ghana|Senegal":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.5},"Croatia|South Korea":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Ghana|Zimbabwe":{"n":3,"w1":2,"d":0,"l1":1,"avgGF1":1.744,"avgGA1":0.884,"wr1":0.667},"Egypt|Senegal":{"n":7,"w1":2,"d":1,"l1":4,"avgGF1":0.392,"avgGA1":0.887,"wr1":0.286},"Qatar|Uzbekistan":{"n":12,"w1":3,"d":1,"l1":8,"avgGF1":0.83,"avgGA1":1.912,"wr1":0.25},"Japan|Scotland":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Argentina|Cote d'Ivoire":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Iran|Mexico":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":3.0,"wr1":0.0},"Australia|Japan":{"n":14,"w1":3,"d":6,"l1":5,"avgGF1":1.009,"avgGA1":1.169,"wr1":0.214},"Czech Republic|USA":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"Brazil|Croatia":{"n":3,"w1":2,"d":1,"l1":0,"avgGF1":1.667,"avgGA1":0.667,"wr1":0.667},"Saudi Arabia|Tunisia":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":2.0,"wr1":0.0},"Paraguay|Sweden":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Cote d'Ivoire|Netherlands":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Czech Republic|Ghana":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Iran|Portugal":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":0.5,"avgGA1":1.5,"wr1":0.0},"Australia|Brazil":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"France|South Korea":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Croatia|Japan":{"n":2,"w1":0,"d":2,"l1":0,"avgGF1":0.5,"avgGA1":0.5,"wr1":0.0},"Spain|Tunisia":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":1.0,"wr1":1.0},"Ecuador|Germany":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":3.0,"wr1":0.0},"Argentina|Netherlands":{"n":3,"w1":0,"d":3,"l1":0,"avgGF1":0.667,"avgGA1":0.667,"wr1":0.0},"Mexico|Portugal":{"n":3,"w1":0,"d":1,"l1":2,"avgGF1":1.262,"avgGA1":2.0,"wr1":0.0},"Australia|Croatia":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":2.0,"wr1":0.0},"Ghana|USA":{"n":3,"w1":2,"d":0,"l1":1,"avgGF1":1.667,"avgGA1":1.333,"wr1":0.667},"Saudi Arabia|Spain":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"South Korea|Switzerland":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Germany|Sweden":{"n":4,"w1":3,"d":1,"l1":0,"avgGF1":3.111,"avgGA1":1.833,"wr1":0.75},"Brazil|Ghana":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"France|Spain":{"n":7,"w1":2,"d":1,"l1":4,"avgGF1":1.559,"avgGA1":1.814,"wr1":0.286},"Brazil|France":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"France|Portugal":{"n":6,"w1":2,"d":3,"l1":1,"avgGF1":0.683,"avgGA1":0.519,"wr1":0.333},"Germany|Portugal":{"n":6,"w1":5,"d":0,"l1":1,"avgGF1":2.743,"avgGA1":1.119,"wr1":0.833},"Japan|Saudi Arabia":{"n":11,"w1":6,"d":1,"l1":4,"avgGF1":1.564,"avgGA1":0.732,"wr1":0.545},"France|Scotland":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Spain|Sweden":{"n":8,"w1":4,"d":2,"l1":2,"avgGF1":1.364,"avgGA1":0.742,"wr1":0.5},"Qatar|Saudi Arabia":{"n":8,"w1":3,"d":4,"l1":1,"avgGF1":1.415,"avgGA1":0.702,"wr1":0.375},"Algeria|Cape Verde":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":0.5},"Bosnia-Herzegovina|Norway":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":1.5,"wr1":0.5},"Belgium|Portugal":{"n":3,"w1":1,"d":0,"l1":2,"avgGF1":0.68,"avgGA1":1.92,"wr1":0.333},"Morocco|Zimbabwe":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.5,"avgGA1":0.5,"wr1":0.5},"Norway|Turkey":{"n":4,"w1":0,"d":2,"l1":2,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Bosnia-Herzegovina|Turkey":{"n":4,"w1":1,"d":1,"l1":2,"avgGF1":1.25,"avgGA1":1.5,"wr1":0.25},"Colombia|Japan":{"n":4,"w1":2,"d":1,"l1":1,"avgGF1":1.79,"avgGA1":0.968,"wr1":0.5},"Canada|Haiti":{"n":5,"w1":4,"d":0,"l1":1,"avgGF1":2.4,"avgGA1":0.8,"wr1":0.8},"Argentina|USA":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":0.5,"wr1":1.0},"Paraguay|USA":{"n":3,"w1":1,"d":0,"l1":2,"avgGF1":1.321,"avgGA1":2.071,"wr1":0.333},"Colombia|USA":{"n":3,"w1":3,"d":0,"l1":0,"avgGF1":1.333,"avgGA1":0.0,"wr1":1.0},"Mexico|Paraguay":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":6.0,"avgGA1":0.0,"wr1":1.0},"Japan|Qatar":{"n":5,"w1":2,"d":2,"l1":1,"avgGF1":1.795,"avgGA1":1.422,"wr1":0.4},"Iran|Uzbekistan":{"n":11,"w1":5,"d":5,"l1":1,"avgGF1":1.036,"avgGA1":0.581,"wr1":0.455},"Australia|Iraq":{"n":8,"w1":5,"d":1,"l1":2,"avgGF1":1.123,"avgGA1":0.762,"wr1":0.625},"Iraq|South Korea":{"n":6,"w1":0,"d":2,"l1":4,"avgGF1":0.327,"avgGA1":1.653,"wr1":0.0},"Ghana|Morocco":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":0.5,"wr1":0.5},"Senegal|South Africa":{"n":5,"w1":2,"d":3,"l1":0,"avgGF1":1.323,"avgGA1":0.585,"wr1":0.4},"Australia|Qatar":{"n":4,"w1":3,"d":1,"l1":0,"avgGF1":2.5,"avgGA1":0.25,"wr1":0.75},"Cote d'Ivoire|Ghana":{"n":3,"w1":1,"d":1,"l1":1,"avgGF1":1.667,"avgGA1":1.667,"wr1":0.333},"Cote d'Ivoire|Paraguay":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Cote d'Ivoire|Japan":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.29,"avgGA1":1.0,"wr1":0.5},"Japan|Paraguay":{"n":4,"w1":1,"d":3,"l1":0,"avgGF1":0.83,"avgGA1":0.415,"wr1":0.25},"Algeria|Senegal":{"n":6,"w1":4,"d":1,"l1":1,"avgGF1":1.5,"avgGA1":0.921,"wr1":0.667},"Portugal|Turkey":{"n":3,"w1":3,"d":0,"l1":0,"avgGF1":2.654,"avgGA1":0.308,"wr1":1.0},"Czech Republic|Switzerland":{"n":3,"w1":2,"d":0,"l1":1,"avgGF1":1.312,"avgGA1":0.938,"wr1":0.667},"Austria|Croatia":{"n":3,"w1":1,"d":0,"l1":2,"avgGF1":1.25,"avgGA1":1.312,"wr1":0.333},"Czech Republic|Portugal":{"n":5,"w1":0,"d":0,"l1":5,"avgGF1":0.429,"avgGA1":2.357,"wr1":0.0},"Croatia|Germany":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"France|Netherlands":{"n":8,"w1":5,"d":1,"l1":2,"avgGF1":1.723,"avgGA1":1.023,"wr1":0.625},"Curacao|Haiti":{"n":7,"w1":2,"d":3,"l1":2,"avgGF1":1.582,"avgGA1":1.3,"wr1":0.286},"Portugal|Switzerland":{"n":7,"w1":4,"d":0,"l1":3,"avgGF1":2.235,"avgGA1":1.026,"wr1":0.571},"Czech Republic|Turkey":{"n":5,"w1":1,"d":0,"l1":4,"avgGF1":1.0,"avgGA1":2.023,"wr1":0.2},"Austria|Germany":{"n":5,"w1":0,"d":0,"l1":5,"avgGF1":0.78,"avgGA1":2.756,"wr1":0.0},"Croatia|Turkey":{"n":8,"w1":3,"d":3,"l1":2,"avgGF1":1.0,"avgGA1":0.5,"wr1":0.375},"Germany|Turkey":{"n":3,"w1":3,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":1.04,"wr1":1.0},"Germany|Spain":{"n":6,"w1":0,"d":2,"l1":4,"avgGF1":0.5,"avgGA1":1.877,"wr1":0.0},"Austria|France":{"n":5,"w1":1,"d":1,"l1":3,"avgGF1":0.988,"avgGA1":1.588,"wr1":0.2},"Iran|Saudi Arabia":{"n":3,"w1":0,"d":2,"l1":1,"avgGF1":0.744,"avgGA1":1.116,"wr1":0.0},"Canada|Mexico":{"n":10,"w1":1,"d":2,"l1":7,"avgGF1":0.805,"avgGA1":2.0,"wr1":0.1},"Belgium|Turkey":{"n":4,"w1":1,"d":2,"l1":1,"avgGF1":1.5,"avgGA1":1.25,"wr1":0.25},"Australia|Uzbekistan":{"n":5,"w1":3,"d":2,"l1":0,"avgGF1":2.012,"avgGA1":0.205,"wr1":0.6},"Portugal|Sweden":{"n":6,"w1":4,"d":2,"l1":0,"avgGF1":1.479,"avgGA1":0.34,"wr1":0.667},"Japan|Uzbekistan":{"n":5,"w1":2,"d":2,"l1":1,"avgGF1":1.012,"avgGA1":0.802,"wr1":0.4},"Netherlands|Norway":{"n":4,"w1":3,"d":1,"l1":0,"avgGF1":1.5,"avgGA1":0.25,"wr1":0.75},"Netherlands|Scotland":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Spain|Turkey":{"n":5,"w1":4,"d":1,"l1":0,"avgGF1":2.805,"avgGA1":0.585,"wr1":0.8},"Belgium|Japan":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.935,"avgGA1":2.71,"wr1":0.5},"New Zealand|Spain":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":5.0,"wr1":0.0},"Iraq|South Africa":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Brazil|Egypt":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":3.0,"wr1":1.0},"New Zealand|South Africa":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Iraq|Spain":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Brazil|USA":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":1.0,"wr1":1.0},"Iraq|New Zealand":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"South Africa|Spain":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":1.0,"avgGA1":2.5,"wr1":0.0},"Egypt|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":3.0,"wr1":0.0},"Spain|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Brazil|South Africa":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Haiti|USA":{"n":4,"w1":0,"d":1,"l1":3,"avgGF1":0.75,"avgGA1":1.5,"wr1":0.0},"Haiti|Mexico":{"n":3,"w1":0,"d":0,"l1":3,"avgGF1":0.333,"avgGA1":2.667,"wr1":0.0},"South Africa|Zimbabwe":{"n":6,"w1":3,"d":3,"l1":0,"avgGF1":1.256,"avgGA1":0.57,"wr1":0.5},"Bosnia-Herzegovina|Portugal":{"n":6,"w1":0,"d":1,"l1":5,"avgGF1":0.333,"avgGA1":2.667,"wr1":0.0},"Algeria|Cote d'Ivoire":{"n":5,"w1":1,"d":2,"l1":2,"avgGF1":1.6,"avgGA1":2.2,"wr1":0.2},"Egypt|Ghana":{"n":7,"w1":4,"d":2,"l1":1,"avgGF1":1.443,"avgGA1":1.546,"wr1":0.571},"France|Uruguay":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":0.5},"Cote d'Ivoire|Portugal":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"South Africa|Uruguay":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":3.0,"wr1":0.0},"Spain|Switzerland":{"n":8,"w1":4,"d":2,"l1":2,"avgGF1":1.43,"avgGA1":1.0,"wr1":0.5},"Argentina|South Korea":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":1.0,"wr1":1.0},"France|Mexico":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Australia|Ghana":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Japan|Netherlands":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":1.0,"avgGA1":1.5,"wr1":0.0},"Brazil|Cote d'Ivoire":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":1.0,"wr1":1.0},"France|South Africa":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Germany|Ghana":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.5,"avgGA1":1.0,"wr1":0.5},"Algeria|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"New Zealand|Paraguay":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Brazil|Portugal":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"South Korea|Uruguay":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":0.5,"avgGA1":1.0,"wr1":0.0},"Brazil|Netherlands":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":0.5,"avgGA1":2.5,"wr1":0.0},"Ghana|Uruguay":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":0.5,"avgGA1":1.5,"wr1":0.0},"Paraguay|Spain":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Netherlands|Uruguay":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":2.29,"avgGA1":1.645,"wr1":0.5},"Germany|Uruguay":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":2.0,"wr1":1.0},"Netherlands|Spain":{"n":4,"w1":1,"d":2,"l1":1,"avgGF1":2.5,"avgGA1":1.643,"wr1":0.25},"Belgium|Germany":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":0.5,"avgGA1":2.0,"wr1":0.0},"Bosnia-Herzegovina|France":{"n":4,"w1":0,"d":2,"l1":2,"avgGF1":0.5,"avgGA1":1.25,"wr1":0.0},"Norway|Portugal":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":0.5,"avgGA1":0.5,"wr1":0.5},"Czech Republic|Scotland":{"n":5,"w1":2,"d":1,"l1":2,"avgGF1":1.238,"avgGA1":0.963,"wr1":0.4},"Cape Verde|Zimbabwe":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":0.5,"wr1":0.5},"Austria|Belgium":{"n":4,"w1":0,"d":2,"l1":2,"avgGF1":1.75,"avgGA1":2.5,"wr1":0.0},"Scotland|Spain":{"n":4,"w1":1,"d":0,"l1":3,"avgGF1":1.25,"avgGA1":2.0,"wr1":0.25},"Jordan|Saudi Arabia":{"n":6,"w1":5,"d":0,"l1":1,"avgGF1":1.268,"avgGA1":0.585,"wr1":0.833},"Australia|South Korea":{"n":5,"w1":1,"d":2,"l1":2,"avgGF1":0.861,"avgGA1":1.076,"wr1":0.2},"Jordan|Uzbekistan":{"n":3,"w1":0,"d":2,"l1":1,"avgGF1":1.0,"avgGA1":1.347,"wr1":0.0},"Czech Republic|Spain":{"n":5,"w1":0,"d":1,"l1":4,"avgGF1":0.575,"avgGA1":1.775,"wr1":0.0},"Egypt|South Africa":{"n":4,"w1":1,"d":1,"l1":2,"avgGF1":0.204,"avgGA1":0.5,"wr1":0.25},"Austria|Turkey":{"n":3,"w1":0,"d":1,"l1":2,"avgGF1":0.36,"avgGA1":1.36,"wr1":0.0},"Czech Republic|Japan":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Canada|Panama":{"n":7,"w1":3,"d":2,"l1":2,"avgGF1":1.135,"avgGA1":0.721,"wr1":0.429},"Australia|Saudi Arabia":{"n":8,"w1":4,"d":3,"l1":1,"avgGF1":1.75,"avgGA1":1.125,"wr1":0.5},"Ghana|Tunisia":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.5,"avgGA1":1.0,"wr1":0.5},"Qatar|South Korea":{"n":5,"w1":2,"d":0,"l1":3,"avgGF1":1.593,"avgGA1":2.173,"wr1":0.4},"Cape Verde|Tunisia":{"n":3,"w1":0,"d":1,"l1":2,"avgGF1":0.628,"avgGA1":2.116,"wr1":0.0},"Croatia|Spain":{"n":7,"w1":2,"d":1,"l1":4,"avgGF1":1.154,"avgGA1":2.564,"wr1":0.286},"France|Sweden":{"n":5,"w1":3,"d":0,"l1":2,"avgGF1":1.538,"avgGA1":1.425,"wr1":0.6},"Netherlands|Turkey":{"n":7,"w1":4,"d":1,"l1":2,"avgGF1":2.14,"avgGA1":1.421,"wr1":0.571},"Cote d'Ivoire|Senegal":{"n":5,"w1":3,"d":2,"l1":0,"avgGF1":2.28,"avgGA1":1.0,"wr1":0.6},"Belgium|Croatia":{"n":3,"w1":1,"d":2,"l1":0,"avgGF1":0.923,"avgGA1":0.615,"wr1":0.333},"Iraq|Japan":{"n":7,"w1":1,"d":1,"l1":5,"avgGF1":0.606,"avgGA1":1.45,"wr1":0.143},"Australia|Jordan":{"n":7,"w1":4,"d":0,"l1":3,"avgGF1":1.699,"avgGA1":0.858,"wr1":0.571},"Norway|Switzerland":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":0.5,"avgGA1":1.5,"wr1":0.0},"Belgium|Scotland":{"n":4,"w1":4,"d":0,"l1":0,"avgGF1":2.75,"avgGA1":0.0,"wr1":1.0},"Algeria|Tunisia":{"n":3,"w1":1,"d":0,"l1":2,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.333},"Cape Verde|Morocco":{"n":3,"w1":0,"d":1,"l1":2,"avgGF1":0.256,"avgGA1":1.372,"wr1":0.0},"Cote d'Ivoire|Tunisia":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"Austria|Sweden":{"n":6,"w1":4,"d":1,"l1":1,"avgGF1":2.167,"avgGA1":1.0,"wr1":0.667},"Croatia|Scotland":{"n":5,"w1":2,"d":0,"l1":3,"avgGF1":1.05,"avgGA1":1.2,"wr1":0.4},"Spain|Uruguay":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Brazil|Spain":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"New Zealand|Saudi Arabia":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Jordan|Uruguay":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":0.0,"avgGA1":2.5,"wr1":0.0},"Mexico|New Zealand":{"n":3,"w1":3,"d":0,"l1":0,"avgGF1":3.86,"avgGA1":1.372,"wr1":1.0},"Argentina|Bosnia-Herzegovina":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Ecuador|Switzerland":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Algeria|Belgium":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Australia|Netherlands":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":2.0,"avgGA1":3.0,"wr1":0.0},"Colombia|Cote d'Ivoire":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Argentina|Iran":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Algeria|South Korea":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":2.0,"wr1":1.0},"Portugal|USA":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":2.0,"wr1":0.0},"Australia|Spain":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":3.0,"wr1":0.0},"Croatia|Mexico":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":3.0,"wr1":0.0},"Bosnia-Herzegovina|Iran":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":1.0,"wr1":1.0},"Ecuador|France":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Belgium|South Korea":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Ghana|Portugal":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":1.5,"avgGA1":2.5,"wr1":0.0},"Germany|USA":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Mexico|Netherlands":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Algeria|Germany":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Argentina|Switzerland":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Belgium|USA":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"France|Germany":{"n":6,"w1":4,"d":1,"l1":1,"avgGF1":1.129,"avgGA1":0.347,"wr1":0.667},"Argentina|Belgium":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Japan|Uruguay":{"n":3,"w1":1,"d":1,"l1":1,"avgGF1":2.0,"avgGA1":2.275,"wr1":0.333},"Germany|Scotland":{"n":3,"w1":3,"d":0,"l1":0,"avgGF1":3.4,"avgGA1":1.32,"wr1":1.0},"Egypt|Tunisia":{"n":5,"w1":1,"d":0,"l1":4,"avgGF1":0.853,"avgGA1":1.427,"wr1":0.2},"Algeria|South Africa":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":3.0,"avgGA1":2.0,"wr1":0.5},"Algeria|Ghana":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Japan|Tunisia":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":1.5,"wr1":0.5},"Croatia|Norway":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":2.5,"avgGA1":1.5,"wr1":0.5},"Haiti|Panama":{"n":3,"w1":0,"d":2,"l1":1,"avgGF1":0.333,"avgGA1":0.667,"wr1":0.0},"Bosnia-Herzegovina|Japan":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Brazil|Haiti":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":7.0,"avgGA1":1.0,"wr1":1.0},"Argentina|Panama":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":5.0,"avgGA1":0.0,"wr1":1.0},"Ecuador|Haiti":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":0.0,"wr1":1.0},"Ecuador|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Croatia|Czech Republic":{"n":4,"w1":1,"d":3,"l1":0,"avgGF1":1.971,"avgGA1":1.029,"wr1":0.25},"Austria|Portugal":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Belgium|Sweden":{"n":3,"w1":2,"d":1,"l1":0,"avgGF1":1.64,"avgGA1":0.32,"wr1":0.667},"Croatia|Portugal":{"n":5,"w1":0,"d":1,"l1":4,"avgGF1":0.962,"avgGA1":2.154,"wr1":0.0},"Germany|Norway":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":4.5,"avgGA1":0.0,"wr1":1.0},"Cape Verde|Senegal":{"n":3,"w1":0,"d":0,"l1":3,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Tunisia|Zimbabwe":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":2.0,"wr1":1.0},"New Zealand|Portugal":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":4.0,"wr1":0.0},"Curacao|Mexico":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Japan|New Zealand":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Haiti|Japan":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":3.0,"avgGA1":3.0,"wr1":0.0},"Egypt|Uruguay":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Iran|Morocco":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Australia|France":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":1.0,"avgGA1":3.0,"wr1":0.0},"Brazil|Switzerland":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":0.5,"wr1":0.5},"South Korea|Sweden":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Belgium|Panama":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"Morocco|Portugal":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":0.5,"avgGA1":0.5,"wr1":0.5},"Saudi Arabia|Uruguay":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":0.5,"avgGA1":1.0,"wr1":0.0},"Iran|Spain":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Argentina|Croatia":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.5,"avgGA1":1.5,"wr1":0.5},"Belgium|Tunisia":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":5.0,"avgGA1":2.0,"wr1":1.0},"Mexico|South Korea":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Japan|Senegal":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":2.0,"wr1":0.0},"Egypt|Saudi Arabia":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Morocco|Spain":{"n":2,"w1":0,"d":2,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Germany|South Korea":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Mexico|Sweden":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":3.0,"wr1":0.0},"Colombia|Senegal":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Panama|Tunisia":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Argentina|France":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":3.0,"avgGA1":3.5,"wr1":0.0},"Portugal|Uruguay":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.5,"avgGA1":1.0,"wr1":0.5},"Sweden|Switzerland":{"n":3,"w1":1,"d":0,"l1":2,"avgGF1":0.692,"avgGA1":1.846,"wr1":0.333},"Belgium|Brazil":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Belgium|France":{"n":5,"w1":0,"d":0,"l1":5,"avgGF1":0.542,"avgGA1":1.723,"wr1":0.0},"Sweden|Turkey":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.5,"avgGA1":1.5,"wr1":0.5},"Austria|Bosnia-Herzegovina":{"n":4,"w1":1,"d":2,"l1":1,"avgGF1":0.774,"avgGA1":0.758,"wr1":0.25},"Belgium|Switzerland":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":2.0,"avgGA1":3.0,"wr1":0.5},"Japan|Panama":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"Norway|Spain":{"n":4,"w1":0,"d":1,"l1":3,"avgGF1":0.5,"avgGA1":1.75,"wr1":0.0},"France|Turkey":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":0.5,"avgGA1":1.5,"wr1":0.0},"Paraguay|Qatar":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":2.0,"wr1":0.0},"Colombia|Qatar":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Argentina|Qatar":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Cote d'Ivoire|South Africa":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Ecuador|Japan":{"n":2,"w1":0,"d":2,"l1":0,"avgGF1":0.621,"avgGA1":0.621,"wr1":0.0},"Curacao|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Austria|Norway":{"n":4,"w1":2,"d":1,"l1":1,"avgGF1":2.25,"avgGA1":1.25,"wr1":0.5},"Germany|Switzerland":{"n":3,"w1":0,"d":3,"l1":0,"avgGF1":1.625,"avgGA1":1.625,"wr1":0.0},"Bosnia-Herzegovina|Netherlands":{"n":4,"w1":0,"d":2,"l1":2,"avgGF1":1.0,"avgGA1":2.25,"wr1":0.0},"Austria|Scotland":{"n":2,"w1":0,"d":1,"l1":1,"avgGF1":1.0,"avgGA1":1.5,"wr1":0.0},"Belgium|Czech Republic":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":0.5,"wr1":0.5},"Curacao|Panama":{"n":3,"w1":0,"d":1,"l1":2,"avgGF1":0.66,"avgGA1":1.319,"wr1":0.0},"Austria|Netherlands":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.5,"avgGA1":2.0,"wr1":0.5},"Panama|Qatar":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":3.5,"avgGA1":1.5,"wr1":0.5},"Qatar|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Jordan|Morocco":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":1.0,"avgGA1":3.5,"wr1":0.0},"Morocco|Saudi Arabia":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Egypt|Jordan":{"n":2,"w1":1,"d":0,"l1":1,"avgGF1":1.5,"avgGA1":2.0,"wr1":0.5},"Algeria|Qatar":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Egypt|Qatar":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Czech Republic|Sweden":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Belgium|Netherlands":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":0.5,"avgGA1":2.5,"wr1":0.0},"Canada|Curacao":{"n":3,"w1":2,"d":1,"l1":0,"avgGF1":2.304,"avgGA1":0.348,"wr1":0.667},"Ghana|Japan":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":0.5,"avgGA1":3.0,"wr1":0.0},"Japan|USA":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Ecuador|Qatar":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Netherlands|Senegal":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Argentina|Saudi Arabia":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Germany|Japan":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Croatia|Morocco":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":0.5,"wr1":0.5},"Belgium|Canada":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Qatar|Senegal":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":3.0,"wr1":0.0},"Ecuador|Netherlands":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Belgium|Morocco":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Canada|Croatia":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":4.0,"wr1":0.0},"Ghana|South Korea":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":2.0,"wr1":1.0},"Ecuador|Senegal":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Netherlands|Qatar":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Iran|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Mexico|Saudi Arabia":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.556,"wr1":1.0},"France|Tunisia":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Japan|Spain":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Canada|Morocco":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Portugal|South Korea":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Netherlands|USA":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":1.0,"wr1":1.0},"Brazil|South Korea":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":1.0,"wr1":1.0},"France|Morocco":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Croatia|Netherlands":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":2.0,"wr1":1.0},"Haiti|Qatar":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":1.0,"wr1":1.0},"Mexico|Qatar":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Cape Verde|Egypt":{"n":4,"w1":0,"d":3,"l1":1,"avgGF1":0.907,"avgGA1":1.796,"wr1":0.0},"Egypt|New Zealand":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Croatia|Tunisia":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Croatia|Egypt":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":4.0,"avgGA1":2.0,"wr1":1.0},"New Zealand|Tunisia":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Scotland|Switzerland":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Argentina|Canada":{"n":2,"w1":2,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Panama|Uruguay":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":3.0,"wr1":0.0},"USA|Uruguay":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Canada|Uruguay":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":2.0,"wr1":0.0},"Portugal|Scotland":{"n":2,"w1":1,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":0.5,"wr1":0.5},"Bosnia-Herzegovina|Germany":{"n":2,"w1":0,"d":0,"l1":2,"avgGF1":0.5,"avgGA1":4.5,"wr1":0.0},"Cote d'Ivoire|New Zealand":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Canada|Cote d'Ivoire":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Haiti|Saudi Arabia":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Saudi Arabia|USA":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Cape Verde|Iran":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0},"Egypt|Uzbekistan":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":2.0,"wr1":0.0},"Qatar|Tunisia":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":3.0,"wr1":0.0},"Algeria|Iraq":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Morocco|Senegal":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":3.0,"avgGA1":0.0,"wr1":1.0},"Australia|Curacao":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":5.0,"avgGA1":1.0,"wr1":1.0},"Czech Republic|South Korea":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":2.0,"wr1":0.0},"Bosnia-Herzegovina|Canada":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Qatar|Switzerland":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Brazil|Morocco":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Haiti|Scotland":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":0.0,"avgGA1":1.0,"wr1":0.0},"Australia|Turkey":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":2.0,"avgGA1":0.0,"wr1":1.0},"Curacao|Germany":{"n":1,"w1":0,"d":0,"l1":1,"avgGF1":1.0,"avgGA1":7.0,"wr1":0.0},"Cote d'Ivoire|Ecuador":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":1.0,"avgGA1":0.0,"wr1":1.0},"Sweden|Tunisia":{"n":1,"w1":1,"d":0,"l1":0,"avgGF1":5.0,"avgGA1":1.0,"wr1":1.0},"Belgium|Egypt":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":1.0,"avgGA1":1.0,"wr1":0.0},"Iran|New Zealand":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":2.0,"avgGA1":2.0,"wr1":0.0},"Cape Verde|Spain":{"n":1,"w1":0,"d":1,"l1":0,"avgGF1":0.0,"avgGA1":0.0,"wr1":0.0}};
const WC_REAL = {"Algeria":{"avgGF":0.0,"avgGA":3.0,"pj":1},"Argentina":{"avgGF":3.0,"avgGA":0.0,"pj":1},"Australia":{"avgGF":2.0,"avgGA":0.0,"pj":1},"Austria":{"avgGF":3.0,"avgGA":1.0,"pj":1},"Belgium":{"avgGF":1.0,"avgGA":1.0,"pj":1},"Bosnia-Herzegovina":{"avgGF":1.0,"avgGA":2.5,"pj":2},"Brazil":{"avgGF":1.0,"avgGA":1.0,"pj":1},"Canada":{"avgGF":3.5,"avgGA":0.5,"pj":2},"Cape Verde":{"avgGF":0.0,"avgGA":0.0,"pj":1},"Colombia":{"avgGF":3.0,"avgGA":1.0,"pj":1},"Cote d'Ivoire":{"avgGF":1.0,"avgGA":0.0,"pj":1},"Croatia":{"avgGF":2.0,"avgGA":4.0,"pj":1},"Curacao":{"avgGF":1.0,"avgGA":7.0,"pj":1},"Czech Republic":{"avgGF":1.0,"avgGA":1.5,"pj":2},"DR Congo":{"avgGF":1.0,"avgGA":1.0,"pj":1},"Ecuador":{"avgGF":0.0,"avgGA":1.0,"pj":1},"Egypt":{"avgGF":1.0,"avgGA":1.0,"pj":1},"England":{"avgGF":4.0,"avgGA":2.0,"pj":1},"France":{"avgGF":3.0,"avgGA":1.0,"pj":1},"Germany":{"avgGF":7.0,"avgGA":1.0,"pj":1},"Ghana":{"avgGF":1.0,"avgGA":0.0,"pj":1},"Haiti":{"avgGF":0.0,"avgGA":1.0,"pj":1},"Iran":{"avgGF":2.0,"avgGA":2.0,"pj":1},"Iraq":{"avgGF":1.0,"avgGA":4.0,"pj":1},"Japan":{"avgGF":2.0,"avgGA":2.0,"pj":1},"Jordan":{"avgGF":1.0,"avgGA":3.0,"pj":1},"Mexico":{"avgGF":1.5,"avgGA":0.0,"pj":2},"Morocco":{"avgGF":1.0,"avgGA":1.0,"pj":1},"Netherlands":{"avgGF":2.0,"avgGA":2.0,"pj":1},"New Zealand":{"avgGF":2.0,"avgGA":2.0,"pj":1},"Norway":{"avgGF":4.0,"avgGA":1.0,"pj":1},"Panama":{"avgGF":0.0,"avgGA":1.0,"pj":1},"Paraguay":{"avgGF":1.0,"avgGA":4.0,"pj":1},"Portugal":{"avgGF":1.0,"avgGA":1.0,"pj":1},"Qatar":{"avgGF":0.5,"avgGA":3.5,"pj":2},"Saudi Arabia":{"avgGF":1.0,"avgGA":1.0,"pj":1},"Scotland":{"avgGF":1.0,"avgGA":0.0,"pj":1},"Senegal":{"avgGF":1.0,"avgGA":3.0,"pj":1},"South Africa":{"avgGF":0.5,"avgGA":1.5,"pj":2},"South Korea":{"avgGF":1.0,"avgGA":1.0,"pj":2},"Spain":{"avgGF":0.0,"avgGA":0.0,"pj":1},"Sweden":{"avgGF":5.0,"avgGA":1.0,"pj":1},"Switzerland":{"avgGF":2.5,"avgGA":1.0,"pj":2},"Tunisia":{"avgGF":1.0,"avgGA":5.0,"pj":1},"Turkey":{"avgGF":0.0,"avgGA":2.0,"pj":1},"USA":{"avgGF":4.0,"avgGA":1.0,"pj":1},"Uruguay":{"avgGF":1.0,"avgGA":1.0,"pj":1},"Uzbekistan":{"avgGF":1.0,"avgGA":3.0,"pj":1}};
const LEAGUE_AVG = 1.68;

// ═══ FLAGS ═══
const FLAGS={'France':'🇫🇷','Senegal':'🇸🇳','Iraq':'🇮🇶','Norway':'🇳🇴','Argentina':'🇦🇷','Algeria':'🇩🇿','Austria':'🇦🇹','Jordan':'🇯🇴','Germany':'🇩🇪','Croatia':'🇭🇷','Ghana':'🇬🇭','Panama':'🇵🇦','Portugal':'🇵🇹','Zimbabwe':'🇿🇼','Colombia':'🇨🇴','Uzbekistan':'🇺🇿','Mexico':'🇲🇽','South Africa':'🇿🇦','South Korea':'🇰🇷','Czech Republic':'🇨🇿','Canada':'🇨🇦','Bosnia-Herzegovina':'🇧🇦','Qatar':'🇶🇦','Switzerland':'🇨🇭','Brazil':'🇧🇷','Morocco':'🇲🇦','Haiti':'🇭🇹','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','USA':'🇺🇸','Paraguay':'🇵🇾','Australia':'🇦🇺','Turkey':'🇹🇷','Ecuador':'🇪🇨','Curacao':'🇨🇼','Netherlands':'🇳🇱','Japan':'🇯🇵','Sweden':'🇸🇪','Tunisia':'🇹🇳','Belgium':'🇧🇪','Egypt':'🇪🇬','Iran':'🇮🇷','New Zealand':'🇳🇿','Spain':'🇪🇸','Cape Verde':'🇨🇻','Saudi Arabia':'🇸🇦','Uruguay':'🇺🇾',"Cote d'Ivoire":'🇨🇮'};

// ═══ FIXTURES ═══
const FIXTURES=[
  {g:'Grupo A · 11 jun',m:[
    {h:'Mexico',a:'South Africa',t:'13:00h',s:'Estadio Azteca',score:[2,0]},
    {h:'South Korea',a:'Czech Republic',t:'20:00h',s:'Estadio Guadalajara',score:[2,1]},
  ]},
  {g:'Grupo B · 12-13 jun',m:[
    {h:'Canada',a:'Bosnia-Herzegovina',t:'15:00h',s:'BMO Field, Toronto',score:[1,1]},
    {h:'Qatar',a:'Switzerland',t:'13:00h',s:"Levi's, Santa Clara",score:[1,1]},
  ]},
  {g:'Grupo C · 13 jun',m:[
    {h:'Brazil',a:'Morocco',t:'18:00h',s:'MetLife, NJ',score:[1,1]},
    {h:'Haiti',a:'Scotland',t:'21:00h',s:'Gillette, Boston',score:[0,1]},
  ]},
  {g:'Grupo D · 12-13 jun',m:[
    {h:'USA',a:'Paraguay',t:'18:00h',s:'SoFi, Inglewood',score:[4,1]},
    {h:'Australia',a:'Turkey',t:'00:00h',s:'BC Place, Vancouver',score:[2,0]},
  ]},
  {g:'Grupo E · 14 jun',m:[
    {h:'Germany',a:'Curacao',t:'13:00h',s:'NRG, Houston',score:[7,1]},
    {h:"Cote d'Ivoire",a:'Ecuador',t:'19:00h',s:'Lincoln, Philadelphia',score:[1,0]},
  ]},
  {g:'Grupo F · 14 jun',m:[
    {h:'Netherlands',a:'Japan',t:'15:00h',s:'AT&T, Arlington',score:[2,2]},
    {h:'Sweden',a:'Tunisia',t:'19:00h',s:'BBVA, Guadalupe',score:[5,1]},
  ]},
  {g:'Grupo G · 15 jun',m:[
    {h:'Belgium',a:'Egypt',t:'12:00h',s:'Lumen, Seattle',score:[1,1]},
    {h:'Iran',a:'New Zealand',t:'15:00h',s:'Empower, Denver',score:[2,2]},
  ]},
  {g:'Grupo H · 15 jun',m:[
    {h:'Spain',a:'Cape Verde',t:'12:00h',s:'Mercedes-Benz, Atlanta',score:[0,0]},
    {h:'Saudi Arabia',a:'Uruguay',t:'15:00h',s:'Hard Rock, Miami',score:[1,1]},
  ]},
  {g:'Grupo I · 16 jun',m:[
    {h:'France',a:'Senegal',t:'15:00h',s:'MetLife, NJ',score:[3,1]},
    {h:'Iraq',a:'Norway',t:'18:00h',s:'Gillette, Boston',score:[1,4]},
  ]},
  {g:'Grupo J · 16 jun',m:[
    {h:'Argentina',a:'Algeria',t:'21:00h',s:'Arrowhead, KC',score:[3,0]},
    {h:'Austria',a:'Jordan',t:'00:00h',s:"Levi's, SF",score:[3,1]},
  ]},
  {g:'Grupo K · 17 jun',m:[
    {h:'Portugal',a:'DR Congo',t:'12:00h',s:'NRG, Houston',score:[1,1]},
    {h:'Colombia',a:'Uzbekistan',t:'21:00h',s:'Estadio Azteca',score:[3,1]},
  ]},
  {g:'Grupo L · 17 jun',m:[
    {h:'England',a:'Croatia',t:'15:00h',s:'AT&T, Arlington',score:[4,2]},
    {h:'Ghana',a:'Panama',t:'18:00h',s:'BMO Field, Toronto',score:[1,0]},
  ]},
  {g:'Grupo A/B · 18 jun (Jornada 2)',m:[
    {h:'Mexico',a:'South Korea',t:'19:00h',s:'Estadio Guadalajara',score:[1,0]},
    {h:'Czech Republic',a:'South Africa',t:'10:00h',s:'Mercedes-Benz, Atlanta',score:[1,1]},
    {h:'Switzerland',a:'Bosnia-Herzegovina',t:'13:00h',s:'Los Ángeles',score:[4,1]},
    {h:'Canada',a:'Qatar',t:'16:00h',s:'BC Place, Vancouver',score:[6,0]},
  ]},
  {g:'Grupo C/D · 19 jun (Jornada 2)',m:[
    {h:'Scotland',a:'Morocco',t:'16:00h',s:'Gillette, Boston'},
    {h:'Brazil',a:'Haiti',t:'19:00h',s:'Lincoln, Philadelphia'},
    {h:'USA',a:'Australia',t:'13:00h',s:'Lumen, Seattle'},
    {h:'Turkey',a:'Paraguay',t:'22:00h',s:"Levi's, SF"},
  ]},
  {g:'Grupo E/F · 20 jun (Jornada 2)',m:[
    {h:'Germany',a:"Cote d'Ivoire",t:'14:00h',s:'BMO Field, Toronto'},
    {h:'Ecuador',a:'Curacao',t:'18:00h',s:'Arrowhead, KC'},
    {h:'Netherlands',a:'Belgium',t:'11:00h',s:'NRG, Houston'},
    {h:'Tunisia',a:'Japan',t:'22:00h',s:'Monterrey'},
  ]},
  {g:'Grupo G/H · 21 jun (Jornada 2)',m:[
    {h:'Belgium',a:'Iran',t:'13:00h',s:'Los Ángeles'},
    {h:'New Zealand',a:'Egypt',t:'19:00h',s:'BC Place, Vancouver'},
    {h:'Spain',a:'Saudi Arabia',t:'10:00h',s:'Mercedes-Benz, Atlanta'},
    {h:'Uruguay',a:'Cape Verde',t:'16:00h',s:'Hard Rock, Miami'},
  ]},
  {g:'Grupo I/J · 22 jun (Jornada 2)',m:[
    {h:'France',a:'Iraq',t:'15:00h',s:'Lincoln, Philadelphia'},
    {h:'Norway',a:'Senegal',t:'18:00h',s:'MetLife, NJ'},
    {h:'Argentina',a:'Austria',t:'13:00h',s:'AT&T, Dallas'},
    {h:'Jordan',a:'Algeria',t:'23:00h',s:"Levi's, SF"},
  ]},
  {g:'Grupo K/L · 23 jun (Jornada 2)',m:[
    {h:'Portugal',a:'Uzbekistan',t:'13:00h',s:'NRG, Houston'},
    {h:'Colombia',a:'DR Congo',t:'22:00h',s:'Estadio Guadalajara'},
    {h:'England',a:'Ghana',t:'16:00h',s:'Gillette, Boston'},
    {h:'Panama',a:'Croatia',t:'19:00h',s:'BMO Field, Toronto'},
  ]},
];


// ═══ MODELO ═══
function getH2H(t1,t2){
  const k1=t1+'|'+t2,k2=t2+'|'+t1;
  if(H2H[k1])return{data:H2H[k1],t1First:true};
  if(H2H[k2])return{data:H2H[k2],t1First:false};
  return null;
}

function getXG(team,asAtt,neutral,isHome){
  const m=MODEL[team],wc=WC_REAL[team];
  if(!m)return asAtt?1.2:1.1;
  let base=asAtt
    ?(!neutral&&isHome&&m.homeGF?m.homeGF:!neutral&&!isHome&&m.awayGF?m.awayGF:m.avgGF)
    :(!neutral&&isHome&&m.homeGA?m.homeGA:!neutral&&!isHome&&m.awayGA?m.awayGA:m.avgGA);
  if(wc&&wc.pj>0){const wv=asAtt?wc.avgGF:wc.avgGA,wr=Math.min(.7,wc.pj*.2);base=base*(1-wr)+wv*wr;}
  return Math.max(0.15,base);
}

function modelProbs(home,away,neutral){
  const mH=MODEL[home]||{avgGF:1.35,avgGA:1.1,elo:1500};
  const mA=MODEL[away]||{avgGF:1.35,avgGA:1.1,elo:1500};
  const eloH=(mH.elo||1500)+(neutral?0:60);
  const eloA=mA.elo||1500;
  const eloExpH=1/(1+Math.pow(10,(eloA-eloH)/400));
  const eloExpA=1-eloExpH;
  let xgH=Math.max(0.15,(getXG(home,true,neutral,true)*getXG(away,false,neutral,false))/LEAGUE_AVG);
  let xgA=Math.max(0.15,(getXG(away,true,neutral,false)*getXG(home,false,neutral,true))/LEAGUE_AVG);
  const hd=getH2H(home,away);
  if(hd&&hd.data.n>=3){
    const d=hd.data;
    xgH=xgH*.85+(hd.t1First?d.avgGF1:d.avgGA1)*.15;
    xgA=xgA*.85+(hd.t1First?d.avgGA1:d.avgGF1)*.15;
  }
  const poi=(l,k)=>{let p=Math.exp(-l);for(let i=0;i<k;i++)p*=l/(i+1);return p;};
  let pH=0,pD=0,pA=0,pO=0,pB=0;
  for(let i=0;i<=10;i++)for(let j=0;j<=10;j++){
    const p=poi(xgH,i)*poi(xgA,j);
    if(i>j)pH+=p;else if(i===j)pD+=p;else pA+=p;
    if(i+j>2.5)pO+=p;
    if(i>0&&j>0)pB+=p;
  }
  const bH=0.5*pH+0.5*eloExpH*(1-pD);
  const bA=0.5*pA+0.5*eloExpA*(1-pD);
  const bD=Math.max(0,1-bH-bA);
  return{home:bH,draw:bD,away:bA,over25:pO,under25:1-pO,btts:pB,xgH,xgA,eloH:mH.elo||1500,eloA:mA.elo||1500};
}

// ═══ BEST PICK ═══
function bestPick(home,away,p){
  const opts=[
    {label:'Gana '+home,prob:p.home},
    {label:'Empate',prob:p.draw},
    {label:'Gana '+away,prob:p.away},
    {label:'Over 2.5',prob:p.over25},
    {label:'Under 2.5',prob:p.under25},
    {label:'BTTS Sí',prob:p.btts},
  ];
  const winner=opts.slice(0,3).reduce((a,b)=>a.prob>b.prob?a:b);
  return winner.prob>=0.38?winner:opts.reduce((a,b)=>a.prob>b.prob?a:b);
}

// ═══ HOME: TOP STRIP ═══
function buildTopStrip(){
  const el=document.getElementById('top-strip-content');
  if(!el)return;
  const allPicks=[];
  FIXTURES.forEach(g=>g.m.forEach(m=>{
    if(m.score)return;
    const p=modelProbs(m.h,m.a,true);
    const bp=bestPick(m.h,m.a,p);
    allPicks.push({match:m.h+' vs '+m.a,time:m.t,pick:bp.label,prob:bp.prob,fair:1/bp.prob,xgH:p.xgH,xgA:p.xgA});
  }));
  allPicks.sort((a,b)=>b.prob-a.prob);
  const top=allPicks.slice(0,4);
  let h='';
  top.forEach((pk,i)=>{
    const hi=pk.prob>=0.45;
    h+='<div style="display:flex;align-items:center;gap:10px;padding:7px 0;'+(i<top.length-1?'border-bottom:1px solid var(--b);':'')+'">';
    h+='<div style="flex:1;min-width:0;">';
    h+='<div style="font-size:13px;font-weight:500;">'+pk.match+'</div>';
    h+='<div style="font-size:11px;color:var(--mu);">'+pk.time+'</div>';
    h+='</div>';
    h+='<span style="font-size:12px;color:var(--mu);flex-shrink:0;">'+pk.pick+'</span>';
    h+='<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:'+(hi?'var(--gdim)':'var(--adim)')+';border:1px solid '+(hi?'var(--gbr)':'var(--abr)')+';color:'+(hi?'var(--gn)':'var(--am)')+';">'+(pk.prob*100).toFixed(0)+'% probable</span>';
    h+='</div>';
  });
  el.innerHTML=h;
}

// ═══ HOME: MATCH LIST ═══
function buildMatches(){
  const el=document.getElementById('match-list');
  if(!el)return;
  let h='';
  FIXTURES.forEach(g=>{
    h+='<div style="margin-bottom:1.5rem;">';
    h+='<div style="font-size:12px;font-weight:600;color:var(--mu);padding:5px 0;border-bottom:1px solid var(--b);margin-bottom:8px;">'+g.g+'</div>';
    g.m.forEach(m=>{
      const played=!!m.score;
      let pickLabel='',pickProb=0,fairOdd=0,hasH2H=false;
      if(!played){
        const p=modelProbs(m.h,m.a,true);
        const hd=getH2H(m.h,m.a);
        hasH2H=!!(hd&&hd.data&&hd.data.n>=3);
        const bp=bestPick(m.h,m.a,p);
        pickLabel=bp.label;pickProb=bp.prob;fairOdd=1/bp.prob;
      }
      const src=MODEL[m.h]&&MODEL[m.a]?(hasH2H?'📡 con historial entre ellos':'📡 con datos reales'):'📊 estimado';
      const hi=fairOdd>=1.8;
      const bdr=!played&&pickLabel?'border-left:3px solid var(--am);border-radius:0 10px 10px 0;':'border-radius:10px;';
      h+='<div style="background:var(--sur);border:0.5px solid var(--b);'+bdr+'padding:12px 14px;margin-bottom:8px;">';
      h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
      h+='<div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;">';
      h+='<span style="font-size:17px;">'+(FLAGS[m.h]||'🏳️')+'</span>';
      h+='<span>'+m.h+'</span><span style="font-size:11px;color:var(--mu);">vs</span>';
      h+='<span>'+m.a+'</span><span style="font-size:17px;">'+(FLAGS[m.a]||'🏳️')+'</span>';
      if(played)h+='<span style="font-family:\\'Space Grotesk\\',sans-serif;font-size:13px;font-weight:700;color:var(--am);background:var(--adim);border:1px solid var(--abr);padding:2px 8px;border-radius:6px;">'+m.score[0]+'-'+m.score[1]+'</span>';
      h+='</div><span style="font-size:11px;color:var(--mu);">'+m.t+'</span></div>';
      h+='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
      if(!played&&pickLabel){
        h+='<span style="font-size:12px;color:var(--mu);">Nuestra sugerencia:</span>';
        h+='<span style="font-size:12px;font-weight:500;">'+pickLabel+'</span>';
        h+='<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:'+(hi?'var(--gdim)':'var(--adim)')+';border:1px solid '+(hi?'var(--gbr)':'var(--abr)')+';color:'+(hi?'var(--gn)':'var(--am)')+';">'+(pickProb*100).toFixed(0)+'% probable</span>';
      }else if(played){
        h+='<span style="font-size:12px;color:var(--mu2);">Finalizado</span>';
      }else{
        h+='<span style="font-size:12px;color:var(--mu2);font-style:italic;">Está muy parejo, no tenemos una sugerencia clara</span>';
      }
      h+='<span style="font-size:10px;color:var(--bl);background:var(--bdim);border:1px solid rgba(59,130,246,.2);padding:1px 6px;border-radius:10px;margin-left:auto;">'+src+'</span>';
      h+='</div></div>';
    });
    h+='</div>';
  });
  el.innerHTML=h;
}

// ═══ HISTORIAL MUNDIAL ═══
// ═══ DATOS DE RESULTADOS — genérico, listo para cualquier torneo ═══
// Cada torneo es un objeto independiente; TOURNAMENT_RESULTS guarda el activo.
// Para agregar otro campeonato (ej. Liga de Chile) solo se necesita un array nuevo
// con el mismo formato {d, dateKey, h, a, gh, ga} y cambiar ACTIVE_TOURNAMENT.
const TOURNAMENTS = {
  wc2026: {
    label: 'Mundial 2026',
    eyebrow: '📊 Lo que ya pasó',
    subtitle: 'Aquí ves los resultados reales de los partidos del Mundial 2026 que ya se jugaron.',
    results: [
      {d:'18 jun',dateKey:'2026-06-18',h:'Mexico',a:'South Korea',gh:1,ga:0},
      {d:'18 jun',dateKey:'2026-06-18',h:'Czech Republic',a:'South Africa',gh:1,ga:1},
      {d:'18 jun',dateKey:'2026-06-18',h:'Switzerland',a:'Bosnia-Herzegovina',gh:4,ga:1},
      {d:'18 jun',dateKey:'2026-06-18',h:'Canada',a:'Qatar',gh:6,ga:0},
      {d:'17 jun',dateKey:'2026-06-17',h:'Portugal',a:'DR Congo',gh:1,ga:1},
      {d:'17 jun',dateKey:'2026-06-17',h:'Colombia',a:'Uzbekistan',gh:3,ga:1},
      {d:'17 jun',dateKey:'2026-06-17',h:'England',a:'Croatia',gh:4,ga:2},
      {d:'17 jun',dateKey:'2026-06-17',h:'Ghana',a:'Panama',gh:1,ga:0},
      {d:'16 jun',dateKey:'2026-06-16',h:'France',a:'Senegal',gh:3,ga:1},
      {d:'16 jun',dateKey:'2026-06-16',h:'Iraq',a:'Norway',gh:1,ga:4},
      {d:'16 jun',dateKey:'2026-06-16',h:'Argentina',a:'Algeria',gh:3,ga:0},
      {d:'16 jun',dateKey:'2026-06-16',h:'Austria',a:'Jordan',gh:3,ga:1},
      {d:'15 jun',dateKey:'2026-06-15',h:'Belgium',a:'Egypt',gh:1,ga:1},
      {d:'15 jun',dateKey:'2026-06-15',h:'Iran',a:'New Zealand',gh:2,ga:2},
      {d:'15 jun',dateKey:'2026-06-15',h:'Spain',a:'Cape Verde',gh:0,ga:0},
      {d:'15 jun',dateKey:'2026-06-15',h:'Saudi Arabia',a:'Uruguay',gh:1,ga:1},
      {d:'14 jun',dateKey:'2026-06-14',h:'Germany',a:'Curacao',gh:7,ga:1},
      {d:'14 jun',dateKey:'2026-06-14',h:"Cote d'Ivoire",a:'Ecuador',gh:1,ga:0},
      {d:'14 jun',dateKey:'2026-06-14',h:'Netherlands',a:'Japan',gh:2,ga:2},
      {d:'14 jun',dateKey:'2026-06-14',h:'Sweden',a:'Tunisia',gh:5,ga:1},
      {d:'13 jun',dateKey:'2026-06-13',h:'Brazil',a:'Morocco',gh:1,ga:1},
      {d:'13 jun',dateKey:'2026-06-13',h:'Haiti',a:'Scotland',gh:0,ga:1},
      {d:'13 jun',dateKey:'2026-06-13',h:'Australia',a:'Turkey',gh:2,ga:0},
      {d:'13 jun',dateKey:'2026-06-13',h:'Qatar',a:'Switzerland',gh:1,ga:1},
      {d:'12 jun',dateKey:'2026-06-12',h:'Canada',a:'Bosnia-Herzegovina',gh:1,ga:1},
      {d:'12 jun',dateKey:'2026-06-12',h:'USA',a:'Paraguay',gh:4,ga:1},
      {d:'11 jun',dateKey:'2026-06-11',h:'South Korea',a:'Czech Republic',gh:2,ga:1},
      {d:'11 jun',dateKey:'2026-06-11',h:'Mexico',a:'South Africa',gh:2,ga:0},
    ],
  },
  // Espacio reservado para futuros torneos, ej:
  // chile2026: { label:'Liga de Chile', eyebrow:'📊 Lo que ya pasó', subtitle:'...', results:[...] },
};

const ACTIVE_TOURNAMENT = 'wc2026';
let selectedDateKey = 'all';

function buildHist(){
  const t = TOURNAMENTS[ACTIVE_TOURNAMENT];
  if(!t)return;

  const eyebrowEl=document.getElementById('hist-eyebrow');
  const titleEl=document.getElementById('hist-title');
  const subEl=document.getElementById('hist-subtitle');
  if(eyebrowEl)eyebrowEl.textContent=t.eyebrow;
  if(titleEl)titleEl.textContent='Partidos ya jugados';
  if(subEl)subEl.textContent=t.subtitle;

  buildDateScroll(t.results);
  renderHistList(t.results);
}

function buildDateScroll(results){
  const el=document.getElementById('date-scroll');
  if(!el)return;

  // Agrupar partidos por fecha, ordenados de más reciente a más antigua
  const byDate={};
  results.forEach(m=>{
    if(!byDate[m.dateKey])byDate[m.dateKey]={d:m.d,count:0};
    byDate[m.dateKey].count++;
  });
  const dateKeys=Object.keys(byDate).sort((a,b)=>b.localeCompare(a));

  const monthNames={'01':'ene','02':'feb','03':'mar','04':'abr','05':'may','06':'jun','07':'jul','08':'ago','09':'sep','10':'oct','11':'nov','12':'dic'};

  let h='';
  h+='<div class="date-chip'+(selectedDateKey==='all'?' active':'')+'" onclick="selectDate(\\'all\\')">';
  h+='<div class="dc-day">Todo</div><div class="dc-month">'+results.length+' partidos</div>';
  h+='</div>';

  dateKeys.forEach(key=>{
    const day=key.split('-')[2];
    const month=monthNames[key.split('-')[1]]||'';
    const isActive=selectedDateKey===key;
    h+='<div class="date-chip'+(isActive?' active':'')+'" onclick="selectDate(\\''+key+'\\')">';
    h+='<div class="dc-day">'+day+'</div><div class="dc-month">'+month+'</div>';
    h+='<div class="dc-count">'+byDate[key].count+' partido'+(byDate[key].count!==1?'s':'')+'</div>';
    h+='</div>';
  });

  el.innerHTML=h;
}

function selectDate(key){
  selectedDateKey=key;
  const t=TOURNAMENTS[ACTIVE_TOURNAMENT];
  if(!t)return;
  buildDateScroll(t.results);
  renderHistList(t.results);
}

function renderHistList(results){
  const el=document.getElementById('hist-list');
  if(!el)return;

  const filtered=selectedDateKey==='all'?results:results.filter(m=>m.dateKey===selectedDateKey);

  if(!filtered.length){
    el.innerHTML='<div style="text-align:center;padding:2.5rem 1rem;color:var(--mu);">No hay partidos para esta fecha.</div>';
    return;
  }

  let h='';
  filtered.forEach(m=>{
    const totalGoals=m.gh+m.ga;
    h+='<div class="result-row">';
    h+='<span class="rr-date">'+m.d+'</span>';
    h+='<span class="rr-team"><span class="rr-flag">'+(FLAGS[m.h]||'🏳️')+'</span>'+m.h+'</span>';
    h+='<span class="rr-score">'+m.gh+' - '+m.ga+'</span>';
    h+='<span class="rr-team right">'+m.a+'<span class="rr-flag">'+(FLAGS[m.a]||'🏳️')+'</span></span>';
    h+='<span class="rr-tag">'+(totalGoals>2?'Más de 2.5':'Menos de 2.5')+'</span>';
    h+='</div>';
  });
  el.innerHTML=h;
}

// ═══ CALC ═══
let fmt='decimal';


function buildSelect(){
  const sel=document.getElementById('fsel');
  if(!sel)return;
  FIXTURES.forEach(g=>{
    const og=document.createElement('optgroup');og.label=g.g;
    g.m.forEach(m=>{
      const o=document.createElement('option');
      o.value=JSON.stringify(m);
      o.textContent=m.t+' · '+m.h+' vs '+m.a+(m.score?' ✓':'');
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  const first=Array.from(sel.options).find(o=>{try{return!JSON.parse(o.value).score;}catch{return false;}});
  if(first)sel.value=first.value;
  onFC();
}

function onFC(){
  try{
    const m=JSON.parse(document.getElementById('fsel').value);
    document.getElementById('th').value=m.h;
    document.getElementById('ta').value=m.a;
    document.getElementById('stad').textContent=m.s||'';
    document.getElementById('lh').textContent=m.h+' (1)';
    document.getElementById('la').textContent=m.a+' (2)';
    document.getElementById('l1').textContent=m.h+' (1)';
    document.getElementById('l2').textContent=m.a+' (2)';
    const ldnbh=document.getElementById('lbl-dnbh'); if(ldnbh)ldnbh.textContent='Gana '+m.h+' (sin contar empate)';
    const ldnba=document.getElementById('lbl-dnba'); if(ldnba)ldnba.textContent='Gana '+m.a+' (sin contar empate)';
    const ldc1x=document.getElementById('lbl-dc1x'); if(ldc1x)ldc1x.textContent='Gana '+m.h+' o empatan';
    const ldcx2=document.getElementById('lbl-dcx2'); if(ldcx2)ldcx2.textContent='Empatan o gana '+m.a;
    const ldc12=document.getElementById('lbl-dc12'); if(ldc12)ldc12.textContent='Gana '+m.h+' o gana '+m.a+' (no hay empate)';
    ['obn','odnbh','odnba','odc1x','odcx2','odc12'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    const llh=document.getElementById('live-lbl-h'); if(llh)llh.textContent='Goles '+m.h;
    const lla=document.getElementById('live-lbl-a'); if(lla)lla.textContent='Goles '+m.a;
    const lrh=document.getElementById('live-lbl-rh'); if(lrh)lrh.textContent='🟥 Expulsados '+m.h;
    const lra=document.getElementById('live-lbl-ra'); if(lra)lra.textContent='🟥 Expulsados '+m.a;
    ['oh','od','oa','oo','ou','ob'].forEach(id=>document.getElementById(id).value='');
    const lrhI=document.getElementById('live-rh'); if(lrhI)lrhI.value='0';
    const lraI=document.getElementById('live-ra'); if(lraI)lraI.value='0';
    document.getElementById('res').classList.add('hidden');
    // Reset live mode when changing fixture
    const lt=document.getElementById('live-toggle');
    if(lt){lt.checked=false;toggleLive();}
  }catch(e){}
}

function setFmt(f){
  fmt=f;
  document.getElementById('fmt-dec').style.background=f==='decimal'?'var(--adim)':'transparent';
  document.getElementById('fmt-dec').style.color=f==='decimal'?'var(--am)':'var(--tx)';
  document.getElementById('fmt-am').style.background=f==='american'?'var(--adim)':'transparent';
  document.getElementById('fmt-am').style.color=f==='american'?'var(--am)':'var(--tx)';
}

function setRT(t,el){
  document.querySelectorAll('#page-calc .tab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tmain').classList.toggle('hidden',t!=='main');
  document.getElementById('tsec').classList.toggle('hidden',t!=='sec');
}

function toggleExtraMarkets(){
  const el=document.getElementById('extra-markets');
  const arrow=document.getElementById('extra-arrow');
  const isHidden=el.classList.contains('hidden');
  el.classList.toggle('hidden');
  arrow.textContent=isHidden?'▾':'▸';
}

function toD(v){
  if(!v||v===''||isNaN(v))return null;
  v=parseFloat(v);
  return fmt==='american'?(v>0?(v/100)+1:(100/Math.abs(v))+1):v;
}

function eC(mp,odd){
  if(!odd)return{txt:'—',cls:'eu',ev:null};
  const e=(mp-1/odd)*100,ev=(mp*odd-1)*100;
  return{txt:(e>=0?'+':'')+e.toFixed(1)+'%',cls:e>3?'ep':e<-3?'en':'eu',ev};
}
function fO(p){return p>0?(1/p).toFixed(2):'—';}

function toggleLive(){
  const on = document.getElementById('live-toggle').checked;
  document.getElementById('live-fields').classList.toggle('hidden', !on);
  const lbl = document.getElementById('live-card').querySelector('label[for="live-toggle"]');
  lbl.style.color = on ? 'var(--rd)' : 'var(--mu)';
  // No auto-calc here — evita confusión. El usuario calcula explícitamente con el botón
  // o al editar minuto/marcador (que sí dispara runCalc() vía oninput).
}

function isLive(){
  return document.getElementById('live-toggle') && document.getElementById('live-toggle').checked;
}

function getLiveState(){
  const min = parseInt(document.getElementById('live-min').value) || 0;
  const gh  = parseInt(document.getElementById('live-gh').value)  || 0;
  const ga  = parseInt(document.getElementById('live-ga').value)  || 0;
  const rh  = parseInt(document.getElementById('live-rh').value)  || 0;
  const ra  = parseInt(document.getElementById('live-ra').value)  || 0;
  return {min, gh, ga, rh, ra};
}

function remainingXG(xgFull, minute){
  const rem = Math.max(0, 90 - Math.min(minute, 90)) / 90;
  return xgFull * rem;
}

// Factores de impacto por expulsión (calibrado con literatura de fútbol: un jugador
// menos reduce ~25-30% el ataque propio y aumenta ~20-25% lo que concede el equipo)
const RED_CARD_ATT_PENALTY = 0.27; // reducción de ataque por cada expulsado
const RED_CARD_DEF_PENALTY = 0.22; // aumento de vulnerabilidad defensiva por cada expulsado

function applyRedCards(xgFor, xgAgainst, ownReds, oppReds){
  // El propio equipo con expulsados: ataca menos
  let xgForAdj = xgFor * Math.max(0.15, 1 - RED_CARD_ATT_PENALTY * ownReds);
  // El rival con expulsados favorece que ESTE equipo le anote más (rival defiende peor)
  xgForAdj = xgForAdj * (1 + RED_CARD_DEF_PENALTY * oppReds);
  return Math.max(0.05, xgForAdj);
}

function inPlayProbs(xgH, xgA, min, scoreH, scoreA, redH, redA){
  redH = redH || 0; redA = redA || 0;
  let xgHR = remainingXG(xgH, min);
  let xgAR = remainingXG(xgA, min);
  // Aplicar impacto de expulsiones sobre el xG restante
  xgHR = applyRedCards(xgHR, xgAR, redH, redA);
  xgAR = applyRedCards(xgAR, xgHR, redA, redH);
  const poi=(l,k)=>{let p=Math.exp(-l);for(let i=0;i<k;i++)p*=l/(i+1);return p;};
  let pH=0,pD=0,pA=0,pO=0,pB=0;
  for(let i=0;i<=10;i++)for(let j=0;j<=10;j++){
    const p=poi(xgHR,i)*poi(xgAR,j);
    const tH=scoreH+i, tA=scoreA+j;
    if(tH>tA) pH+=p; else if(tH===tA) pD+=p; else pA+=p;
    if(tH+tA>2.5) pO+=p;
    if(tH>0&&tA>0) pB+=p;
  }
  // If already over 2.5 goals in current score, over is 100%
  if(scoreH+scoreA>2) pO=1;
  // BTTS already?
  if(scoreH>0&&scoreA>0) pB=1;
  return {home:pH,draw:pD,away:pA,over25:pO,under25:1-pO,btts:pB,xgHR,xgAR,redH,redA};
}

let currentMarkets=[];
let currentSecMarkets=[];
let bbSelected=[];

function updateSecOdd(idx,val){
  const odd=parseFloat(val);
  if(currentSecMarkets[idx]&&odd>=1.01){
    currentSecMarkets[idx].odd=odd;
    updateBetBuilder();
  }
}

function updateBetBuilder(){
  const checksMain=document.querySelectorAll('.bb-check:checked');
  const checksSec=document.querySelectorAll('.bb-sec-check:checked');
  const mainPicks=Array.from(checksMain).map(c=>currentMarkets[parseInt(c.dataset.idx)]);
  const secPicks=Array.from(checksSec).map(c=>currentSecMarkets[parseInt(c.dataset.idx)]).filter(m=>m);
  bbSelected=[...mainPicks,...secPicks];
  const countEl=document.getElementById('bb-count');
  const legsEl=document.getElementById('bb-legs');
  const summaryEl=document.getElementById('bb-summary');
  const btnEl=document.getElementById('bb-register-btn');

  countEl.textContent=bbSelected.length+' seleccionado'+(bbSelected.length!==1?'s':'');

  if(!bbSelected.length){
    legsEl.innerHTML='<div style="font-size:12px;color:var(--mu2);font-style:italic;padding:8px 0;">Marca las casillas de la tabla de arriba para armar tu apuesta combinada.</div>';
    summaryEl.classList.add('hidden');
    btnEl.disabled=true;
    btnEl.style.opacity='.4';
    btnEl.style.cursor='not-allowed';
    return;
  }

  let legsHtml='';
  let combOdd=1, combProb=1;
  bbSelected.forEach((m,i)=>{
    combOdd*=m.odd;
    combProb*=m.prob;
    legsHtml+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;'+(i<bbSelected.length-1?'border-bottom:1px solid var(--b);':'')+'">';
    legsHtml+='<span style="font-size:10px;font-weight:700;color:var(--mu);width:18px;">'+(i+1)+'</span>';
    legsHtml+='<span style="font-size:12px;flex:1;">'+m.label+'</span>';
    legsHtml+='<span style="font-family:\\'Space Grotesk\\',sans-serif;font-size:13px;font-weight:600;color:var(--bl);">'+m.odd.toFixed(2)+'</span>';
    legsHtml+='</div>';
  });
  legsEl.innerHTML=legsHtml;

  document.getElementById('bb-odd').textContent=combOdd.toFixed(2);
  document.getElementById('bb-prob').textContent=(combProb*100).toFixed(1)+'%';
  summaryEl.classList.remove('hidden');
  btnEl.disabled=false;
  btnEl.style.opacity='1';
  btnEl.style.cursor='pointer';
}

function registerBetBuilder(){
  if(!bbSelected.length)return;
  const home=document.getElementById('th').value.trim()||'Local';
  const away=document.getElementById('ta').value.trim()||'Visitante';
  const stake=parseFloat(document.getElementById('bb-stake').value)||1;
  const bookie=document.getElementById('bb-bookie').value;

  let combOdd=1, combProb=1;
  const pickLabels=bbSelected.map(m=>{
    combOdd*=m.odd;
    combProb*=m.prob;
    return m.label;
  });

  const isCombo=bbSelected.length>1;
  const pickText=isCombo
    ? 'Combinada ('+bbSelected.length+'): '+pickLabels.join(' + ')
    : pickLabels[0];

  const ev=((combProb*combOdd-1)*100);

  myBets.unshift({
    id:Date.now(),
    match:home+' vs '+away,
    pick:pickText,
    odds:parseFloat(combOdd.toFixed(2)),
    stake,
    ev:parseFloat(ev.toFixed(1)),
    date:new Date().toISOString().split('T')[0],
    bookie,
    comp:'Mundial 2026',
    result:'open',
    pl:0
  });
  mySave();

  // Reset bet builder
  document.querySelectorAll('.bb-check').forEach(c=>c.checked=false);
  updateBetBuilder();

  // Confirm and navigate
  alert('✓ Apuesta registrada en Mis Apuestas → Abiertas\\n\\n'+pickText+'\\nCuota: '+combOdd.toFixed(2)+' · Stake: '+stake+'u');
  gp('mybet', document.querySelectorAll('.nl')[3]);
  setMyTab('abiertas', document.querySelectorAll('#page-mybet .tab')[1]);
}

function runCalc(){
  const home=document.getElementById('th').value.trim()||'Local';
  const away=document.getElementById('ta').value.trim()||'Visitante';
  const neutral=document.getElementById('neutral').checked;
  const odds={
    home:toD(document.getElementById('oh').value),
    draw:toD(document.getElementById('od').value),
    away:toD(document.getElementById('oa').value),
    over25:toD(document.getElementById('oo').value),
    under25:toD(document.getElementById('ou').value),
    btts:toD(document.getElementById('ob').value),
    bttsNo:toD(document.getElementById('obn')?.value),
    dc1x:toD(document.getElementById('odc1x')?.value),
    dcx2:toD(document.getElementById('odcx2')?.value),
    dc12:toD(document.getElementById('odc12')?.value),
    dnbHome:toD(document.getElementById('odnbh')?.value),
    dnbAway:toD(document.getElementById('odnba')?.value),
  };
  const pFull=modelProbs(home,away,neutral);
  const mH=MODEL[home],mA=MODEL[away];
  const wcH=WC_REAL[home],wcA=WC_REAL[away];
  const hd=getH2H(home,away);
  const live=isLive();
  const lv=live?getLiveState():{min:0,gh:0,ga:0,rh:0,ra:0};
  const p=live ? inPlayProbs(pFull.xgH,pFull.xgA,lv.min,lv.gh,lv.ga,lv.rh,lv.ra) : pFull;
  if(live){
    p.eloH=pFull.eloH; p.eloA=pFull.eloA;
    p.xgH=p.xgHR; p.xgA=p.xgAR; // alias para que el resto del código (teamBox, etc.) siempre tenga xgH/xgA
  }

  // H2H box
  const h2hbox=document.getElementById('h2hbox');
  if(hd&&hd.data&&hd.data.n>0){
    const d=hd.data;
    const w1=hd.t1First?d.w1:d.l1,l1=hd.t1First?d.l1:d.w1;
    const gfH=(hd.t1First?d.avgGF1:d.avgGA1).toFixed(1);
    const gfA=(hd.t1First?d.avgGA1:d.avgGF1).toFixed(1);
    let hr='';
    [['Partidos',d.n],[home+' ganó',w1],['Empates',d.d],[away+' ganó',l1],['GF/pj '+home,gfH],['GF/pj '+away,gfA]].forEach(([l,v])=>{
      hr+='<div class="h2h-s"><div class="hl">'+l+'</div><div class="hv">'+v+'</div></div>';
    });
    document.getElementById('h2hrow').innerHTML=hr;
    h2hbox.classList.remove('hidden');
  }else h2hbox.classList.add('hidden');

  document.getElementById('xnh').textContent=home;
  document.getElementById('xna').textContent=away;
  // Live mode: show remaining xG, not full match xG
  if(live){
    document.getElementById('xvh').textContent=p.xgHR.toFixed(2);
    document.getElementById('xva').textContent=p.xgAR.toFixed(2);
    const timeRem=Math.max(0,90-lv.min);
    const calcTime=new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const redTxt=(lv.rh>0||lv.ra>0)
      ?' · 🟥 '+(lv.rh>0?home+' ('+lv.rh+')':'')+(lv.rh>0&&lv.ra>0?' · ':'')+(lv.ra>0?away+' ('+lv.ra+')':'')
      :'';
    document.getElementById('slbl').innerHTML=
      '<span style="color:var(--rd);font-weight:600;">⚡ EN VIVO</span> '
      +'Min '+lv.min+' · '+lv.gh+'-'+lv.ga+' · '+timeRem+'min restantes'+redTxt
      +' <span style="color:var(--mu2);">(calculado '+calcTime+')</span>';
    // Update live labels
    const lh=document.getElementById('live-lbl-h');
    const la=document.getElementById('live-lbl-a');
    if(lh)lh.textContent='Goles '+home;
    if(la)la.textContent='Goles '+away;
  } else {
    document.getElementById('xvh').textContent=pFull.xgH.toFixed(2);
    document.getElementById('xva').textContent=pFull.xgA.toFixed(2);
    document.getElementById('slbl').textContent=neutral?'Sede neutral':'Con ventaja local';
  }

  const srcLabel=wcH&&wcA?'<span style="color:var(--gn)">📡 Usa resultados reales de este Mundial</span>'
    :wcH||wcA?'<span style="color:var(--am)">📡 Mezcla resultados de este Mundial con historia previa</span>'
    :'<span style="color:var(--mu)">📊 Basado en 20 años de partidos anteriores</span>';
  document.getElementById('dsrc').innerHTML=srcLabel;
  // Update xG sub-labels
  const xgLblH=document.getElementById('xg-label-h');
  const xgLblA=document.getElementById('xg-label-a');
  if(xgLblH)xgLblH.textContent=live?'goles que le faltan por marcar':'goles que se espera que marque';
  if(xgLblA)xgLblA.textContent=live?'xG restantes':'xG esperados';
  const thModelo=document.getElementById('th-modelo');
  if(thModelo)thModelo.textContent=live?'Prob. restante':'Modelo';

  // Explanation panel
  const srcLbl=(t,wc,m)=>wc&&wc.pj>=3?'datos WC reales ('+wc.pj+'P)':wc&&wc.pj>0?'blend WC+hist':m?'histórico 20a ('+m.pj+'P)':'ELO';
  const defQ=(ga)=>ga>1.1?'débil':ga>0.85?'media':'sólida';
  function teamBox(t,wc,m,xgFin){
    const att=m?m.avgGF.toFixed(2):'—';
    const def=m?m.avgGA.toFixed(2)+' (defensa '+defQ(m.avgGA)+')':'—';
    const nivel=m?m.elo||1500:1500;
    const wr=m?(m.winRate*100).toFixed(0)+'%':'—';
    let box='<div style="background:var(--sur);border:0.5px solid var(--b);border-radius:8px;padding:10px 12px;">';
    box+='<div style="font-weight:500;margin-bottom:6px;">'+t+'</div>';
    box+='<div style="font-size:11px;color:var(--mu);">Datos usados: '+srcLbl(t,wc,m)+'</div>';
    box+='<div style="font-size:11px;color:var(--mu);">Nivel del equipo: <strong style="color:var(--bl);">'+nivel+'</strong> <span title="Número que resume qué tan fuerte es el equipo según sus resultados históricos. Mientras más alto, mejor.">ⓘ</span></div>';
    box+='<div style="font-size:11px;color:var(--mu);">Goles que suele anotar por partido: '+att+'</div>';
    box+='<div style="font-size:11px;color:var(--mu);">Goles que suele recibir por partido: '+def+'</div>';
    box+='<div style="font-size:11px;color:var(--mu);">Partidos ganados (histórico): '+wr+'</div>';
    box+='<div style="font-size:12px;font-weight:500;color:var(--bl);margin-top:6px;">Goles que se espera que marque hoy: '+(typeof xgFin==='number'?xgFin.toFixed(2):'—')+'</div>';
    box+='</div>';
    return box;
  }
  const h2hExpl=hd&&hd.data&&hd.data.n>=3?'Se tomó en cuenta que estos equipos ya se enfrentaron '+hd.data.n+' veces antes':'No hay suficientes partidos anteriores entre estos dos equipos para tomarlos en cuenta';
  const eloFav=p.eloH>p.eloA?home:away;
  let expl='<div style="background:var(--sur2);border:1px solid var(--b2);border-radius:10px;padding:14px 16px;margin-bottom:1rem;font-size:12px;line-height:1.9;">';
  expl+='<div style="font-size:11px;font-weight:600;color:var(--am);letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">🔍 Por qué el modelo piensa esto</div>';
  expl+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;">';
  expl+=teamBox(home,wcH,mH,p.xgH);
  expl+=teamBox(away,wcA,mA,p.xgA);
  expl+='</div>';
  expl+='<div style="border-top:0.5px solid var(--b);padding-top:8px;color:var(--mu);">';
  expl+='<div>Según el nivel histórico de cada equipo, el favorito es <strong style="color:var(--bl);">'+eloFav+'</strong>.</div>';
  expl+='<div style="margin-top:4px;">'+h2hExpl+'.</div>';
  if(live&&(lv.rh>0||lv.ra>0)){
    const redParts=[];
    if(lv.rh>0)redParts.push(home+' juega con '+lv.rh+' jugador'+(lv.rh>1?'es':'')+' menos');
    if(lv.ra>0)redParts.push(away+' juega con '+lv.ra+' jugador'+(lv.ra>1?'es':'')+' menos');
    expl+='<div style="color:var(--rd);margin-top:4px;">🟥 <strong style="color:var(--rd);">Jugadores expulsados:</strong> '+redParts.join(' · ')+'. Esto se tomó en cuenta: el equipo con menos jugadores ataca menos y le hacen más goles.</div>';
  }
  expl+='</div></div>';
  document.getElementById('explanation').innerHTML=expl;

  // Mercados derivados matemáticamente de home/draw/away/over/under/btts
  const dcHomeDraw = p.home + p.draw;       // Doble oportunidad: Local o Empate
  const dcAwayDraw = p.away + p.draw;       // Doble oportunidad: Visitante o Empate
  const dcHomeAway = p.home + p.away;       // Doble oportunidad: Local o Visitante
  const bttsNo = 1 - p.btts;                // Ambos anotan: No
  // Empate Apuesta No Válida (Draw No Bet): se anula el empate, se reparte proporcional
  const dnbHome = p.home / (p.home + p.away || 1);
  const dnbAway = p.away / (p.home + p.away || 1);

  const mkts=[
    {label:'Gana '+home+' (1)',modelP:p.home,odd:odds.home},
    {label:'Empate (X)',modelP:p.draw,odd:odds.draw},
    {label:'Gana '+away+' (2)',modelP:p.away,odd:odds.away},
    {label:'Over 2.5 goles',modelP:p.over25,odd:odds.over25},
    {label:'Under 2.5 goles',modelP:p.under25,odd:odds.under25},
    {label:'Ambos anotan (Sí)',modelP:p.btts,odd:odds.btts},
    {label:'Ambos anotan (No)',modelP:bttsNo,odd:odds.bttsNo},
    {label:'Doble oportunidad: '+home+' o Empate',modelP:dcHomeDraw,odd:odds.dc1x},
    {label:'Doble oportunidad: '+away+' o Empate',modelP:dcAwayDraw,odd:odds.dcx2},
    {label:'Doble oportunidad: '+home+' o '+away,modelP:dcHomeAway,odd:odds.dc12},
    {label:'Apuesta no válida: Gana '+home,modelP:dnbHome,odd:odds.dnbHome},
    {label:'Apuesta no válida: Gana '+away,modelP:dnbAway,odd:odds.dnbAway},
  ];
  let bestEV=-99;
  let mtb='';
  currentMarkets=[]; // reset for bet builder reference
  mkts.forEach((m,idx)=>{
    const e=eC(m.modelP,m.odd);
    if(e.ev!==null&&e.ev>bestEV)bestEV=e.ev;
    const fairOdd=fO(m.modelP);
    const usedOdd=m.odd||parseFloat(fairOdd);
    currentMarkets.push({label:m.label,prob:m.modelP,odd:usedOdd,match:home+' vs '+away});
    mtb+='<tr>';
    mtb+='<td><input type="checkbox" class="bb-check" data-idx="'+idx+'" onchange="updateBetBuilder()" style="width:15px;height:15px;accent-color:var(--gn);cursor:pointer;"/></td>';
    mtb+='<td style="font-weight:500;">'+m.label+'</td>';
    mtb+='<td title="'+(live?'Qué tan probable es esto desde ahora':'Qué tan probable cree el modelo que es esto')+'">'+(m.modelP*100).toFixed(1)+'%</td>';
    mtb+='<td>'+(m.odd?((1/m.odd)*100).toFixed(1)+'%':'—')+'</td>';
    mtb+='<td class="'+e.cls+'">'+e.txt+'</td>';
    mtb+='<td class="fo">'+fairOdd+'</td>';
    mtb+='<td>'+(e.ev!==null&&e.ev>5?'<span class="py">Conviene ✓</span>':m.odd?'<span class="ps">No conviene</span>':'')+'</td>';
    mtb+='</tr>';
  });
  document.getElementById('mtb').innerHTML=mtb;
  updateBetBuilder();

  const hasOdds=Object.values(odds).some(v=>v!==null);
  let enoteText='';
  if(live){
    const timeRem=Math.max(0,90-lv.min);
    const sc=lv.gh+'-'+lv.ga;
    enoteText='⚡ Partido en vivo: minuto '+lv.min+', van '+sc+'. Quedan unos '+timeRem+' minutos · '
      +(hasOdds?(bestEV>5?'¡Encontramos una apuesta con buen valor ahora mismo!'
        :'Los números ya están actualizados con el minuto y marcador actuales')
        :'Escribe las cuotas arriba para saber si conviene apostar');
  } else {
    enoteText=!hasOdds?'Escribe al menos una cuota arriba para que te digamos si conviene apostar.'
      :bestEV>5?'¡Buena noticia! Encontramos al menos una apuesta donde el modelo cree que tienes ventaja.'
      :'El modelo y la cuota están bastante de acuerdo. No hay una ventaja clara para apostar aquí.';
  }
  const enoteEl=document.getElementById('enote');
  enoteEl.textContent=enoteText;
  enoteEl.style.borderLeftColor=live?'var(--rd)':'var(--am)';
  enoteEl.style.background=live?'var(--rdim)':'var(--adim)';

  const xT=p.xgH+p.xgA,co=Math.round(xT*2.8+7),ta=Math.round(xT*0.8+2.5),sH=Math.round(p.xgH*5+3),sA=Math.round(p.xgA*5+2);
  let stb='';
  currentSecMarkets=[];
  // Secondary market definitions: label, estimate, typical line, isOver(bool for pick direction), overLabel, underLabel, suggested fair-ish odd, input id base
  const secDefs=[
    {lbl:'Corners totales',est:co,typ:co-2,isOver:co>10,y:'Over '+(co-2)+'.5',n:'Under '+(co-2)+'.5',fair:1.85,id:'sec-corners'},
    {lbl:'Tarjetas amarillas',est:ta,typ:ta-1,isOver:null,y:'Orientativo',n:'Orientativo',fair:null,id:'sec-cards'},
    {lbl:'Tiros a puerta '+home,est:sH,typ:sH-1,isOver:sH>4,y:'Over '+(sH-1)+'.5',n:'Under '+(sH-1)+'.5',fair:1.90,id:'sec-shotsh'},
    {lbl:'Tiros a puerta '+away,est:sA,typ:sA-1,isOver:sA>3,y:'Over '+(sA-1)+'.5',n:'Under '+(sA-1)+'.5',fair:1.90,id:'sec-shotsa'},
  ];
  secDefs.forEach((d,idx)=>{
    const hasPick=d.isOver!==null;
    const pickLabel=hasPick?(d.isOver?d.y:d.n):d.n;
    const pickProb=hasPick?0.55:null; // heuristic confidence, not a hard model probability
    if(hasPick){
      currentSecMarkets.push({label:d.lbl+': '+pickLabel,prob:pickProb,odd:d.fair,match:home+' vs '+away});
    }
    stb+='<tr>';
    stb+='<td>'+(hasPick?'<input type="checkbox" class="bb-sec-check" data-idx="'+idx+'" onchange="updateBetBuilder()" style="width:15px;height:15px;accent-color:var(--gn);cursor:pointer;"/>':'')+'</td>';
    stb+='<td>'+d.lbl+'</td>';
    stb+='<td>'+d.est+'</td>';
    stb+='<td>~'+d.typ+'</td>';
    stb+='<td><span class="'+(hasPick?'py':'ps')+'">'+pickLabel+'</span></td>';
    stb+='<td>'+(hasPick?'<input type="number" class="sec-odd-input" id="'+d.id+'" value="'+d.fair.toFixed(2)+'" step="0.01" min="1.01" style="width:64px;height:28px;padding:0 6px;font-size:12px;background:var(--sur2);border:1px solid var(--b2);color:var(--tx);border-radius:6px;" onchange="updateSecOdd('+idx+',this.value)"/>':'—')+'</td>';
    stb+='</tr>';
  });
  document.getElementById('stb').innerHTML=stb;
  document.getElementById('res').classList.remove('hidden');
}

// ═══ MIS APUESTAS ═══
const BETS_KEY='wc2026_mybets_v1';
let myBets=[];
let myFilter='all';
let myTab='nueva';
let myChartInst=null;

function mySave(){try{localStorage.setItem(BETS_KEY,JSON.stringify(myBets));}catch(e){}}
function myLoad(){try{myBets=JSON.parse(localStorage.getItem(BETS_KEY)||'[]');}catch(e){myBets=[];}}

function setMyTab(name,el){
  myTab=name;
  ['nueva','abiertas','historial'].forEach(t=>document.getElementById('my-'+t).classList.toggle('hidden',t!==name));
  document.querySelectorAll('#page-mybet .tab').forEach(b=>b.classList.remove('active'));
  if(el)el.classList.add('active');
  if(name==='historial')myRenderChart();
  myRender();
}

function myPreview(){
  const odds=parseFloat(document.getElementById('bf-odds').value);
  const stake=parseFloat(document.getElementById('bf-stake').value);
  const ev=parseFloat(document.getElementById('bf-ev').value);
  const el=document.getElementById('my-preview');
  if(!odds||!stake||odds<1.01){el.textContent='Escribe la cuota y cuánto apostaste para ver cuánto podrías ganar.';el.style.color='var(--mu)';return;}
  const win=((odds-1)*stake).toFixed(2);
  let txt='Si ganas, te llevas '+win+' de ganancia (además de recuperar lo que apostaste)';
  if(!isNaN(ev))txt+=' · Ventaja calculada: '+(ev>=0?'+':'')+ev.toFixed(1)+'%';
  el.textContent=txt;
  el.style.color=(!isNaN(ev)&&ev>0)?'var(--gn)':(!isNaN(ev)&&ev<0)?'var(--rd)':'var(--tx)';
}

function clearMyForm(){
  ['bf-match','bf-pick','bf-odds','bf-stake','bf-ev'].forEach(id=>document.getElementById(id).value='');
  const el=document.getElementById('my-preview');
  el.textContent='Ingresa cuota y stake para ver el retorno potencial.';
  el.style.color='var(--mu)';
}

function addMyBet(){
  const match=document.getElementById('bf-match').value.trim();
  const pick=document.getElementById('bf-pick').value.trim();
  const odds=parseFloat(document.getElementById('bf-odds').value);
  const stake=parseFloat(document.getElementById('bf-stake').value);
  const ev=parseFloat(document.getElementById('bf-ev').value);
  const date=document.getElementById('bf-date').value||new Date().toISOString().split('T')[0];
  const bookie=document.getElementById('bf-bookie').value;
  const comp=document.getElementById('bf-comp').value;
  if(!match||!pick||isNaN(odds)||isNaN(stake)||odds<1.01||stake<=0){alert('Completa: partido, pick, cuota y stake.');return;}
  myBets.unshift({id:Date.now(),match,pick,odds,stake,ev:isNaN(ev)?null:ev,date,bookie,comp,result:'open',pl:0});
  mySave();myRender();clearMyForm();
  setMyTab('abiertas',document.querySelectorAll('#page-mybet .tab')[1]);
}

function exportMyBets(){
  if(!myBets.length){alert('Todavía no has anotado ninguna apuesta, así que no hay nada que guardar.');return;}
  const dataStr=JSON.stringify(myBets,null,2);
  const blob=new Blob([dataStr],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const today=new Date().toISOString().split('T')[0];
  a.href=url;
  a.download='mis_apuestas_'+today+'.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importMyBets(event){
  const file=event.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const imported=JSON.parse(e.target.result);
      if(!Array.isArray(imported)){alert('Este archivo no se puede usar. Asegúrate de subir un archivo que hayas guardado antes desde esta misma app.');event.target.value='';return;}
      const currentCount=myBets.length;
      const newCount=imported.length;
      const confirmMsg='Vas a reemplazar lo que tienes ahora ('+currentCount+' apuesta'+(currentCount!==1?'s':'')+') con lo que hay en el archivo ('+newCount+' apuesta'+(newCount!==1?'s':'')+').\\n\\nNo podrás deshacer esto. ¿Quieres continuar?';
      if(!confirm(confirmMsg)){event.target.value='';return;}
      myBets=imported.slice().sort((a,b)=>b.id-a.id);
      mySave();
      myRender();
      alert('✓ Listo, ahora tienes '+myBets.length+' apuesta'+(myBets.length!==1?'s':'')+' guardada'+(myBets.length!==1?'s':'')+'.');
    }catch(err){
      alert('No pudimos leer este archivo. Asegúrate de que sea un archivo guardado desde esta misma app.');
    }
  };
  reader.readAsText(file);
  event.target.value='';
}

function mySetResult(id,result){
  const b=myBets.find(b=>b.id===id);if(!b)return;
  b.result=result;
  b.pl=result==='won'?parseFloat(((b.odds-1)*b.stake).toFixed(3)):-b.stake;
  mySave();myRender();if(myTab==='historial')myRenderChart();
}

function myDelete(id){
  if(!confirm('¿Eliminar esta apuesta?'))return;
  myBets=myBets.filter(b=>b.id!==id);mySave();myRender();
}

function setMyFilter(f){
  myFilter=f;
  ['all','won','lost','open'].forEach(k=>{
    const btn=document.getElementById('mf-'+k);
    if(btn){btn.style.background=k===f?'var(--sur2)':'transparent';btn.style.color=k===f?'var(--tx)':'var(--mu)';}
  });
  myRender();
}

function myFmt(d){try{return new Date(d+'T12:00:00').toLocaleDateString('es-CL',{day:'2-digit',month:'short'});}catch(e){return d;}}

function myBetCard(b){
  const potWin=((b.odds-1)*b.stake).toFixed(2);
  const plTxt=b.result==='open'?'Podrías ganar +'+potWin:(b.pl>=0?'Ganaste +':'Perdiste ')+Math.abs(b.pl).toFixed(2);
  const bc=b.result==='won'?'var(--gn)':b.result==='lost'?'var(--rd)':'var(--am)';
  const rl=b.result==='won'?'✓ Ganaste':b.result==='lost'?'✗ Perdiste':'⏳ Esperando';
  let c='<div style="background:var(--sur);border:0.5px solid var(--b);border-left:3px solid '+bc+';border-radius:0 10px 10px 0;padding:12px 14px;margin-bottom:8px;">';
  c+='<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;">';
  c+='<div><div style="font-size:14px;font-weight:500;">'+b.match+'</div>';
  c+='<div style="font-size:11px;color:var(--mu);margin-top:2px;">'+b.comp+' · '+myFmt(b.date)+' · '+b.bookie+'</div></div>';
  c+='<div style="display:flex;gap:5px;flex-shrink:0;">';
  if(b.result==='open'){
    c+='<button onclick="mySetResult('+b.id+',\\'won\\')" title="Marcar como ganada" style="height:26px;padding:0 8px;font-size:11px;border-radius:6px;border:1px solid rgba(34,197,94,.4);background:rgba(34,197,94,.1);color:var(--gn);cursor:pointer;">✓ Gané</button>';
    c+='<button onclick="mySetResult('+b.id+',\\'lost\\')" title="Marcar como perdida" style="height:26px;padding:0 8px;font-size:11px;border-radius:6px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.1);color:var(--rd);cursor:pointer;">✗ Perdí</button>';
  }
  c+='<button onclick="myDelete('+b.id+')" title="Eliminar esta apuesta" style="height:26px;padding:0 8px;font-size:11px;border-radius:6px;border:0.5px solid var(--b2);background:transparent;color:var(--mu);cursor:pointer;">🗑</button>';
  c+='</div></div>';
  c+='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
  c+='<span style="font-size:13px;font-weight:500;">'+b.pick+'</span>';
  c+='<span style="font-family:\\'Space Grotesk\\',sans-serif;font-size:13px;font-weight:600;color:var(--bl);" title="Cuota">@ '+b.odds.toFixed(2)+'</span>';
  c+='<span style="font-size:12px;color:var(--mu);">Apostaste: '+b.stake+'</span>';
  if(b.ev!==null)c+='<span style="font-size:11px;color:'+(b.ev>=0?'var(--gn)':'var(--rd)')+';" title="Ventaja calculada por el análisis">Ventaja: '+(b.ev>=0?'+':'')+b.ev+'%</span>';
  c+='<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:'+(b.result==='won'?'var(--gdim)':b.result==='lost'?'var(--rdim)':'var(--adim)')+';color:'+bc+';">'+rl+'</span>';
  c+='<span style="font-family:\\'Space Grotesk\\',sans-serif;font-size:13px;font-weight:600;color:'+bc+';margin-left:auto;">'+plTxt+'</span>';
  c+='</div></div>';
  return c;
}



function myRender(){
  if(!document.getElementById('ms-total'))return;
  const open=myBets.filter(b=>b.result==='open');
  const closed=myBets.filter(b=>b.result!=='open');
  const won=closed.filter(b=>b.result==='won');
  const totalStake=myBets.reduce((s,b)=>s+b.stake,0);
  const totalPL=closed.reduce((s,b)=>s+b.pl,0);
  const roi=totalStake>0?(totalPL/totalStake*100):0;
  const wr=closed.length>0?(won.length/closed.length*100):null;
  document.getElementById('ms-total').textContent=myBets.length;
  const wrEl=document.getElementById('ms-wr');
  wrEl.textContent=wr!==null?wr.toFixed(1)+'%':'—';
  wrEl.style.color=wr>=50?'var(--gn)':wr!==null?'var(--rd)':'var(--am)';
  const plEl=document.getElementById('ms-pl');
  plEl.textContent=closed.length?(totalPL>=0?'+':'')+totalPL.toFixed(2):'—';
  plEl.style.color=totalPL>0?'var(--gn)':totalPL<0?'var(--rd)':'var(--tx)';
  const roiEl=document.getElementById('ms-roi');
  roiEl.textContent=closed.length?(roi>=0?'+':'')+roi.toFixed(1)+'%':'—';
  roiEl.style.color=roi>0?'var(--gn)':roi<0?'var(--rd)':'var(--tx)';
  const hWr=document.getElementById('h-wr');const hPl=document.getElementById('h-pl');
  if(hWr)hWr.textContent=wr!==null?wr.toFixed(1)+'%':'—';
  if(hPl){hPl.textContent=closed.length?(totalPL>=0?'+':'')+totalPL.toFixed(2):'—';hPl.style.color=totalPL>=0?'var(--gn)':'var(--rd)';}
  const badge=document.getElementById('open-badge');
  if(badge){badge.textContent=open.length;badge.style.display=open.length?'inline':'none';}
  const ol=document.getElementById('open-label');if(ol)ol.textContent='Apuestas esperando resultado ('+open.length+')';
  const openList=document.getElementById('my-open-list');
  if(openList)openList.innerHTML=open.length?open.map(myBetCard).join(''):'<div style="text-align:center;padding:3rem 1rem;color:var(--mu);">✓ No tienes apuestas esperando resultado</div>';
  let filtered=myBets;
  if(myFilter==='won')filtered=won;
  else if(myFilter==='lost')filtered=myBets.filter(b=>b.result==='lost');
  else if(myFilter==='open')filtered=open;
  const histList=document.getElementById('my-hist-list');
  if(histList)histList.innerHTML=filtered.length?filtered.map(myBetCard).join(''):'<div style="text-align:center;padding:3rem 1rem;color:var(--mu);">Todavía no has anotado ninguna apuesta. Usa el botón "+ Anotar nueva apuesta".</div>';
}

function myRenderChart(){
  const closed=myBets.filter(b=>b.result!=='open').slice().reverse();
  const wrap=document.getElementById('my-chart-wrap');
  if(!wrap)return;
  if(closed.length<2){wrap.innerHTML='';wrap.style.display='none';return;}
  wrap.style.display='block';
  let cum=0;
  const data=closed.map(b=>{cum+=b.pl;return parseFloat(cum.toFixed(3));});
  const maxAbs=Math.max(...data.map(v=>Math.abs(v)),1);
  let h='<div style="display:flex;align-items:center;gap:2px;height:90px;padding:0 4px;">';
  data.forEach((v,i)=>{
    const pct=Math.max(4,Math.abs(v)/maxAbs*45);
    const isPos=v>=0;
    h+='<div style="flex:1;min-width:6px;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;" title="P&L acum: '+(v>=0?'+':'')+v.toFixed(2)+'u">';
    h+='<div style="height:50%;display:flex;flex-direction:column-reverse;width:100%;align-items:center;">';
    h+=isPos?'<div style="width:80%;height:'+pct+'%;background:rgba(34,197,94,0.65);border-radius:2px 2px 0 0;"></div>':'';
    h+='</div>';
    h+='<div style="height:50%;display:flex;flex-direction:column;width:100%;align-items:center;">';
    h+=!isPos?'<div style="width:80%;height:'+pct+'%;background:rgba(239,68,68,0.65);border-radius:0 0 2px 2px;"></div>':'';
    h+='</div>';
    h+='</div>';
  });
  h+='</div>';
  h+='<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mu);padding:4px 4px 0;border-top:1px solid var(--b);margin-top:4px;">';
  h+='<span>Pick 1</span><span>P&L acumulado · '+data.length+' picks cerrados</span><span>Pick '+data.length+'</span>';
  h+='</div>';
  wrap.innerHTML=h;
}

// ═══ NAVEGACIÓN ═══


function gp(name,el){
  document.querySelectorAll('.page').forEach(p=>{p.classList.remove('active');p.classList.add('hidden');});
  document.querySelectorAll('.nl').forEach(b=>b.classList.remove('active'));
  const pg=document.getElementById('page-'+name);
  if(!pg)return;
  pg.classList.remove('hidden');pg.classList.add('active');
  if(el)el.classList.add('active');
  if(name==='hist')buildHist();
}

// ═══ ANIMACIÓN ═══
const styleEl=document.createElement('style');
styleEl.textContent='@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}';
document.head.appendChild(styleEl);

// ═══ HOME: COMBINADAS DINÁMICAS ═══
function buildCombinadas(){
  const el=document.getElementById('combinadas-content');
  if(!el)return;

  const candidates=[];
  FIXTURES.forEach(g=>g.m.forEach(m=>{
    if(m.score)return; // skip played matches
    const p=modelProbs(m.h,m.a,true);
    const bp=bestPick(m.h,m.a,p);
    if(bp.prob>=0.40){ // only confident picks for combinadas
      candidates.push({
        match:m.h+' vs '+m.a, time:m.t,
        pick:bp.label, prob:bp.prob, odd:1/bp.prob
      });
    }
  }));

  if(candidates.length<2){
    el.innerHTML='<div class="card" style="text-align:center;color:var(--mu);font-size:13px;padding:1.5rem;">Por ahora no hay suficientes partidos próximos en los que confiemos para sugerir una combinada.</div>';
    return;
  }

  candidates.sort((a,b)=>b.prob-a.prob);

  function buildCombo(legs,label,badgeColor){
    let combProb=1;
    legs.forEach(l=>{combProb*=l.prob;});
    let h='<div class="cc">';
    h+='<div><div class="ccb" style="background:'+badgeColor+';">'+label+'</div>';
    h+='<div class="ccp">'+legs.length+' apuestas juntas · de partidos que aún no se juegan</div></div>';
    h+='<div class="ccl" style="margin-top:8px;">';
    legs.forEach((l,i)=>{
      h+='<div class="cleg"><span class="leg-n">'+(i+1)+'/'+legs.length+'</span>';
      h+='<div class="lc"><div class="lm">'+l.match+' · '+l.time+'</div><div class="lp">'+l.pick+'</div></div></div>';
    });
    h+='</div>';
    h+='<div class="ccf"><div class="cs"><div class="cl">Probabilidad de que se cumplan todas</div><div class="cv" style="color:var(--bl);">'+(combProb*100).toFixed(0)+'%</div></div></div>';
    h+='<div style="font-size:11px;color:var(--mu);margin-top:8px;">Ve a "Analizar un partido" e ingresa las cuotas reales de tu casa de apuestas para armar esta combinada con el premio exacto.</div>';
    h+='</div>';
    return h;
  }

  let html='';
  // Combinación más segura: las 2 apuestas más probables
  if(candidates.length>=2){
    html+=buildCombo(candidates.slice(0,2),'La más segura','var(--gdim)');
  }
  // Combinación alternativa: las siguientes 2 mejores (de otros partidos)
  const used=new Set(candidates.slice(0,2).map(c=>c.match));
  const rest=candidates.filter(c=>!used.has(c.match));
  if(rest.length>=2){
    html+=buildCombo(rest.slice(0,2),'Otra opción','var(--adim)');
  }
  el.innerHTML=html;
}

// ═══ INIT ═══
myLoad();
buildMatches();
buildSelect();
buildTopStrip();
buildCombinadas();
myRender();
document.getElementById('bf-date').value=new Date().toISOString().split('T')[0];

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}

`;

export default function CalcPage({ onBetSaved }: { onBetSaved: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inject CSS if not already present
    const styleId = 'guessbet-html-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
:root{
  --bg:#0a0f1e;--sur:#111b30;--sur2:#182240;--sur3:#1f2d52;
  --b:rgba(201,168,76,.12);--b2:rgba(201,168,76,.24);
  --tx:#f0ece0;--mu:#7a8aaa;--mu2:#3d4f72;
  --gn:#3aae6c;--gdim:rgba(58,174,108,.13);--gbr:rgba(58,174,108,.30);
  --am:#c9a84c;--adim:rgba(201,168,76,.13);--abr:rgba(201,168,76,.35);
  --rd:#d95050;--rdim:rgba(217,80,80,.12);--rbr:rgba(217,80,80,.28);
  --bl:#6b9fd4;--bdim:rgba(107,159,212,.12);
  --gold-light:#e8c96a;--gold-dark:#8a6a1f;
  --pitch-line:rgba(201,168,76,.04);
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:var(--bg);color:var(--tx);font-family:'Inter',sans-serif;font-size:14px;line-height:1.6;min-height:100vh;}body{padding-bottom:env(safe-area-inset-bottom);}
body{
  background-image:
    radial-gradient(ellipse 800px 600px at 50% -5%, rgba(201,168,76,.07), transparent 55%),
    radial-gradient(ellipse 600px 400px at 100% 80%, rgba(107,159,212,.04), transparent 50%);
  background-attachment:fixed;
}
h1,h2,h3{font-family:'Bebas Neue',sans-serif;letter-spacing:.02em;font-weight:400;}
a{color:inherit;text-decoration:none;}
::selection{background:var(--am);color:var(--bg);}

/* NAV */
nav{background:linear-gradient(180deg,rgba(17,27,48,.98),rgba(10,15,30,.96));border-bottom:1px solid rgba(201,168,76,.18);position:sticky;top:0;z-index:100;backdrop-filter:blur(10px);padding-top:env(safe-area-inset-top);}
.ni{max-width:1000px;margin:0 auto;padding:0 1.25rem;display:flex;align-items:center;}
.logo{font-family:Georgia,serif;font-weight:700;font-size:16px;letter-spacing:.02em;padding:13px 0;margin-right:24px;display:flex;align-items:center;gap:7px;}
.logo span{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.06em;}
.nl{padding:14px 14px;font-size:13px;font-weight:500;color:var(--mu);cursor:pointer;border:none;border-bottom:2px solid transparent;background:none;font-family:'Inter',sans-serif;white-space:nowrap;margin-bottom:-1px;transition:color .15s;}
.nl:hover{color:var(--tx);}
.nl.active{color:var(--am);border-bottom-color:var(--am);}
.nl:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--am);outline-offset:2px;}

.page{display:none;}.page.active{display:block;}
.wrap{max-width:1000px;margin:0 auto;padding:2rem 1.25rem 5rem;}

/* hero */
.hero{margin-bottom:1.75rem;}
.eyebrow{font-size:11px;font-weight:600;letter-spacing:.14em;color:var(--am);text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.dot{width:6px;height:6px;background:var(--gn);border-radius:50%;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}
.hero h1{font-size:42px;line-height:1;margin-bottom:8px;}
.hero h1 span{color:var(--am);}
.hero p{font-size:13.5px;color:var(--mu);max-width:540px;line-height:1.7;}
.source-badge{display:inline-flex;align-items:center;gap:6px;background:var(--bdim);border:1px solid rgba(91,155,217,.25);border-radius:20px;padding:5px 13px;font-size:11px;color:var(--bl);margin-top:12px;}
.counters{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;}
.counter{background:var(--sur2);border:1px solid var(--b2);border-radius:10px;padding:12px 18px;text-align:center;min-width:96px;position:relative;}
.counter .cv{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.02em;}
.counter .cl{font-size:10.5px;color:var(--mu);text-transform:uppercase;letter-spacing:.04em;margin-top:1px;}

/* top picks strip */
.strip{background:var(--sur);border:1px solid var(--b2);border-radius:14px;padding:1.2rem 1.3rem;margin-bottom:1.5rem;position:relative;overflow:hidden;}
.strip::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#e8c96a,#c9a84c 40%,transparent 70%);}
.stlbl{font-size:11px;font-weight:700;color:var(--mu);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:7px;}
.tpr{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--b);}
.tpr:last-child{border-bottom:none;}
.tpr-m{flex:1;min-width:0;}.tpr-m .mn{font-size:13.5px;font-weight:600;}.tpr-m .ms{font-size:11px;color:var(--mu);}
.tpr-p{font-size:12px;color:var(--mu);flex-shrink:0;}
.tpr-r{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.op{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--bl);}
.ep{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;}
.ehi{background:var(--gdim);border:1px solid var(--gbr);color:var(--gn);}
.emi{background:var(--adim);border:1px solid var(--abr);color:var(--am);}

/* two col */
.tc{display:grid;grid-template-columns:1fr 320px;gap:1.5rem;align-items:start;}
.sec-title{font-size:11px;font-weight:700;color:var(--mu);letter-spacing:.1em;text-transform:uppercase;margin-bottom:13px;display:flex;align-items:center;gap:7px;}

/* match ticket card */
.dg{margin-bottom:1.6rem;}
.dlbl{font-size:11.5px;font-weight:600;color:var(--am);padding:6px 0;border-bottom:1px dashed var(--b2);margin-bottom:9px;letter-spacing:.03em;}
.mc{background:var(--sur);border:1px solid var(--b);border-radius:12px;padding:14px 16px;margin-bottom:9px;position:relative;transition:border-color .15s, transform .12s;}
.mc:hover{border-color:var(--b2);transform:translateY(-1px);}
.mc.hp{border-left:3px solid var(--am);}
.mc.pl{opacity:.55;}
.mch{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.mct{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;}
.mfl{font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));}
.mvs{font-size:11px;color:var(--mu);margin:0 3px;font-weight:500;}
.msc{font-family:'Bebas Neue',sans-serif;font-size:17px;color:var(--am);background:var(--adim);border:1px solid var(--abr);padding:3px 10px;border-radius:6px;}
.mti{font-size:11px;color:var(--mu);font-weight:500;}
.mcp{display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
.pkl{font-size:12px;color:var(--mu);}.pkv{font-size:12px;font-weight:600;}
.nopk{font-size:12px;color:var(--mu2);font-style:italic;}
.dtag{font-size:10px;color:var(--bl);background:var(--bdim);border:1px solid rgba(91,155,217,.2);padding:2px 7px;border-radius:10px;}

/* combinadas */
.cc{background:var(--sur);border:1px solid var(--b);border-radius:12px;padding:1.15rem;margin-bottom:1rem;}
.ccb{font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;display:inline-block;color:var(--gn);border:1px solid var(--gbr);letter-spacing:.03em;}
.ccp{font-size:11px;color:var(--mu);margin-top:5px;}
.cco{font-family:'Bebas Neue',sans-serif;font-size:30px;color:var(--am);margin:9px 0 5px;}
.ccl{border-top:1px solid var(--b);padding-top:11px;margin-top:7px;}
.cleg{display:flex;align-items:flex-start;gap:9px;padding:7px 0;border-bottom:1px solid var(--b);}
.cleg:last-child{border-bottom:none;}
.leg-n{font-size:10px;color:var(--mu);width:26px;flex-shrink:0;padding-top:2px;font-weight:600;}
.lc{flex:1;min-width:0;}
.lm{font-size:12.5px;font-weight:600;}
.lp{font-size:11px;color:var(--mu);margin-top:2px;}
.leg-o{font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--bl);flex-shrink:0;}
.ccf{display:flex;gap:18px;margin-top:11px;border-top:1px solid var(--b);padding-top:11px;}
.cs{flex:1;}
.cs .cl{font-size:10px;color:var(--mu);letter-spacing:.02em;}
.cs .cv{font-size:15px;font-weight:600;margin-top:3px;}

/* summary stat bar */
.sb{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--b2);border:1px solid var(--b2);border-radius:14px;overflow:hidden;margin-bottom:1.5rem;}
.sbl{background:var(--sur);padding:14px 16px;}
.sbl .sl{font-size:10.5px;color:var(--mu);margin-bottom:4px;text-transform:uppercase;letter-spacing:.03em;}
.sbl .sv{font-family:'Bebas Neue',sans-serif;font-size:24px;}

/* cards */
.card{background:var(--sur);border:1px solid var(--b);border-radius:14px;padding:1.3rem;margin-bottom:1rem;}
.ctit{font-size:11px;font-weight:700;color:var(--mu);letter-spacing:.1em;text-transform:uppercase;margin-bottom:1.1rem;display:flex;align-items:center;gap:9px;}
.ctit .n{width:21px;height:21px;border-radius:50%;background:var(--sur3);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--am);font-weight:700;flex-shrink:0;}

input,select{
  width:100%;background:var(--sur2);border:1px solid var(--b2);color:var(--tx);
  font-family:'Inter',sans-serif;font-size:13px;padding:0 12px;height:40px;border-radius:9px;
  transition:border-color .15s;
}
input:focus,select:focus{outline:none;border-color:var(--am);box-shadow:0 0 0 3px rgba(212,164,67,.12);}
.fsel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238fa898' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;}
optgroup{color:var(--am);}option{background:var(--sur);color:var(--tx);}
.tr2{display:grid;grid-template-columns:1fr 34px 1fr;gap:7px;align-items:center;margin-top:11px;}
.tvs{text-align:center;font-size:11px;font-weight:700;color:var(--mu);}
.fg label{font-size:11.5px;color:var(--mu);display:block;margin-bottom:5px;font-weight:500;}
.nr{display:flex;align-items:center;gap:8px;margin-top:9px;font-size:13px;color:var(--mu);}
.nr input[type=checkbox]{accent-color:var(--am);width:15px;height:15px;}
.st{font-size:11px;color:var(--mu2);background:var(--sur3);padding:3px 9px;border-radius:20px;margin-left:5px;}
.fr{display:flex;gap:6px;margin-bottom:11px;}
.fb{background:transparent;border:1px solid var(--b2);color:var(--mu);font-size:12px;font-family:'Inter',sans-serif;padding:5px 13px;border-radius:20px;cursor:pointer;transition:all .15s;}
.fb.active{background:var(--adim);border-color:var(--abr);color:var(--am);}
.og{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:9px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:11px;}
.sec{font-size:11px;font-weight:700;color:var(--mu);letter-spacing:.08em;text-transform:uppercase;margin-bottom:13px;}

.btn-am,.cb{
  width:100%;height:46px;background:linear-gradient(135deg,#e8c96a 0%,#c9a84c 50%,#8a6a1f 100%);color:#0a0f1e;
  font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.04em;border:none;border-radius:10px;
  cursor:pointer;transition:filter .15s, transform .1s;font-weight:700;
}
.btn-am:hover,.cb:hover{filter:brightness(1.08);}
.btn-am:active,.cb:active{transform:scale(.99);}

.mbox{background:var(--sur2);border:1px solid var(--b2);border-radius:11px;padding:13px 15px;margin-bottom:1rem;font-size:12px;color:var(--mu);line-height:1.85;}
.mbox strong{color:var(--tx);}

.h2hbox{background:linear-gradient(135deg,rgba(91,155,217,.07),rgba(91,155,217,.02));border:1px solid rgba(91,155,217,.22);border-radius:11px;padding:13px 15px;margin-bottom:1rem;}
.h2h-title{font-size:11px;font-weight:700;color:var(--bl);letter-spacing:.08em;text-transform:uppercase;margin-bottom:9px;}
.h2h-row{display:flex;gap:9px;flex-wrap:wrap;}
.h2h-s{background:rgba(91,155,217,.08);border:1px solid rgba(91,155,217,.18);border-radius:7px;padding:6px 11px;text-align:center;}
.h2h-s .hl{font-size:10px;color:var(--mu);}.h2h-s .hv{font-size:16px;font-weight:700;color:var(--bl);font-family:'Bebas Neue',sans-serif;}

.xg-strip{background:var(--sur2);border:1px solid var(--b2);border-radius:12px;padding:15px 19px;margin-bottom:11px;display:flex;align-items:center;gap:22px;flex-wrap:wrap;}
.xgt .xn{font-size:11px;color:var(--mu);font-weight:500;}.xgt .xv{font-size:28px;font-weight:700;font-family:'Bebas Neue',sans-serif;color:var(--am);}
.edge-bar{padding:10px 14px;border-left:3px solid var(--am);background:var(--adim);border-radius:0 8px 8px 0;font-size:12.5px;color:var(--mu);margin-bottom:1rem;line-height:1.6;}

.tabs{display:flex;gap:0;border-bottom:1px solid var(--b2);margin-bottom:1.1rem;}
.tab{background:transparent;border:none;border-bottom:2px solid transparent;color:var(--mu);font-family:'Inter',sans-serif;font-size:13px;font-weight:500;padding:7px 17px 11px;cursor:pointer;margin-bottom:-1px;transition:color .15s;}
.tab.active{color:var(--am);border-bottom-color:var(--am);}

.mt{width:100%;border-collapse:collapse;}
.mt th{font-size:10px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.06em;text-align:left;padding:8px 11px;border-bottom:1px solid var(--b2);}
.mt td{padding:10px 11px;border-bottom:1px solid var(--b);font-size:13px;vertical-align:middle;}
.mt tr:last-child td{border-bottom:none;}
.mt tr:hover td{background:rgba(212,164,67,.025);}
.mn2{font-weight:600;}
.ep,.epos{color:var(--gn);font-weight:700;}.en,.eneg{color:var(--rd);}.eu,.eneu{color:var(--mu);}
.fo{font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--bl);}
.py{display:inline-block;background:var(--gdim);border:1px solid var(--gbr);color:var(--gn);font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;}
.ps{display:inline-block;background:var(--rdim);border:1px solid var(--rbr);color:#e9847a;font-size:10px;padding:3px 8px;border-radius:20px;}

.hf{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:1.25rem;align-items:center;}
.fg2{display:flex;gap:3px;background:var(--sur);border:1px solid var(--b2);border-radius:9px;padding:3px;}
.fb2{background:transparent;border:none;color:var(--mu);font-size:12px;font-family:'Inter',sans-serif;padding:5px 13px;border-radius:7px;cursor:pointer;white-space:nowrap;transition:all .15s;}
.fb2.active{background:var(--sur3);color:var(--tx);}
.ab{background:transparent;border:1px solid var(--b2);color:var(--mu);font-size:12px;font-family:'Inter',sans-serif;padding:6px 15px;border-radius:9px;cursor:pointer;}
.ab:hover{color:var(--tx);border-color:var(--am);}

.ht{width:100%;border-collapse:collapse;}
.ht th{font-size:10px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.06em;text-align:left;padding:9px 12px;border-bottom:1px solid var(--b2);}
.ht td{padding:11px 12px;border-bottom:1px solid var(--b);font-size:13px;vertical-align:middle;}
.ht tr:last-child td{border-bottom:none;}
.ht tr:hover td{background:rgba(212,164,67,.025);}
.hm{font-weight:600;}.hd2{font-size:11px;color:var(--mu);display:block;margin-top:2px;}
.ho{font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--bl);}
.hok{color:var(--gn);font-weight:700;}.hko{color:var(--rd);}.hop{color:var(--am);}
.hpos{color:var(--gn);font-weight:700;font-family:'Bebas Neue',sans-serif;}
.hneg{color:var(--rd);font-family:'Bebas Neue',sans-serif;}

.ap{background:var(--sur);border:1px solid var(--b2);border-radius:13px;padding:1.2rem;margin-bottom:1rem;}
.apt{font-size:13px;font-weight:600;margin-bottom:13px;display:flex;justify-content:space-between;align-items:center;}
.apc{background:none;border:none;color:var(--mu);cursor:pointer;font-size:19px;}
.af label{font-size:11.5px;color:var(--mu);display:block;margin-bottom:5px;font-weight:500;}
.aa{display:flex;gap:7px;}
.aa button{flex:1;height:38px;border-radius:9px;font-size:12px;font-family:'Inter',sans-serif;cursor:pointer;font-weight:600;}
.bw{background:var(--gdim);border:1px solid var(--gbr);color:var(--gn);}
.bl2{background:var(--rdim);border:1px solid var(--rbr);color:var(--rd);}
.bo{background:var(--sur2);border:1px solid var(--b2);color:var(--mu);}

.date-chip{flex-shrink:0;background:var(--sur);border:1px solid var(--b2);border-radius:11px;padding:9px 16px;cursor:pointer;text-align:center;min-width:64px;transition:all .15s;}
.date-chip:hover{border-color:var(--am);}
.date-chip.active{background:var(--adim);border-color:var(--am);}
.date-chip .dc-day{font-family:'Bebas Neue',sans-serif;font-size:20px;line-height:1;color:var(--tx);}
.date-chip.active .dc-day{color:var(--am);}
.date-chip .dc-month{font-size:10px;color:var(--mu);text-transform:uppercase;letter-spacing:.04em;margin-top:2px;}
.date-chip .dc-count{font-size:9px;color:var(--mu2);margin-top:1px;}
#date-scroll::-webkit-scrollbar{height:6px;}
#date-scroll::-webkit-scrollbar-track{background:var(--sur2);border-radius:10px;}
#date-scroll::-webkit-scrollbar-thumb{background:var(--b2);border-radius:10px;}
.result-row{background:var(--sur);border:1px solid var(--b);border-radius:11px;padding:13px 15px;margin-bottom:8px;display:flex;align-items:center;gap:13px;}
.result-row .rr-date{font-size:10.5px;color:var(--mu);min-width:42px;font-weight:500;}
.result-row .rr-team{font-size:13.5px;font-weight:600;flex:1;display:flex;align-items:center;gap:7px;}
.result-row .rr-team.right{justify-content:flex-end;text-align:right;}
.result-row .rr-flag{font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));}
.result-row .rr-score{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--am);background:var(--adim);border:1px solid var(--abr);padding:4px 13px;border-radius:8px;flex-shrink:0;}
.result-row .rr-tag{font-size:10.5px;color:var(--mu2);flex-shrink:0;min-width:36px;text-align:right;}
.hidden{display:none!important;}
footer{border-top:1px solid var(--b2);padding:24px;text-align:center;font-size:11px;color:var(--mu2);}

@media(max-width:680px){
  html,body{overflow-x:hidden;max-width:100vw;}
  body{font-size:15px;}
  .wrap{padding:1.25rem .9rem 4rem;box-sizing:border-box;width:100%;max-width:100vw;overflow-x:hidden;}
  nav{overflow:hidden;}
  .ni{padding:0 .9rem;display:flex;align-items:center;min-width:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .ni::-webkit-scrollbar{display:none;}
  .logo{margin-right:12px;font-size:17px;flex-shrink:0;}
  .nl{padding:13px 10px;font-size:12px;white-space:nowrap;flex-shrink:0;}
  .tc{grid-template-columns:1fr!important;display:block!important;}
  .tc>*{width:100%!important;max-width:100%!important;}
  .sb{grid-template-columns:repeat(2,1fr);}
  .og,.g2,.g3{grid-template-columns:1fr;}
  .hero{min-width:0;}
  .hero h1{font-size:28px;word-break:break-word;}
  .hero p{font-size:13px;}
  .source-badge{font-size:10px;padding:4px 10px;white-space:normal;}
  .counters{gap:7px;}
  .counter{min-width:74px;padding:10px 10px;}
  .counter .cv{font-size:22px;}
  .mfl{font-size:18px;}
  .mc{padding:12px;}
  .mch{flex-wrap:wrap;gap:4px;}
  .mct{flex-wrap:wrap;gap:4px;}
  .mcp{gap:6px;flex-wrap:wrap;}
  .card{padding:1rem;border-radius:12px;min-width:0;}
  .strip{padding:1rem;}
  .tpr{flex-wrap:wrap;gap:6px;}
  .tpr-r{flex-wrap:wrap;}
  .tr2{grid-template-columns:1fr;gap:10px;}
  .tvs{display:none;}
  .xg-strip{padding:13px 14px;gap:14px;flex-wrap:wrap;}
  .xgt .xv{font-size:24px;}
  .mt{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .mt th,.mt td{padding:8px 8px;font-size:12px;white-space:nowrap;}
  .ht{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .date-chip{min-width:52px;padding:8px 10px;}
  .result-row{flex-wrap:wrap;padding:11px 12px;gap:6px;}
  .result-row .rr-team{font-size:12px;min-width:0;flex:1;}
  .result-row .rr-score{font-size:15px;padding:3px 10px;}
  .rr-tag{display:none;}
  .btn-am,.cb{height:48px;font-size:16px;}
  input,select{height:44px;font-size:16px;}
  .fg label{font-size:12px;}
  .tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .tabs::-webkit-scrollbar{display:none;}
  .tab{padding:7px 12px 10px;white-space:nowrap;font-size:12.5px;}
  .h2h-row{flex-wrap:wrap;}
  .hf{gap:6px;flex-wrap:wrap;}
  .fg2{flex-wrap:wrap;}
  #betbuilder-card .g3{grid-template-columns:1fr 1fr;}
  footer{padding:18px 14px;font-size:10.5px;}
}
@media(max-width:390px){
  .nl{padding:13px 8px;font-size:11px;}
  .logo{font-size:15px;}
  .logo svg{width:22px;height:22px;}
  .sb{grid-template-columns:1fr 1fr;}
  .counter{min-width:0;flex:1;}
  .hero h1{font-size:24px;}
}
`;
      document.head.appendChild(style);
    }

    // Inject HTML
    containerRef.current.innerHTML = CALC_HTML;

    // Run the full JS from the HTML
    const script = document.createElement('script');
    script.textContent = CLIENT_SCRIPT + `
      // Override registerBBBet to call Next.js API
      const _origRegisterBBBet = typeof registerBBBet !== 'undefined' ? registerBBBet : null;
      async function registerBBBetNext() {
        if(!bbSelected.length) return;
        const home=document.getElementById('th')?.value||'Local';
        const away=document.getElementById('ta')?.value||'Visitante';
        const pickText=bbSelected.length>1
          ?'Combinada ('+bbSelected.length+'): '+bbSelected.map(m=>m.label).join(' + ')
          :bbSelected[0].label;
        const stake=parseFloat(document.getElementById('bb-stake')?.value)||1;
        let combOdd=1,combProb=1;
        bbSelected.forEach(m=>{combOdd*=m.odd;combProb*=m.prob;});
        const ev=(combProb*combOdd-1)*100;
        const bookie=document.getElementById('bb-bookie')?.value||'Coolbet';
        const res=await fetch('/api/bets',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            match_name:home+' vs '+away,
            pick_label:pickText,
            odds:parseFloat(combOdd.toFixed(2)),
            stake,
            ev:parseFloat(ev.toFixed(1)),
            bookie,
            competition:'Mundial 2026',
            match_date:null
          })
        });
        if(res.ok){
          document.querySelectorAll('.bb-check,.bb-sec-check').forEach(c=>c.checked=false);
          bbSelected=[];
          updateBetBuilder();
          window.__onBetSaved && window.__onBetSaved();
        }
      }
      // Initialize
      try{buildSelect();buildHist&&buildHist();}catch(e){}
    `;
    document.head.appendChild(script);

    // Wire up the register button
    const wireRegister = () => {
      const regBtn = document.getElementById('bb-reg');
      if (regBtn) {
        regBtn.onclick = async () => {
          await (window as any).registerBBBetNext?.();
          onBetSaved();
        };
      }
    };

    // Set global callback
    (window as any).__onBetSaved = onBetSaved;

    // Wire after short delay to let JS init
    setTimeout(wireRegister, 100);

    return () => {
      // Cleanup script
      script.remove();
    };
  }, [onBetSaved]);

  return (
    <div
      ref={containerRef}
      style={{ maxWidth: 780 }}
    />
  );
}
