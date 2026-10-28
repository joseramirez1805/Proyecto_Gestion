(() => {
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const T = (h, m) => h * 60 + m;
const hm = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return (((h + 11) % 12) + 1) + ':' + String(mm).padStart(2, '0'); };
const hmp = m => hm(m) + (Math.floor(m / 60) % 24 < 12 ? ' a. m.' : ' p. m.');
const money = n => '$ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);

const ICONS = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  warn: '<path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5"/><path d="M12 18h.01"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14c2.2.6 3.5 2.6 3.5 6"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  fork: '<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M11 3v8a2 2 0 0 1-2 2"/><path d="M17 3c-2 2-2 6 0 8v10"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3"/>',
  glass: '<path d="M6 3h12l-1.5 17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1L6 3z"/><path d="M6.5 8h11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  snow: '<path d="M12 2v20M4.9 6l14.2 12M4.9 18 19.1 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1.5S9 9 12 9zm0 0c2-4 6-4 6-1.5S15 9 12 9z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  therm: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
  camera: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'
};
const ic = (n, size = 18, color = 'currentColor', sw = 2, fill = 'none') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* ---------- estado inicial ---------- */
function initial() {
  return {
    clock: T(13, 10),
    view: 'a',
    profile: null,
    A: {
      screen: 'panel', confirming: null, nextId: 244, staff: 14, waiterTab: 'mesas',
      draft: { mesa: 12, items: {} },
      menu: [
        { id: 'bandeja', name: 'Bandeja paisa', cat: 'Fuertes', st: 'ok', min: 25 },
        { id: 'frijolada', name: 'Frijolada', cat: 'Fuertes', st: 'off', min: 25, since: T(12, 31) },
        { id: 'churrasco', name: 'Churrasco 300 g', cat: 'Fuertes', st: 'ok', min: 30 },
        { id: 'lomo', name: 'Lomo al trapiche', cat: 'Fuertes', st: 'ok', min: 30 },
        { id: 'salmon', name: 'Salmón en salsa de maracuyá', cat: 'Fuertes', st: 'few', left: 5, min: 25 },
        { id: 'pechuga', name: 'Pechuga a la plancha', cat: 'Fuertes', st: 'ok', min: 20 },
        { id: 'arroz', name: 'Arroz con pollo', cat: 'Fuertes', st: 'ok', min: 20 },
        { id: 'hamburguesa', name: 'Hamburguesa del club', cat: 'Fuertes', st: 'ok', min: 15 },
        { id: 'ajiaco', name: 'Ajiaco santafereño', cat: 'Sopas', st: 'ok', min: 12 },
        { id: 'sancocho', name: 'Sancocho de gallina', cat: 'Sopas', st: 'few', left: 8, min: 20 },
        { id: 'limonada', name: 'Limonada de coco', cat: 'Bebidas', st: 'ok', min: 6 },
        { id: 'lulo', name: 'Jugo de lulo', cat: 'Bebidas', st: 'ok', min: 5 }
      ],
      orders: [
        { id: 218, punto: 'Terraza', mesa: 12, mesero: 'Andrés', t: T(12, 28), st: 'prep', items: [[2, 'Churrasco 300 g', 'término medio, papa criolla'], [1, 'Arroz con pollo', '']] },
        { id: 205, punto: 'Restaurante', mesa: 7, mesero: 'Camila', t: T(12, 31), st: 'prep', items: [[1, 'Cazuela de mariscos', ''], [2, 'Bandeja paisa', '']] },
        { id: 231, punto: 'Palmas', mesa: 3, mesero: 'Julián', t: T(12, 35), st: 'prep', items: [[3, 'Lomo al trapiche', '']] },
        { id: 226, punto: 'Restaurante', mesa: 15, mesero: 'Camila', t: T(12, 42), st: 'prep', items: [[2, 'Sancocho de gallina', ''], [2, 'Arroz con pollo', '']] },
        { id: 233, punto: 'Palmas', mesa: 6, mesero: 'Julián', t: T(12, 52), st: 'prep', items: [[2, 'Salmón en salsa de maracuyá', ''], [1, 'Pechuga a la plancha', 'sin sal']] },
        { id: 238, punto: 'Terraza', mesa: 9, mesero: 'Andrés', t: T(12, 52), st: 'prep', items: [[2, 'Bandeja paisa', ''], [2, 'Limonada de coco', '']] },
        { id: 237, punto: 'Restaurante', mesa: 2, mesero: 'Camila', t: T(12, 59), st: 'prep', items: [[4, 'Sancocho de gallina', '']] },
        { id: 239, punto: 'Terraza', mesa: 14, mesero: 'Andrés', t: T(12, 50), st: 'listo', items: [[1, 'Ajiaco santafereño', ''], [1, 'Churrasco 300 g', 'tres cuartos']] },
        { id: 229, punto: 'Restaurante', mesa: 11, mesero: 'Camila', t: T(12, 51), st: 'listo', items: [[2, 'Pechuga a la plancha', ''], [2, 'Jugo de lulo', '']] },
        { id: 230, punto: 'Kiosko', mesa: 1, mesero: 'Sofía', t: T(12, 55), st: 'listo', items: [[2, 'Hamburguesa del club', ''], [2, 'Jugo de lulo', '']] },
        { id: 241, punto: 'Restaurante', mesa: 9, mesero: 'Camila', t: T(13, 8), st: 'pend', items: [[2, 'Ajiaco santafereño', ''], [1, 'Churrasco 300 g', 'término 3/4']] },
        { id: 242, punto: 'Terraza', mesa: 10, mesero: 'Andrés', t: T(13, 7), st: 'pend', items: [[3, 'Bandeja paisa', ''], [1, 'Bandeja paisa', 'sin chicharrón']] },
        { id: 243, punto: 'Kiosko', mesa: 3, mesero: 'Sofía', t: T(13, 9), st: 'pend', items: [[2, 'Hamburguesa del club', '']] }
      ],
      notices: [{ id: 1, dish: 'frijolada', t: T(12, 31), conf: 14, mine: true }]
    },
    B: {
      screen: 'plan', cap: 300, hist: 890, suggested: null, sentWarehouse: false,
      hours: [
        { h: 11, s: 70, i: 25, e: 25 }, { h: 12, s: 150, i: 60, e: 40 }, { h: 13, s: 190, i: 110, e: 40 },
        { h: 14, s: 120, i: 60, e: 40 }, { h: 15, s: 60, i: 25, e: 25 }, { h: 16, s: 22, i: 6, e: 12 }
      ],
      form: { fam: 4, inv: 3, slot: '12:30', zona: 'aire', cel: false }, confirmed: null,
      dishes: [
        { name: 'Bandeja paisa', base: 140, extra: 25, note: 'incluye el cumpleaños (25)' },
        { name: 'Frijolada', base: 60, stock: 'Faltan 4 kg de fríjol', warn: true },
        { name: 'Sancocho de gallina', base: 90 },
        { name: 'Churrasco 300 g', base: 120 },
        { name: 'Ajiaco santafereño', base: 70 },
        { name: 'Limonada de coco', base: 420, clima: 1.15, note: 'día soleado', stock: 'Pedir 40 cocos', warn: true }
      ],
      zones: [
        { id: 'aire', name: 'Comedor con aire', icon: 'snow', cols: 4, tables: [
          ['A1', 4, 'ocu'], ['A2', 4, 'ocu'], ['A3', 4, 'libre'], ['A4', 6, 'ocu'], ['A5', 4, 'ocu'], ['A6', 4, 'ocu'], ['A7', 6, 'apa'], ['A8', 2, 'ocu'],
          ['A9', 4, 'ocu'], ['A10', 4, 'ocu'], ['A11', 2, 'libre'], ['A12', 4, 'pronto'], ['A13', 6, 'ocu'], ['A14', 4, 'pronto'], ['A15', 4, 'ocu'], ['A16', 4, 'ocu']] },
        { id: 'terraza', name: 'Terraza', icon: 'sun', cols: 4, tables: [
          ['T1', 4, 'pronto'], ['T2', 4, 'ocu'], ['T3', 4, 'apa'], ['T4', 6, 'ocu'], ['T5', 4, 'libre'], ['T6', 4, 'pronto'],
          ['T7', 4, 'ocu'], ['T8', 4, 'pronto'], ['T9', 8, 'ocu'], ['T10', 6, 'libre'], ['T11', 4, 'pronto'], ['T12', 4, 'ocu']] },
        { id: 'palmas', name: 'Comedor Palmas', icon: 'fork', cols: 3, tables: [
          ['P1', 6, 'ocu'], ['P2', 4, 'pronto'], ['P3', 4, 'ocu'], ['P4', 4, 'ocu'], ['P5', 4, 'pronto'], ['P6', 4, 'pronto'],
          ['P7', 4, 'ocu'], ['P8', 4, 'libre'], ['P9', 2, 'libre']] }
      ].map(z => ({ ...z, tables: z.tables.map(([id, cap, st]) => ({ id, cap, st, who: id === 'A7' ? 'Restrepo' : id === 'T3' ? 'Cárdenas' : null })) })),
      arrivals: [
        { id: 'r1', name: 'Familia Restrepo', fam: 4, inv: 2, time: '1:00', zona: 'aire' },
        { id: 'r2', name: 'Familia Cárdenas', fam: 3, inv: 0, time: '1:15', zona: 'terraza' }
      ],
      wait: [
        { id: 'w1', name: 'Familia Gómez', n: 5, zona: 'cualquier zona', notified: null },
        { id: 'w2', name: 'Familia Ortiz', n: 2, zona: 'Palmas', notified: null }
      ]
    },
    C: {
      phone: 'carta', cat: 'Fuertes', cart: [], open: null, opts: { termino: 'Tres cuartos', acomp: 'Papa criolla', nota: '' },
      nextId: 250, my: null, sel: 229, rating: 0, courtesy: false,
      stats: { rev: 214, corr: 6, dev: 3 },
      menu: [
        { id: 'churrasco', name: 'Churrasco 300 g', cat: 'Fuertes', price: 62000, min: 30, st: 'ok', icon: 'fork', options: true, hot: 68 },
        { id: 'bandeja', name: 'Bandeja paisa', cat: 'Fuertes', price: 46000, min: 25, st: 'ok', icon: 'fork', hot: 66 },
        { id: 'frijolada', name: 'Frijolada', cat: 'Fuertes', price: 36000, min: 25, st: 'off', icon: 'fork', hot: 66 },
        { id: 'pechuga', name: 'Pechuga a la plancha', cat: 'Fuertes', price: 41000, min: 20, st: 'ok', icon: 'fork', hot: 67 },
        { id: 'ajiaco', name: 'Ajiaco santafereño', cat: 'Sopas', price: 38000, min: 12, st: 'ok', fast: true, icon: 'bowl', hot: 58 },
        { id: 'sancocho', name: 'Sancocho de gallina', cat: 'Sopas', price: 34000, min: 20, st: 'few', icon: 'bowl', hot: 72 },
        { id: 'limonada', name: 'Limonada de coco', cat: 'Bebidas', price: 9000, min: 6, st: 'ok', fast: true, icon: 'glass' },
        { id: 'lulo', name: 'Jugo de lulo', cat: 'Bebidas', price: 8000, min: 5, st: 'ok', fast: true, icon: 'glass' }
      ],
      orders: [
        mkPase(229, 'Restaurante 11', 'Camila', T(12, 51), [['Pechuga a la plancha', 2, '', 67], ['Jugo de lulo', 2, '', null]], true),
        mkPase(236, 'Palmas 5', 'Julián', T(12, 56), [['Bandeja paisa', 2, 'una sin chicharrón', 66], ['Sancocho de gallina', 1, '', 72]], false),
        mkPase(240, 'Kiosko 2', 'Sofía', T(13, 1), [['Limonada de coco', 2, '', null]], false)
      ]
    }
  };
}
function checksFor(name, note) {
  const c = [{ l: 'Completo según la comanda', d: false }];
  if (/Churrasco/.test(name)) c.push({ l: 'Acompañamiento estándar y término pedido', d: false });
  else if (/Ajiaco/.test(name)) c.push({ l: 'Crema, alcaparras y aguacate aparte', d: false });
  else if (/Limonada|Jugo/.test(name)) c.push({ l: 'Vaso del Club, hielo y presentación', d: false });
  else c.push({ l: 'Presentación igual a la foto estándar', d: false });
  if (note) c.push({ l: 'Observación: ' + note, d: false });
  return c;
}

function applyFirebaseProducts(products) {
  if (!Array.isArray(products) || !products.length) return;
  const menu = products.map(product => ({ ...product }));
  S.A.menu = menu.map(product => ({ ...product, min: product.min || 20 }));
  S.C.menu = menu;
  render();
}

function mkPase(id, mesa, mesero, t, items, preDone) {
  return {
    id, mesa, mesero, t, st: 'pase', notified: false,
    items: items.map(([name, qty, note, temp]) => {
      const checks = checksFor(name, note);
      if (preDone) checks.forEach(x => (x.d = true));
      return { name, qty, note, temp, checks };
    })
  };
}

let S = initial();
const timers = new Set();
const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
const every = (fn, ms) => { const id = setInterval(() => { if (fn() === false) { clearInterval(id); timers.delete(id); } }, ms); timers.add(id); };

/* ---------- aviso flotante ---------- */
let toastTimer;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 2800);
}

/* =========================================================
   PROPUESTA A · Sincronía A&B
   ========================================================= */
const A_GOAL = 30;
const elapsed = o => S.clock - o.t;
const isLate = o => (o.st === 'pend' || o.st === 'prep') && elapsed(o) > A_GOAL;
const aActive = () => S.A.orders.filter(o => o.st !== 'entregado');
const dishById = id => S.A.menu.find(d => d.id === id);
const OCCUP = { Restaurante: 96, Terraza: 100, Palmas: 88, Kiosko: 60 };
const PUNTO = { Restaurante: 'Restaurante principal', Terraza: 'Terraza', Palmas: 'Comedor Palmas', Kiosko: 'Kiosko piscina' };

function aAlerts() {
  const A = S.A, out = [];
  aActive().filter(isLate).sort((a, b) => a.t - b.t).forEach(o => out.push({ k: 'bad', i: 'clock', t: `Pedido retrasado · #${o.id}`, d: `${PUNTO[o.punto]}, mesa ${o.mesa} · ${elapsed(o)} min desde la comanda` }));
  A.notices.slice().reverse().forEach(n => { const d = dishById(n.dish); if (d && d.st === 'off') out.push({ k: 'neu', i: 'ban', t: `${d.name} agotada · ${hm(n.t)}`, d: `Retirada del menú · ${n.conf} de ${A.staff} meseros confirmaron el aviso` }); });
  A.menu.filter(d => d.st === 'few').forEach(d => out.push({ k: 'warn', i: 'warn', t: 'Pocas porciones', d: `${d.name}: quedan ${d.left}` }));
  out.push({ k: 'warn', i: 'users', t: 'Evento no previsto · 1:30 p. m.', d: 'Cumpleaños de 25 personas en Comedor Palmas' });
  const ready = aActive().filter(o => o.st === 'listo').length;
  if (ready) out.push({ k: 'ok', i: 'bell', t: `${ready} pedido${ready > 1 ? 's' : ''} listo${ready > 1 ? 's' : ''} en el pase`, d: 'Los meseros ya recibieron el aviso' });
  return out;
}
const alertHTML = a => `<div class="alert a-${a.k}">${ic(a.i, 20, a.k === 'bad' ? 'var(--bad)' : a.k === 'warn' ? 'var(--warn)' : a.k === 'ok' ? 'var(--ok)' : 'var(--ink)')}<div class="grow"><span class="tt">${esc(a.t)}</span><span>${esc(a.d)}</span></div></div>`;

function viewA() {
  const A = S.A;
  return `
  ${guide('Propuesta A', 'Sincronía A&B: cocina y salón ven la misma información',
    'Cocina marca el estado de cada pedido y la disponibilidad de cada plato. El encargado de A&B y los meseros lo ven al instante. Responde a C3 (la información viaja en una sola dirección) y C4 (el momento de verdad es la llegada del plato).',
    ['En <b>Cocina</b>, marca el <b>Sancocho de gallina</b> como agotado.', 'Mira cómo le llega el aviso a Andrés en el celular y toca <b>Entendido</b>.', 'Desde el celular crea un pedido nuevo y muévelo en Cocina hasta <b>Entregado</b>.', 'Usa <b>+5 min</b> para ver cómo aparecen los retrasos en el panel.'])}
  <div class="stage">
    <div style="min-width:0">
      <p class="caption">Pantalla de escritorio</p>
      <div class="seg" role="group" aria-label="Pantalla">
        <button data-act="aScreen" data-arg="panel" aria-pressed="${A.screen === 'panel'}">A1 · Panel de control</button>
        <button data-act="aScreen" data-arg="cocina" aria-pressed="${A.screen === 'cocina'}">A2 · Cocina y disponibilidad</button>
      </div>
      ${A.screen === 'panel' ? aPanel() : aKitchen()}
    </div>
    <div class="phone-wrap"><p class="caption">A3 · App del mesero</p>${aWaiter()}</div>
  </div>`;
}

function aPanel() {
  const act = aActive();
  const late = act.filter(isLate);
  const pend = act.filter(o => o.st === 'pend' && !isLate(o)).length;
  const prep = act.filter(o => o.st === 'prep' && !isLate(o)).length;
  const ready = act.filter(o => o.st === 'listo').length;
  const waiting = act.filter(o => o.st !== 'listo');
  const avg = waiting.length ? Math.round(sum(waiting, elapsed) / waiting.length) : 0;
  const prevista = [110, 240, 330, 300, 170, 80], real = { 11: 125, 12: 285, 13: 368, 14: 318, 15: 160, 16: 70 };
  const nowH = Math.floor(S.clock / 60), px = v => Math.round(v * 0.5);
  const bars = [11, 12, 13, 14, 15, 16].map((h, k) => {
    const r = h <= nowH ? real[h] : null;
    return `<div class="grp"><div class="bcol"><span>${prevista[k]}</span><div class="b-prev" style="height:${px(prevista[k])}px"></div></div><div class="bcol"><span style="color:${r && r > 300 ? 'var(--bad)' : 'var(--green)'};font-weight:700">${r ?? '—'}</span><div class="b-real" style="height:${r ? px(r) : 0}px"></div></div></div>`;
  }).join('');
  const att = act.filter(o => o.st !== 'listo').sort((a, b) => a.t - b.t).slice(0, 4);
  const rows = ['Restaurante', 'Terraza', 'Palmas', 'Kiosko'].map(p => {
    const os = act.filter(o => o.punto === p), w = os.filter(o => o.st !== 'listo');
    const av = w.length ? Math.round(sum(w, elapsed) / w.length) : 0, lt = os.filter(isLate).length;
    const col = av > A_GOAL ? 'var(--bad)' : av > 25 ? 'var(--warn)' : 'var(--ok)';
    return `<tr><td><b>${PUNTO[p]}</b></td><td>${os.length}</td><td style="color:${col};font-weight:700">${w.length ? av + ' min' : '—'}</td><td style="color:${lt ? 'var(--bad)' : 'inherit'};font-weight:${lt ? 700 : 400}">${lt}</td><td><div style="display:flex;align-items:center;gap:8px"><div class="bar"><i style="width:${OCCUP[p]}%"></i></div><span>${OCCUP[p]} %</span></div></td></tr>`;
  }).join('');
  return `<div class="screen">
    ${appHead('Sincronía A&B · Panel de control', 'Director de A&B', `Domingo 26 · ${hmp(S.clock)}`)}
    <div class="sbody">
      <div class="kpis">
        <div class="kpi dark"><span class="l">Pedidos activos</span><span class="v">${act.length}</span><span class="n">En los cuatro puntos</span></div>
        <div class="kpi"><span class="l"><span class="dot" style="border:2px solid var(--muted)"></span>Pendientes</span><span class="v">${pend}</span><span class="n">Esperan que cocina los tome</span></div>
        <div class="kpi"><span class="l" style="color:var(--warn)"><span class="dot" style="background:var(--warn-dot)"></span>En preparación</span><span class="v">${prep}</span><span class="n">En las estaciones</span></div>
        <div class="kpi"><span class="l" style="color:var(--ok)">${ic('check', 13, 'currentColor', 3)}Listos</span><span class="v">${ready}</span><span class="n">Esperando al mesero</span></div>
        <div class="kpi bad"><span class="l">${ic('warn', 13, 'currentColor', 2.5)}Retrasados</span><span class="v">${late.length}</span><span class="n">Más de ${A_GOAL} min</span></div>
        <div class="kpi"><span class="l">${ic('clock', 13)}Espera promedio</span><span class="v">${avg}<small style="font-size:16px"> min</small></span><span class="n" style="color:${avg > A_GOAL ? 'var(--bad)' : 'var(--ok)'};font-weight:700">Meta: ${A_GOAL} min o menos</span></div>
      </div>
      <div class="row c2">
        <section class="card">
          <div class="card-head"><div><h2>Demanda prevista frente a la real</h2><span class="sub">Comensales por franja · hoy</span></div>
            <div class="legend"><span><i class="sw" style="background:#DCE6DF;border:1.5px solid var(--sage)"></i>Prevista</span><span><i class="sw" style="background:var(--green)"></i>Real</span><span><i style="width:16px;border-top:2px dashed var(--bad)"></i>Capacidad cómoda</span></div></div>
          <div class="chart" role="img" aria-label="Barras de comensales previstos y reales por hora; a la 1:00 p. m. hay 368 reales frente a 330 previstos, por encima de la capacidad cómoda de 300">
            <div class="cap" style="bottom:150px"></div><span class="capl" style="bottom:153px">300</span>${bars}
          </div>
          <div class="xlab">${[11, 12, 13, 14, 15, 16].map(h => `<span style="${h === nowH ? 'color:var(--green);font-weight:700' : ''}">${hm(h * 60)}${h === nowH ? ' · ahora' : ''}</span>`).join('')}</div>
          <div class="alert a-warn" style="margin-top:12px">${ic('chart', 20, 'var(--warn)')}<div class="grow"><span class="tt">+12 % sobre lo previsto a la 1:00 p. m.</span><span>Llegaron 47 invitados que no estaban anunciados.</span></div></div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Alertas</h2><span class="badge bg-neu">${aAlerts().length} activas</span></div>
          <div class="stack" data-scroll="a-alerts" style="max-height:330px;overflow-y:auto">${aAlerts().map(alertHTML).join('')}</div>
        </section>
      </div>
      <div class="row c2">
        <section class="card"><div class="card-head"><h2>Estado por punto de servicio</h2></div>
          <div class="tablewrap"><table><thead><tr><th>Punto</th><th>Activos</th><th>Espera prom.</th><th>Retrasados</th><th>Ocupación</th></tr></thead><tbody>${rows}</tbody></table></div>
        </section>
        <section class="card"><div class="card-head"><h2>Pedidos que necesitan atención</h2><button class="btn sm" data-act="aScreen" data-arg="cocina">Ir a cocina</button></div>
          <div class="stack">${att.map(o => { const e = elapsed(o), pct = Math.min(100, Math.round(e / A_GOAL * 100)), c = e > A_GOAL ? 'var(--bad)' : e > 25 ? 'var(--warn-dot)' : 'var(--green)';
            return `<div><div style="display:flex;justify-content:space-between;font-size:14px;gap:8px"><span><b>#${o.id}</b> · ${PUNTO[o.punto]}, mesa ${o.mesa} · ${o.mesero}</span><b class="tnum" style="color:${e > A_GOAL ? 'var(--bad)' : 'inherit'}">${e} min</b></div><div class="bar" style="margin-top:6px"><i style="width:${pct}%;background:${c}"></i></div></div>`; }).join('') || '<p class="empty">No hay pedidos en espera.</p>'}
            <p class="sub" style="margin:0">La barra se llena al llegar a la meta de ${A_GOAL} minutos.</p></div>
        </section>
      </div>
    </div></div>`;
}

function orderCard(o) {
  const late = isLate(o), e = elapsed(o);
  const items = o.items.map(([q, n, note]) => `<li>${q}× ${esc(n)}${note ? ` · <b>${esc(note)}</b>` : ''}</li>`).join('');
  let action = '';
  if (o.st === 'pend') action = `<button class="btn ${late ? 'bad' : 'primary'} block" data-act="aMove" data-arg="${o.id}:prep">Empezar</button>`;
  else if (o.st === 'prep') action = `<button class="btn ${late ? 'bad' : 'ok'} block" data-act="aMove" data-arg="${o.id}:listo">Marcar listo</button>`;
  else if (o.st === 'listo') action = `<span class="sub" style="color:var(--ok);display:flex;gap:6px;align-items:center">${ic('bell', 14)}${o.mesero} fue avisado</span><button class="btn block" data-act="aMove" data-arg="${o.id}:entregado">Entregado</button>`;
  return `<article class="ocard ${late ? 'late' : o.st === 'listo' ? 'ready' : ''}">
    <div class="top2"><span class="id">#${o.id}</span><span class="meta" style="${late ? 'color:var(--bad);font-weight:700' : ''}">${hm(o.t)} · ${o.st === 'listo' ? 'listo' : e + ' min'}</span></div>
    <b style="font-size:14px">${PUNTO[o.punto]} · Mesa ${o.mesa}</b>
    <ul>${items}</ul>
    ${late ? `<span class="sub" style="color:var(--bad-ink)">+${e - A_GOAL} min sobre la meta · el mesero ya fue avisado</span>` : ''}
    ${action}</article>`;
}

function aKitchen() {
  const A = S.A, act = aActive();
  const cols = [
    ['Pendiente', 'k-pend', act.filter(o => o.st === 'pend' && !isLate(o)), '<span class="dot" style="border:2px solid #5E6560"></span>'],
    ['En preparación', 'k-prep', act.filter(o => o.st === 'prep' && !isLate(o)), '<span class="dot" style="background:var(--warn-dot)"></span>'],
    ['Retrasado', 'k-late', act.filter(isLate), ic('warn', 14, '#fff', 2.5)],
    ['Listo', 'k-ok', act.filter(o => o.st === 'listo'), ic('check', 14, 'currentColor', 3)]
  ].map(([t, cls, os, i]) => `<div class="kcol"><div class="khead ${cls}"><span style="display:flex;align-items:center;gap:8px">${i}${t}</span><span class="tnum">${os.length}</span></div>${os.sort((a, b) => a.t - b.t).map(orderCard).join('') || '<p class="empty">Sin pedidos</p>'}</div>`).join('');
  const last = A.notices[A.notices.length - 1], ld = last && dishById(last.dish);
  const notice = last && ld ? `<div class="notice"><span class="l">${ic('send', 16)}Aviso enviado al salón</span><b style="font-size:17px">${esc(ld.name)} agotada · ${hm(last.t)}</b><span style="font-size:13px;color:var(--on-dark-2)">Se retiró del menú en los cuatro puntos y les llegó a los meseros en su celular.</span><div style="display:flex;align-items:center;gap:10px"><div class="pbar"><i style="width:${Math.round(last.conf / A.staff * 100)}%"></i></div><b class="tnum" style="font-size:13px">${last.conf} de ${A.staff} confirmaron</b></div></div>` : '';
  const menu = A.menu.map(d => {
    if (A.confirming === d.id) return `<div class="confirm"><div><b>${esc(d.name)}</b><div class="st st-warn">${d.st === 'few' ? '▲ Quedan ' + d.left + ' porciones' : '● Disponible'}</div></div><span style="font-size:14px;color:var(--warn-ink)">¿Marcarlo como agotado? Se retira del menú en todos los puntos y se avisa a ${A.staff} meseros.</span><div style="display:flex;gap:8px"><button class="btn sm" data-act="aCancel">Cancelar</button><button class="btn sm primary" style="flex:1" data-act="aOff" data-arg="${d.id}">Sí, marcar agotado y avisar</button></div></div>`;
    const st = d.st === 'off' ? `<span class="st st-off">⊘ Agotado desde ${hm(d.since)}</span>` : d.st === 'few' ? `<span class="st st-warn">▲ Quedan ${d.left} porciones</span>` : '<span class="st st-ok">● Disponible</span>';
    const btn = d.st === 'off' ? `<button class="btn sm" style="border-color:var(--green);color:var(--green)" data-act="aOn" data-arg="${d.id}">Reactivar</button>` : `<button class="btn sm" data-act="aAsk" data-arg="${d.id}">Marcar agotado</button>`;
    return `<div class="menu-row"><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="${d.st === 'off' ? 'struck' : ''}" style="font-weight:600">${esc(d.name)}</span>${st}</div>${btn}</div>`;
  }).join('');
  return `<div class="screen">
    ${appHead('Sincronía A&B · Cocina, línea caliente', 'Chef de turno', `${hmp(S.clock)} · meta ${A_GOAL} min`)}
    <div class="sbody">
      <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
        <div style="flex:999 1 720px;min-width:0"><div class="kanban">${cols}</div></div>
        <aside class="stack" style="flex:1 1 300px;min-width:0">${notice}
          <section class="card"><div class="card-head"><h2>Disponibilidad del menú</h2><span class="sub">Menú del domingo</span></div><div data-scroll="a-menu" style="max-height:520px;overflow-y:auto;padding-right:4px">${menu}</div></section>
        </aside>
      </div>
    </div></div>`;
}

function aWaiter() {
  const A = S.A, mine = aActive().filter(o => o.mesero === 'Andrés');
  const unread = A.notices.filter(n => !n.mine && dishById(n.dish)?.st === 'off');
  const lateMine = mine.filter(isLate);
  const tab = A.waiterTab;
  let body;
  if (tab === 'mesas') {
    const alerts = unread.map(n => `<div class="alert a-dark">${ic('ban', 22, '#fff')}<div class="grow"><span class="tt">Se agotó: ${esc(dishById(n.dish).name)}</span><span style="font-size:12px;color:#D9DCD9">Cocina · ${hm(n.t)} · ya no lo ofrezcas</span></div><button class="btn sm" style="background:#fff;border-color:#fff;color:var(--ink)" data-act="aAck" data-arg="${n.id}">Entendido</button></div>`).join('')
      + lateMine.map(o => `<div class="alert a-bad" style="border:1px solid var(--bad-line)">${ic('clock', 22, 'var(--bad)')}<div class="grow"><span class="tt">Mesa ${o.mesa} · el pedido va en ${elapsed(o)} min</span><span style="font-size:12px;color:var(--bad-ink)">Cocina ya lo ve como retrasado. Avísale a la mesa.</span></div></div>`).join('');
    const cards = mine.sort((a, b) => a.mesa - b.mesa).map(o => {
      const late = isLate(o), e = elapsed(o);
      const st = o.st === 'listo' ? `<span class="st st-ok">✓ Recoger en el pase</span>` : late ? `<span class="st" style="color:var(--bad)">▲ Retrasado · #${o.id}</span>` : o.st === 'prep' ? `<span class="st st-warn">● En preparación</span>` : `<span class="st" style="color:var(--muted)">○ Pendiente en cocina</span>`;
      return `<div class="tcard ${late ? 'late' : o.st === 'listo' ? 'ready' : ''}"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:16px">Mesa ${o.mesa}</b><b class="tnum" style="font-size:13px;color:${late ? 'var(--bad)' : o.st === 'listo' ? 'var(--ok)' : 'var(--muted)'}">${o.st === 'listo' ? 'Listo' : e + ' min'}</b></div>${st}${o.st === 'listo' ? `<button class="btn sm ok" style="margin-top:4px" data-act="aMove" data-arg="${o.id}:entregado">Entregado</button>` : ''}</div>`;
    }).join('');
    body = `${alerts}<h3 class="h3s">Mis mesas <span>Meta: ${A_GOAL} min</span></h3><div class="grid2">${cards || '<p class="empty" style="grid-column:span 2">No tienes pedidos activos.</p>'}</div>`;
  } else if (tab === 'menu') {
    body = ['Fuertes', 'Sopas', 'Bebidas'].map(c => `<h3 class="h3s">${c} <span>Actualizado al instante</span></h3><div class="list">${A.menu.filter(d => d.cat === c).map(d => `<div class="li"><div style="min-width:0"><div class="nm ${d.st === 'off' ? 'struck' : ''}">${esc(d.name)}</div><div class="ds">${d.st === 'off' ? 'Desde las ' + hm(d.since) : 'Sale en ~' + d.min + ' min'}</div></div>${d.st === 'off' ? '<span class="tag-off">Agotado</span>' : d.st === 'few' ? `<span class="st st-warn">Quedan ${d.left}</span>` : '<span class="st st-ok">Disponible</span>'}</div>`).join('')}</div>`).join('');
  } else {
    const dr = A.draft, n = sum(Object.values(dr.items), x => x);
    body = `<h3 class="h3s">Mesa</h3><div class="chips">${[4, 9, 10, 12, 14].map(m => `<button class="chip-b" data-act="aMesa" data-arg="${m}" aria-pressed="${dr.mesa === m}">Mesa ${m}</button>`).join('')}</div>
      <h3 class="h3s">Platos <span>Solo puedes pedir lo disponible</span></h3>
      <div class="list" data-scroll="a-new">${A.menu.map(d => { const q = dr.items[d.id] || 0; return `<div class="li"><div style="min-width:0"><div class="nm ${d.st === 'off' ? 'struck' : ''}">${esc(d.name)}</div><div class="ds">${d.st === 'off' ? 'Agotado' : d.st === 'few' ? 'Quedan ' + d.left + ' · ~' + d.min + ' min' : '~' + d.min + ' min'}</div></div>${d.st === 'off' ? '<span class="tag-off">Agotado</span>' : `<div class="stepper"><button data-act="aQty" data-arg="${d.id}:-1" aria-label="Quitar ${esc(d.name)}" ${q ? '' : 'disabled'}>−</button><output class="tnum">${q}</output><button class="plus" data-act="aQty" data-arg="${d.id}:1" aria-label="Agregar ${esc(d.name)}">+</button></div>`}</div>`; }).join('')}</div>
      <button class="btn primary block" data-act="aSend" ${n ? '' : 'disabled'}>Enviar a cocina · ${n} plato${n === 1 ? '' : 's'}</button>`;
  }
  const badge = unread.length + lateMine.length;
  return `<div class="phone">
    <div class="ph-head"><div><h3>Hola, Andrés</h3><small>Terraza · ${hmp(S.clock)} · ${mine.length} mesas activas</small></div>
      <button class="bell" data-act="aWTab" data-arg="mesas" aria-label="Alertas: ${badge} nuevas">${ic('bell', 20)}${badge ? `<b>${badge}</b>` : ''}</button></div>
    <div class="ph-body" data-scroll="a-phone">${body}</div>
    <nav class="ph-nav" aria-label="Secciones del mesero">
      <button data-act="aWTab" data-arg="mesas" ${tab === 'mesas' ? 'aria-current="page"' : ''}>${ic('grid', 22)}Mesas</button>
      <button data-act="aWTab" data-arg="menu" ${tab === 'menu' ? 'aria-current="page"' : ''}>${ic('fork', 22)}Menú</button>
      <button data-act="aWTab" data-arg="nuevo" ${tab === 'nuevo' ? 'aria-current="page"' : ''}>${ic('plus', 22)}Nuevo pedido</button>
    </nav></div>`;
}

/* =========================================================
   PROPUESTA B · Domingo previsto
   ========================================================= */
const SLOTS = [['12:00', 12], ['12:30', 12], ['1:00', 13], ['1:30', 13], ['2:00', 14]];
const hourOf = slot => SLOTS.find(s => s[0] === slot)[1];
const hTot = x => x.s + x.i + x.e;
const bTotals = () => { const H = S.B.hours; return { s: sum(H, x => x.s), i: sum(H, x => x.i), e: sum(H, x => x.e), t: sum(H, hTot) }; };
function occ(h) {
  const x = S.B.hours.find(y => y.h === h), p = hTot(x) / S.B.cap;
  if (p >= 1) return ['Muy lleno', 'var(--bad)', 1];
  if (p >= 0.9) return ['Lleno', 'var(--bad)', p];
  if (p >= 0.6) return ['Moderado', 'var(--warn)', p];
  return ['Tranquilo', 'var(--ok)', p];
}

function viewB() {
  const B = S.B;
  return `
  ${guide('Propuesta B', 'Domingo previsto: anticipar la demanda antes de que llegue',
    'El socio avisa si viene y con cuántos invitados, sin que sea una reserva obligatoria. La cocina planea con esos datos y la recepción asigna mesa al llegar. Responde a C2 (la demanda que nadie anuncia) y al primer momento de verdad: buscar mesa.',
    ['En la <b>app del socio</b>, elige personas, hora y zona, y confirma.', 'Mira cómo cambian el pronóstico y las porciones sugeridas en <b>Planeación</b>.', 'Envía la sugerencia de horario a la franja de 1:00 p. m., que está llena.', 'En <b>Recepción</b>, asigna mesa a quien llega o libera una mesa tocándola.'])}
  <div class="stage">
    <div style="min-width:0">
      <p class="caption">Pantallas del Club</p>
      <div class="seg" role="group" aria-label="Pantalla">
        <button data-act="bScreen" data-arg="plan" aria-pressed="${B.screen === 'plan'}">B2 · Planeación de cocina</button>
        <button data-act="bScreen" data-arg="recep" aria-pressed="${B.screen === 'recep'}">B3 · Recepción de mesas (tableta)</button>
      </div>
      ${B.screen === 'plan' ? bPlan() : bRecep()}
    </div>
    <div class="phone-wrap"><p class="caption">B1 · App del socio</p>${bSocio()}</div>
  </div>`;
}

function bPlan() {
  const B = S.B, tt = bTotals(), factor = tt.t / B.hist;
  const scale = 0.6, capPx = B.cap * scale;
  const bars = B.hours.map(x => { const over = hTot(x) > B.cap; return `<div class="bcol"><span style="font-weight:700;color:${over ? 'var(--bad)' : 'var(--ink)'}">${hTot(x)}</span><div class="stacked"><div style="height:${Math.round(x.e * scale)}px;background:var(--bg-2);border:1.5px dashed #9A8F78;border-bottom:none;border-radius:4px 4px 0 0"></div><div style="height:${Math.round(x.i * scale)}px;background:var(--sage)"></div><div style="height:${Math.round(x.s * scale)}px;background:var(--green)"></div></div></div>`; }).join('');
  const worst = B.hours.reduce((a, b) => (hTot(b) > hTot(a) ? b : a));
  const overPct = Math.round((hTot(worst) / B.cap - 1) * 100);
  let alertBox;
  if (B.suggested) alertBox = `<div class="alert a-ok">${ic('check', 20, 'var(--ok)')}<div class="grow"><span class="tt">Sugerencia enviada a 41 familias con horario flexible</span><span>Aceptaron ${B.suggested.fam}: ${B.suggested.people} personas pasan a las 12:30 y a las 2:00 p. m.</span></div></div>`;
  else if (overPct > 0) alertBox = `<div class="alert a-bad" style="flex-wrap:wrap">${ic('warn', 20, 'var(--bad)')}<div class="grow" style="flex:1 1 260px"><span class="tt">La franja de ${hmp(worst.h * 60)} supera en ${overPct} % la capacidad cómoda.</span><span style="color:var(--bad-ink)">Hay 41 familias que marcaron horario flexible.</span></div><button class="btn sm bad" data-act="bSuggest">Sugerirles 12:30 o 2:00 p. m.</button></div>`;
  else alertBox = `<div class="alert a-ok">${ic('check', 20, 'var(--ok)')}<div class="grow"><span class="tt">Ninguna franja supera la capacidad cómoda</span><span>La cocina puede trabajar con el personal de siempre.</span></div></div>`;
  const rows = B.dishes.map(d => { const sug = Math.round(d.base * factor * (d.clima || 1) + (d.extra || 0)); const adj = Math.round((sug / d.base - 1) * 100);
    return `<tr><td><b>${d.name}</b></td><td>${d.base}</td><td style="color:var(--ok);font-weight:700">${adj >= 0 ? '+' : ''}${adj} %${d.note ? ` <span class="sub" style="font-weight:400">(${d.note})</span>` : ''}</td><td style="font-size:17px;font-weight:700">${sug}</td><td style="color:${d.warn ? 'var(--warn)' : 'var(--ok)'};font-weight:700">${d.warn ? '▲ ' + d.stock : '✓ Completos'}</td></tr>`; }).join('');
  return `<div class="screen">
    ${appHead('Domingo previsto · Planeación de cocina', 'Chef ejecutivo', 'Sábado 25 · 4:00 p. m.')}
    <div class="sbody">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px">
        <div><h2 style="margin:0;font-family:var(--display);font-size:24px;color:var(--green)">Así viene el domingo 26 de octubre</h2><span class="sub">Histórico de los últimos domingos, más lo que socios y eventos ya anunciaron</span></div>
        <button class="btn ${B.sentWarehouse ? '' : 'primary'}" data-act="bWarehouse" ${B.sentWarehouse ? 'disabled' : ''}>${B.sentWarehouse ? '✓ Pedido enviado al almacén' : 'Enviar pedido al almacén'}</button>
      </div>
      <div class="kpis">
        <div class="kpi dark"><span class="l">Comensales previstos</span><span class="v">${tt.t.toLocaleString('es-CO')}</span><span class="n">Solo con el histórico: ${B.hist}</span></div>
        <div class="kpi"><span class="l"><i class="sw" style="background:var(--green)"></i>Socios confirmados</span><span class="v">${tt.s}</span><span class="n">Avisaron en la app</span></div>
        <div class="kpi"><span class="l"><i class="sw" style="background:var(--sage)"></i>Invitados anunciados</span><span class="v">${tt.i}</span><span class="n">Antes no entraban en el cálculo</span></div>
        <div class="kpi"><span class="l"><i class="sw" style="background:var(--bg-2);border:1.5px dashed #9A8F78"></i>Sin confirmar</span><span class="v">${tt.e}</span><span class="n">Suelen venir y no avisaron</span></div>
      </div>
      <div class="row c2">
        <section class="card"><div class="card-head"><div><h2>Comensales previstos por franja</h2><span class="sub">Almuerzo del domingo</span></div><div class="legend"><span><i style="width:16px;border-top:2px dashed var(--bad)"></i>Capacidad cómoda: ${B.cap} por hora</span></div></div>
          <div class="chart" style="height:250px" role="img" aria-label="Barras apiladas de socios, invitados y no confirmados por hora del domingo">
            <div class="cap" style="bottom:${capPx}px"></div><span class="capl" style="bottom:${capPx + 3}px">${B.cap}</span>${bars}</div>
          <div class="xlab">${B.hours.map(x => `<span>${hm(x.h * 60)}</span>`).join('')}</div>
          <div style="margin-top:12px">${alertBox}</div>
        </section>
        <section class="card"><div class="card-head"><h2>Lo que ya sabemos del domingo</h2></div><div class="stack">
          <div class="alert" style="border:1px solid var(--line)">${ic('gift', 22, 'var(--green)')}<div class="grow"><span class="tt">Cumpleaños · 25 personas</span><span>Comedor Palmas · 1:30 p. m. · anunciado el miércoles</span><span style="color:var(--ok);font-weight:700;font-size:13px">Menú cerrado: 25 bandejas paisas</span></div></div>
          <div class="alert" style="border:1px solid var(--line)">${ic('users', 22, 'var(--green)')}<div class="grow"><span class="tt">Grupo de golf · 18 personas</span><span>Terraza · 12:30 p. m. · anunciado hoy</span><span style="color:var(--warn);font-weight:700;font-size:13px">Menú abierto: confirmar cantidades</span></div></div>
          <div class="alert" style="border:1px solid var(--line)">${ic('sun', 22, 'var(--green)')}<div class="grow"><span class="tt">Pronóstico: soleado, 29 °C</span><span>Más demanda en terraza y de bebidas frías</span></div></div>
          ${hTot(worst) > B.cap ? `<div class="alert a-warn">${ic('users', 22, 'var(--warn)')}<div class="grow"><span class="tt">Refuerzo sugerido</span><span>2 personas más en línea caliente de 12:30 a 2:30 p. m.</span></div></div>` : ''}
        </div></section>
      </div>
      <section class="card"><div class="card-head"><h2>Producción sugerida para el mise en place</h2><span class="sub">Se recalcula con cada confirmación · el chef puede ajustarla</span></div>
        <div class="tablewrap"><table style="min-width:640px"><thead><tr><th>Plato</th><th>Promedio de domingos</th><th>Ajuste</th><th>Porciones sugeridas</th><th>Insumos</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    </div></div>`;
}

function bSuggestTable(a) {
  const n = a.fam + a.inv, zs = S.B.zones;
  const pref = zs.find(z => z.id === a.zona) || zs[0];
  const own = zs.flatMap(z => z.tables).find(t => t.st === 'apa' && t.who && a.name.includes(t.who));
  if (own) return own;
  const fit = z => z.tables.filter(t => (t.st === 'libre' || (t.st === 'apa' && !t.who)) && t.cap >= n).sort((x, y) => x.cap - y.cap)[0];
  return fit(pref) || zs.map(fit).find(Boolean) || null;
}
function bRecep() {
  const B = S.B, all = B.zones.flatMap(z => z.tables);
  const libres = all.filter(t => t.st === 'libre').length, pronto = all.filter(t => t.st === 'pronto').length;
  const zones = B.zones.map(z => {
    const l = z.tables.filter(t => t.st === 'libre').length, p = z.tables.filter(t => t.st === 'pronto').length;
    const tb = z.tables.map(t => {
      const lab = t.st === 'libre' ? `Libre · ${t.cap} p.` : t.st === 'pronto' ? 'Se libera' : t.st === 'apa' ? (t.who ? 'Para ' + t.who : 'Apartada') : `${t.cap} p.`;
      const hint = t.st === 'ocu' ? 'tocar: pidió la cuenta' : t.st === 'pronto' ? 'tocar: liberar' : t.st === 'libre' ? (B.wait.length ? 'tocar: dar al siguiente en espera' : 'libre') : 'apartada';
      return `<button class="tbl t-${t.st}" data-act="bTable" data-arg="${t.id}" aria-label="Mesa ${t.id}, ${lab}; ${hint}"><b>${t.id}</b><span>${lab}</span></button>`;
    }).join('');
    return `<section class="card" style="padding:14px"><div class="card-head" style="margin-bottom:10px"><span style="display:flex;align-items:center;gap:8px;font-weight:700;color:var(--green)">${ic(z.icon, 18)}${z.name}</span><span class="sub">${l} libres · ${p} se liberan</span></div><div class="tmap" style="grid-template-columns:repeat(${z.cols},minmax(0,1fr))">${tb}</div></section>`;
  }).join('');
  const arr = B.arrivals.map(a => { const t = bSuggestTable(a); return `<div class="stack" style="gap:6px;padding:12px;border-radius:12px;background:var(--green-soft)"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(a.name)}</b><span class="st st-ok">Confirmó · ${a.time}</span></div><span class="sub" style="color:var(--ink)">${a.fam} de la familia${a.inv ? ' + ' + a.inv + ' invitados' : ''} · prefiere ${a.zona === 'aire' ? 'aire' : a.zona === 'terraza' ? 'terraza' : 'Palmas'}</span>${t ? `<button class="btn primary sm" data-act="bAssign" data-arg="${a.id}:${t.id}">Asignar mesa ${t.id} (${t.cap} p.) y avisar al mesero</button>` : '<span class="st st-warn">No hay mesa libre del tamaño: pasa a la lista de espera</span>'}</div>`; }).join('') || '<p class="empty">Nadie más confirmó para esta hora.</p>';
  const wait = B.wait.map(w => `<div class="stack" style="gap:6px;padding:12px;border-radius:12px;border:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(w.name)}</b><span class="st st-warn">~${w.n > 4 ? 10 : 5} min</span></div><span class="sub" style="color:var(--ink)">${w.n} personas · no avisó · ${esc(w.zona)}</span>${w.notified ? `<span class="st st-ok">✓ Avisado al celular · ${hm(w.notified)}</span>` : `<button class="btn sm" style="border-color:var(--green);color:var(--green)" data-act="bNotify" data-arg="${w.id}">Avisarle al celular cuando esté lista</button>`}</div>`).join('') || '<p class="empty">No hay nadie esperando.</p>';
  return `<div class="screen">
    ${appHead('Domingo previsto · Recepción de mesas', 'Anfitriona: Laura', `Domingo 26 · ${hmp(S.clock)}`)}
    <div class="sbody">
      <div class="kpis">
        <div class="kpi"><span class="l" style="color:var(--ok)">Mesas libres</span><span class="v">${libres}</span></div>
        <div class="kpi"><span class="l" style="color:var(--warn)">Se liberan pronto</span><span class="v">${pronto}</span></div>
        <div class="kpi"><span class="l">Familias que confirmaron</span><span class="v">${B.arrivals.length}</span><span class="n">Por llegar en la próxima hora</span></div>
        <div class="kpi dark"><span class="l">En lista de espera</span><span class="v">${B.wait.length}</span><span class="n">Espera estimada ~${B.wait.length ? 8 : 0} min</span></div>
      </div>
      <div class="row" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start">
        <div class="stack" style="grid-column:span 2;min-width:0"><div class="row" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${zones}
          <section class="card" style="padding:14px"><span style="font-weight:700;color:var(--green)">Convenciones</span><div class="lg" style="margin-top:10px;flex-direction:column;align-items:flex-start"><span><i style="border:2px solid var(--ok);background:var(--paper)"></i>Libre</span><span><i style="background:var(--green)"></i>Ocupada</span><span><i style="background:var(--warn-bg);border:1px solid var(--warn-dot)"></i>Se libera pronto (cuenta o postre)</span><span><i style="background:var(--bg-2);border:1.5px dashed #6B6252"></i>Apartada para quien confirmó</span></div><p class="sub" style="margin:10px 0 0">Toca una mesa para cambiar su estado.</p></section>
        </div></div>
        <aside class="stack" style="min-width:0">
          <section class="card"><div class="card-head"><h2>Llegando ahora</h2></div><div class="stack">${arr}</div></section>
          <section class="card"><div class="card-head"><h2>Lista de espera</h2><span class="sub">${B.wait.length} grupos</span></div><div class="stack">${wait}<p class="sub" style="margin:0">Quien no avisó también es bienvenido: entra a la lista y no tiene que recorrer los comedores buscando mesa.</p></div></section>
        </aside>
      </div>
    </div></div>`;
}

function bSocio() {
  const B = S.B, f = B.form;
  let body;
  if (B.confirmed) {
    const c = B.confirmed;
    body = `<div class="card" style="text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;padding:24px 18px">
      <span style="width:56px;height:56px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center">${ic('check', 28, 'currentColor', 3)}</span>
      <h3 style="margin:0;font-family:var(--display);font-size:22px;color:var(--green)">¡Los esperamos!</h3>
      <p style="margin:0;font-size:14px">${c.fam + c.inv} personas · ${c.slot} ${hourOf(c.slot) < 12 ? 'a. m.' : 'p. m.'} · ${c.zona === 'aire' ? 'Comedor con aire' : c.zona === 'terraza' ? 'Terraza' : 'Comedor Palmas'}</p>
      <p class="sub" style="margin:0">Tus ${c.inv} invitados ya quedaron registrados en portería. La cocina ya te tiene en cuenta.</p>
    </div>
    <div class="alert a-ok">${ic('users', 20, 'var(--ok)')}<div class="grow"><span class="tt">Al llegar</span><span>Recepción te asigna mesa en la zona que elegiste; no tienes que buscarla.</span></div></div>
    <button class="btn block" data-act="bUndo">Cambiar o cancelar mi llegada</button>`;
  } else {
    const slots = SLOTS.map(([s, h]) => { const [lab, col, p] = occ(h); return `<button class="slot" data-act="bSlot" data-arg="${s}" aria-pressed="${f.slot === s}" aria-label="${s}, ${lab}"><b>${s}</b><span class="occ"><i style="width:${Math.min(100, Math.round(p * 100))}%;background:${col}"></i></span><small style="color:${col}">${lab}</small></button>`; }).join('');
    const zones = [['aire', 'Comedor con aire acondicionado', 'snow', 'Pocas mesas', 'var(--warn)'], ['terraza', 'Terraza', 'sun', 'Disponible', 'var(--ok)'], ['palmas', 'Comedor Palmas', 'fork', 'Disponible', 'var(--ok)']]
      .map(([id, n, i, s, c]) => `<button class="zone" data-act="bZona" data-arg="${id}" aria-pressed="${f.zona === id}">${ic(i, 18, 'var(--green)')}<span class="n">${n}</span><span class="st" style="color:${c}">${s}</span></button>`).join('');
    const [lab] = occ(hourOf(f.slot));
    body = `<p style="margin:0;font-size:13px">Avísanos si vienes y con cuántos invitados: la cocina se prepara para ti. <b>No es una reserva</b>; si cambias de plan, no pasa nada.</p>
    <section class="card" style="padding:12px 14px"><b style="color:var(--green)">¿Cuántos vienen?</b>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><div><div style="font-weight:600">Tu familia</div><div class="sub">Titular y beneficiarios</div></div><div class="stepper"><button data-act="bQty" data-arg="fam:-1" aria-label="Quitar una persona" ${f.fam > 1 ? '' : 'disabled'}>−</button><output class="tnum">${f.fam}</output><button class="plus" data-act="bQty" data-arg="fam:1" aria-label="Agregar una persona">+</button></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:1px solid #F0EBE0"><div><div style="font-weight:600">Invitados</div><div class="sub">Agiliza su entrada en portería</div></div><div class="stepper"><button data-act="bQty" data-arg="inv:-1" aria-label="Quitar un invitado" ${f.inv > 0 ? '' : 'disabled'}>−</button><output class="tnum">${f.inv}</output><button class="plus" data-act="bQty" data-arg="inv:1" aria-label="Agregar un invitado">+</button></div></div>
    </section>
    <section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:10px"><b style="color:var(--green)">¿A qué hora llegan?</b><div class="slots">${slots}</div>
      <span class="sub" style="color:var(--ink)">${lab === 'Muy lleno' || lab === 'Lleno' ? 'A esa hora el Club estará muy lleno. Llegar a las 12:30 o a las 2:00 p. m. te ahorra espera.' : 'Buena elección: a esa hora hay menos espera.'}</span></section>
    <section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:8px"><b style="color:var(--green)">¿Dónde prefieren almorzar?</b>${zones}</section>
    <label class="card" style="padding:12px 14px;display:flex;align-items:center;gap:12px"><span style="flex:1"><span style="display:block;font-weight:600">¿Celebran algo?</span><span class="sub">Cuéntanos si es un cumpleaños o un grupo grande</span></span><input type="checkbox" id="b-cel" data-act="bCel" ${f.cel ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--green)"></label>
    <button class="btn primary block" style="min-height:50px;font-size:16px" data-act="bConfirm">Confirmar que vamos · ${f.fam + f.inv} personas</button>
    <span class="sub" style="text-align:center">Puedes cambiarlo hasta el domingo a las 10:00 a. m.</span>`;
  }
  return `<div class="phone">
    <div class="ph-head"><div><small style="letter-spacing:1.5px;text-transform:uppercase">Mi club · acción 1482</small><h3>Planea tu domingo</h3><small>Domingo 26 de octubre · almuerzo</small></div></div>
    <div class="ph-body" data-scroll="b-phone">${body}</div></div>`;
}

/* =========================================================
   PROPUESTA C · Mesa al día
   ========================================================= */
const cDish = id => S.C.menu.find(d => d.id === id);
const cartTotal = () => sum(S.C.cart, x => x.price * x.qty);
const cartCount = () => sum(S.C.cart, x => x.qty);
const myOrder = () => S.C.orders.find(o => o.id === S.C.my);
const itemReady = it => it.checks.every(c => c.d) && (it.temp == null || it.temp >= 63);

function viewC() {
  const C = S.C;
  return `
  ${guide('Propuesta C', 'Mesa al día: del pedido en la mesa al plato bien servido',
    'El socio pide desde la mesa viendo la disponibilidad real, sigue su pedido y recibe aviso si se retrasa. En el pase, cada plato se revisa contra el estándar antes de salir. Responde a C4 (la decepción al final de la espera) y a los errores de comanda.',
    ['En la <b>carta</b>, abre el churrasco, elige término y acompañamiento, y agrégalo con un ajiaco.', 'Envía el pedido: en unos segundos llega al <b>pase</b>.', 'Revisa la lista de chequeo. Si un plato está frío, caliéntalo antes de despachar.', 'Despacha y mira el seguimiento en el celular. Con <b>+5 min</b> puedes simular una demora.'])}
  <div class="stage">
    <div style="min-width:0"><p class="caption">C3 · Estación de pase</p>${cPase()}</div>
    <div class="phone-wrap"><p class="caption">${C.phone === 'carta' ? 'C1 · App del socio · Carta en la mesa' : 'C2 · App del socio · Seguimiento del pedido'}</p>${cPhone()}</div>
  </div>`;
}

function cPase() {
  const C = S.C, q = C.orders.filter(o => o.st === 'pase' || o.st === 'prep');
  if (!q.find(o => o.id === C.sel)) C.sel = q.find(o => o.st === 'pase')?.id ?? null;
  const sel = C.orders.find(o => o.id === C.sel);
  const queue = q.sort((a, b) => a.t - b.t).map(o => { const e = S.clock - o.t, col = e > 30 ? 'var(--bad)' : e > 20 ? 'var(--warn)' : 'var(--ok)';
    return `<button data-act="cSel" data-arg="${o.id}" aria-pressed="${o.id === C.sel}" ${o.st === 'prep' ? 'disabled style="opacity:.7"' : ''}><span style="display:flex;justify-content:space-between;width:100%;gap:8px"><b style="font-size:16px">#${o.id} · ${esc(o.mesa)}</b><b class="tnum" style="color:${col}">${e} min</b></span><span class="sub">${sum(o.items, i => i.qty)} platos · ${o.mesero} · ${o.st === 'prep' ? 'en cocina, aún no llega' : o.id === C.my ? 'nuevo · desde la carta' : 'por revisar'}</span></button>`; }).join('') || '<p class="empty">No hay pedidos por despachar.</p>';
  let detail = '<div class="card"><p class="empty">Elige un pedido de la lista para revisarlo.</p></div>';
  if (sel) {
    const e = S.clock - sel.t, allOk = sel.items.every(itemReady);
    const cards = sel.items.map((it, k) => {
      const tempOk = it.temp == null || it.temp >= 63;
      const done = it.checks.filter(c => c.d).length, total = it.checks.length;
      return `<article class="card" style="display:flex;flex-direction:column;gap:10px;${tempOk ? '' : 'border:2px solid var(--bad)'}">
        <div class="ph-photo">${ic('camera', 26, 'currentColor', 1.8)}<span>Foto estándar: ${esc(it.name)}</span></div>
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b style="font-size:16px">${it.qty}× ${esc(it.name)}</b><b class="tnum" style="font-size:13px;color:${done === total && tempOk ? 'var(--ok)' : 'var(--warn)'}">${done} de ${total}</b></div>
        ${it.checks.map((c, j) => `<label class="check"><input type="checkbox" id="chk-${sel.id}-${k}-${j}" data-act="cCheck" data-arg="${sel.id}:${k}:${j}" ${c.d ? 'checked' : ''}><span>${esc(c.l)}</span></label>`).join('')}
        ${it.temp == null ? `<div class="temp" style="background:var(--neutral-bg)">${ic('glass', 18, 'var(--muted)')}<span>Bebida fría · no requiere medir temperatura</span></div>`
          : tempOk ? `<div class="temp" style="background:var(--ok-bg);color:#17402A">${ic('therm', 18, 'var(--ok)')}<span><b>${it.temp} °C</b> · temperatura correcta</span></div>`
          : `<div class="temp" style="background:var(--bad-bg);color:var(--bad-ink)">${ic('therm', 18, 'var(--bad)')}<span><b style="color:var(--bad)">${it.temp} °C</b> · por debajo de 63 °C</span></div><button class="btn badline sm" data-act="cHeat" data-arg="${sel.id}:${k}">Calentar y volver a medir</button>`}
      </article>`;
    }).join('');
    detail = `<section class="card" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:flex-end"><div><h2 style="font-family:var(--display);font-size:22px">Pedido #${sel.id} · ${esc(sel.mesa)}</h2><span class="sub">Comanda a las ${hm(sel.t)} · mesero ${sel.mesero}${sel.id === C.my ? ' · el socio lo sigue en su celular' : ''}</span></div><span class="badge ${e > 30 ? 'bg-neu' : 'bg-ok'}" style="${e > 30 ? 'background:var(--bad-bg);color:var(--bad)' : ''}">${e} min · prometido a la ${hm(sel.t + 30)}</span></div>
      <div class="row" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${cards}</div>
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid #F0EBE0;padding-top:12px">
        <span class="sub">${allOk ? 'Todo revisado. Al despachar, el socio ve “En camino”.' : 'Completa la lista y corrige la temperatura para poder despachar.'}</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="cNotify" data-arg="${sel.id}" ${sel.notified ? 'disabled' : ''}>${sel.notified ? '✓ Demora avisada' : 'Avisar demora al socio'}</button><button class="btn primary" data-act="cDispatch" data-arg="${sel.id}" ${allOk ? '' : 'disabled'}>Despachar a ${esc(sel.mesa)}</button></div>
      </div></section>`;
  }
  return `<div class="screen">
    ${appHead('Mesa al día · Estación de pase', 'Jefe de pase', `${hmp(S.clock)} · mínimo de salida 63 °C`)}
    <div class="sbody"><div class="row" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));align-items:start">
      <section class="card queue stack" style="min-width:0"><div class="card-head" style="margin:0"><h2>Por despachar</h2><span class="sub">${q.length} pedidos</span></div>${queue}</section>
      <div style="grid-column:span 2;min-width:0">${detail}</div>
    </div>
    <div class="row" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      <section class="card" style="background:var(--green);border-color:var(--green);color:var(--on-dark)"><h2 style="color:var(--on-dark)">Calidad de salida hoy</h2>
        <div class="kpis" style="margin-top:12px;grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">
          <div><div class="tnum" style="font-size:30px;font-weight:700">${C.stats.rev}</div><div style="font-size:13px;color:var(--on-dark-2)">platos revisados</div></div>
          <div><div class="tnum" style="font-size:30px;font-weight:700;color:#E9A97E">${C.stats.corr}</div><div style="font-size:13px;color:var(--on-dark-2)">corregidos antes de salir</div></div>
          <div><div class="tnum" style="font-size:30px;font-weight:700">${C.stats.dev}</div><div style="font-size:13px;color:var(--on-dark-2)">devueltos por socios</div></div>
        </div></section>
      <section class="card"><h2>Mismo plato en todos los puntos</h2><div class="list" style="border:none;padding:0;margin-top:8px">
        <div class="li"><span>Churrasco 300 g</span><span class="st st-ok">4 de 4 puntos ✓</span></div>
        <div class="li"><span>Bandeja paisa</span><span class="st st-ok">4 de 4 puntos ✓</span></div>
        <div class="li"><span>Arroz con pollo</span><span class="st st-warn">3 de 4 · Kiosko distinto</span></div></div>
        <p class="sub" style="margin:8px 0 0">Cada punto despacha con la misma foto estándar y la misma lista de chequeo.</p></section>
    </div></div></div>`;
}

function cPhone() {
  const C = S.C;
  let body, bottom = '';
  if (C.phone === 'carta') {
    const tabs = ['Fuertes', 'Sopas', 'Bebidas'].map(c => `<button class="chip-b" data-act="cCat" data-arg="${c}" aria-pressed="${C.cat === c}">${c}</button>`).join('');
    const dishes = C.menu.filter(d => d.cat === C.cat).map(d => {
      if (d.st === 'off') return `<article class="dish off"><div class="r1"><span class="thumb">${ic('ban', 24, 'var(--muted)', 1.8)}</span><div style="flex:1;min-width:0"><div class="struck" style="font-weight:700">${esc(d.name)}</div><div class="sub" style="color:#3E4440">Se agotó hoy a las 12:31. Te sugerimos la bandeja paisa.</div></div></div></article>`;
      const badge = d.fast ? `<span class="badge bg-ok">Rápido · ~${d.min} min</span>` : d.st === 'few' ? `<span class="badge bg-warn">Quedan pocas · ~${d.min} min</span>` : `<span class="badge bg-neu">~${d.min} min</span>`;
      const inCart = sum(C.cart.filter(x => x.id === d.id), x => x.qty);
      const open = C.open === d.id;
      const opts = open ? `<div class="opt"><span class="lb">Término</span><div class="chips">${['Medio', 'Tres cuartos', 'Bien asado'].map(o => `<button class="chip-b" data-act="cOpt" data-arg="termino:${o}" aria-pressed="${C.opts.termino === o}">${o}</button>`).join('')}</div></div>
        <div class="opt"><span class="lb">Acompañamiento</span><div class="chips">${['Papa criolla', 'Papa a la francesa', 'Yuca'].map(o => `<button class="chip-b" data-act="cOpt" data-arg="acomp:${o}" aria-pressed="${C.opts.acomp === o}">${o}</button>`).join('')}</div></div>
        <label class="opt" for="c-nota"><span class="lb">Algo más para la cocina</span><input id="c-nota" data-act="cNota" value="${esc(C.opts.nota)}" placeholder="Ej.: sin chimichurri" style="padding:8px 10px;border-radius:8px;border:1px solid var(--line-2);background:var(--paper-2)"></label>
        <button class="btn primary block" data-act="cAdd" data-arg="${d.id}">Agregar al pedido · ${money(d.price)}</button>` : '';
      return `<article class="dish ${open ? 'sel' : ''}"><div class="r1"><span class="thumb">${ic(d.icon, 24, '#9A8F78', 1.8)}</span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><b>${esc(d.name)}</b><span>${badge}${inCart ? ` <span class="badge bg-ok">En tu pedido: ${inCart}</span>` : ''}</span></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><b class="tnum" style="font-size:14px">${money(d.price)}</b>${open ? '' : `<button class="btn sm primary" data-act="${d.options ? 'cOpen' : 'cAdd'}" data-arg="${d.id}" aria-label="${d.options ? 'Elegir opciones de' : 'Agregar'} ${esc(d.name)}">${d.options ? 'Elegir' : 'Agregar'}</button>`}</div></div>${opts}</article>`;
    }).join('');
    body = `<div class="alert a-ok">${ic('bolt', 20, 'var(--ok)')}<span>Hoy hay alta afluencia. Lo marcado <b>Rápido</b> llega en menos de 15 min.</span></div><div class="chips">${tabs}</div>${dishes}
      ${C.cart.length ? `<h3 class="h3s">Tu pedido</h3><div class="list">${C.cart.map((x, k) => `<div class="li"><div style="min-width:0"><div class="nm">${x.qty}× ${esc(x.name)}</div>${x.note ? `<div class="ds">${esc(x.note)}</div>` : ''}</div><button class="btn sm" data-act="cRemove" data-arg="${k}" aria-label="Quitar ${esc(x.name)}">Quitar</button></div>`).join('')}</div>` : ''}`;
    bottom = `<div class="cartbar"><div><div style="font-size:12px;color:var(--on-dark-2)">Tu pedido · ${cartCount()} producto${cartCount() === 1 ? '' : 's'}</div><b class="tnum" style="font-size:18px">${money(cartTotal())}</b></div><button data-act="cSend" ${C.cart.length ? '' : 'disabled'}>Enviar a cocina</button></div>`;
  } else {
    const o = myOrder();
    if (!o) {
      body = `<div class="card" style="text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center;padding:26px 18px"><span class="thumb">${ic('fork', 24)}</span><b>Aún no has pedido</b><span class="sub">Cuando envíes tu pedido desde la carta, aquí verás en qué va.</span><button class="btn primary" data-act="cPhone" data-arg="carta">Ver la carta</button></div>`;
    } else {
      const order = ['prep', 'pase', 'camino', 'servido'], idx = order.indexOf(o.st);
      const steps = [['Recibido en cocina', hm(o.t)], ['En preparación', ''], ['Revisión en el pase', 'Revisamos que esté completo y caliente'], ['En camino a tu mesa', ''], ['Servido', '']]
        .map(([l, sub], k) => { const pos = k === 0 ? 'done' : k - 1 < idx ? 'done' : k - 1 === idx ? 'cur' : 'todo'; const isLast = k === 4;
          return `<div class="step ${pos}"><div class="rail"><span class="dotc">${pos === 'done' ? ic('check', 13, '#fff', 3) : ''}</span>${isLast ? '' : '<span class="ln"></span>'}</div><div class="tx"><span style="${pos === 'cur' ? 'font-weight:700;color:var(--warn)' : pos === 'todo' ? 'color:var(--muted)' : 'font-weight:600'}">${l}${pos === 'cur' && sub && k === 2 ? `<span class="sub" style="display:block;font-weight:400;color:var(--ink)">${sub}</span>` : ''}</span><span class="sub tnum">${k === 0 ? sub : ''}</span></div></div>`; }).join('');
      const due = o.t + 30, rem = due - S.clock, late = o.st !== 'servido' && rem < 0;
      const eta = o.st === 'servido' ? '¡Buen provecho!' : o.st === 'camino' ? 'Va en camino' : rem > 0 ? `~${rem} min` : 'En unos minutos';
      const status = it => o.st === 'servido' ? '<span class="st st-ok">✓ Servido</span>' : o.st === 'camino' ? '<span class="st st-ok">En camino</span>' : o.st === 'pase' ? (itemReady(it) ? '<span class="st st-ok">Revisado</span>' : '<span class="st st-warn">En el pase</span>') : '<span class="st st-warn">En preparación</span>';
      const courtesy = (late || o.notified) && o.st !== 'servido' ? (C.courtesy
        ? `<div class="alert a-ok">${ic('gift', 22, 'var(--ok)')}<div class="grow"><span class="tt">Cortesía aceptada</span><span>El postre del día llega con tu pedido.</span></div></div>`
        : `<section class="alert a-warn" style="flex-direction:column;border:1px solid var(--warn-line)"><div style="display:flex;gap:10px">${ic('gift', 22, 'var(--warn)')}<span style="color:var(--warn-ink)"><b>Vamos ${late ? Math.max(1, -rem) + ' min' : 'un poco'} tarde.</b> Lo sentimos: el postre del día va por cuenta del Club.</span></div><button class="btn primary block" data-act="cCourtesy">Aceptar la cortesía</button></section>`) : '';
      const rating = o.st === 'servido' ? `<section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:6px;align-items:flex-start"><span style="font-size:14px">${C.rating ? '¡Gracias por contarnos! Tu opinión llega a A&B.' : '¿Cómo estuvo tu almuerzo?'}</span><div class="stars" role="group" aria-label="Calificación">${[1, 2, 3, 4, 5].map(n => `<button data-act="cRate" data-arg="${n}" aria-pressed="${C.rating >= n}" aria-label="${n} de 5">${ic('star', 24, 'currentColor', 1.8, C.rating >= n ? 'currentColor' : 'none')}</button>`).join('')}</div></section>` : '';
      body = `<section class="card" style="background:var(--green);border-color:var(--green);color:var(--on-dark)"><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--on-dark-2)"><span>Pedido #${o.id} · ${esc(o.mesa)}</span><span>Mesero: ${o.mesero}</span></div><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-top:8px"><div><div style="font-size:13px;color:var(--on-dark-2)">${o.st === 'servido' ? 'Tu pedido' : 'Tu plato llega'}</div><div style="font-family:var(--display);font-size:30px;font-weight:700">${eta}</div></div><div style="font-size:12px;color:var(--on-dark-2);text-align:right">Pediste a las ${hm(o.t)}<br>Prometido: ${hm(due)}</div></div></section>
        <section class="card steps" style="padding:14px 16px">${steps}</section>
        <div class="list">${o.items.map(it => `<div class="li"><div style="min-width:0"><div class="nm">${it.qty}× ${esc(it.name)}</div>${it.note ? `<div class="ds">${esc(it.note)}</div>` : ''}</div>${status(it)}</div>`).join('')}</div>
        ${courtesy}
        <div class="grid2"><button class="btn" data-act="cCall">${ic('bell', 16)} Llamar al mesero</button><button class="btn" data-act="cPhone" data-arg="carta">${ic('plus', 16)} Otra ronda</button></div>
        ${rating}`;
    }
  }
  return `<div class="phone">
    <div class="ph-head" style="${C.phone === 'carta' ? '' : ''}"><div><small style="letter-spacing:1.5px;text-transform:uppercase">Carta del día</small><h3>Terraza · Mesa 12</h3></div><span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--on-dark-2)">${ic('pin', 14)}Escaneaste el QR</span></div>
    <div class="ph-body" data-scroll="c-phone">${body}</div>
    ${bottom}
    <nav class="ph-nav" aria-label="Secciones del socio">
      <button data-act="cPhone" data-arg="carta" ${C.phone === 'carta' ? 'aria-current="page"' : ''}>${ic('fork', 22)}Carta</button>
      <button data-act="cPhone" data-arg="seg" ${C.phone === 'seg' ? 'aria-current="page"' : ''}>${ic('clock', 22)}Mi pedido</button>
    </nav></div>`;
}

/* ---------- piezas comunes ---------- */
function guide(tag, title, what, steps) {
  return `<section class="guide"><div><span class="tag">${tag}</span><h1>${title}</h1><p>${what}</p></div><div><h2>Pruébalo</h2><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol></div></section>`;
}
function appHead(t, who, chip) {
  return `<div class="ahead"><div style="display:flex;align-items:center;gap:12px"><div class="mono" style="width:34px;height:34px;font-size:12px" aria-hidden="true">CF</div><div><div class="t">Club Campestre Farallones</div><div class="s">${t}</div></div></div><div class="r"><span class="chip">${chip}</span><span>${who}</span></div></div>`;
}

/* ---------- acciones ---------- */
const H = {
  view: v => { S.view = v; try { history.replaceState(null, '', '#' + v); } catch { location.hash = v; } window.scrollTo({ top: 0 }); },
  tick: n => { S.clock += Number(n); toast(`Reloj de la demo: ${hmp(S.clock)}`); },
  reset: () => { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); timers.clear(); const v = S.view; S = initial(); S.view = v; toast('La demo volvió al inicio'); },

  aScreen: s => { S.A.screen = s; },
  aMove: arg => { const [id, st] = arg.split(':'); const o = S.A.orders.find(x => x.id === Number(id)); if (!o) return;
    o.st = st; if (st === 'listo') toast(`Pedido #${o.id} listo · avisamos a ${o.mesero}`); if (st === 'entregado') toast(`Pedido #${o.id} entregado en ${PUNTO[o.punto]}, mesa ${o.mesa}`); },
  aAsk: id => { S.A.confirming = id; },
  aCancel: () => { S.A.confirming = null; },
  aOff: id => { const A = S.A, d = dishById(id); if (!d) return; d.st = 'off'; d.since = S.clock; A.confirming = null;
    const n = { id: Date.now(), dish: id, t: S.clock, conf: 0, mine: false }; A.notices.push(n);
    toast(`${d.name} quedó agotada · aviso enviado a ${A.staff} meseros`);
    every(() => { if (!A.notices.includes(n)) return false; const others = A.staff - 1; if (n.conf - (n.mine ? 1 : 0) >= others) return false; n.conf++; render(); return true; }, 380); },
  aOn: id => { const d = dishById(id); if (!d) return; d.st = 'ok'; d.left = null; S.A.notices = S.A.notices.filter(n => n.dish !== id); toast(`${d.name} vuelve a estar disponible en todos los puntos`); },
  aAck: id => { const n = S.A.notices.find(x => x.id === Number(id)); if (n && !n.mine) { n.mine = true; n.conf = Math.min(S.A.staff, n.conf + 1); toast('Cocina ve que ya leíste el aviso'); } },
  aWTab: t => { S.A.waiterTab = t; },
  aMesa: m => { S.A.draft.mesa = Number(m); },
  aQty: arg => { const [id, d] = arg.split(':'); const it = S.A.draft.items; it[id] = Math.max(0, (it[id] || 0) + Number(d)); if (!it[id]) delete it[id]; },
  aSend: () => { const A = S.A, dr = A.draft; const items = Object.entries(dr.items).map(([id, q]) => [q, dishById(id).name, '']); if (!items.length) return;
    const o = { id: A.nextId++, punto: 'Terraza', mesa: dr.mesa, mesero: 'Andrés', t: S.clock, st: 'pend', items };
    A.orders.push(o); dr.items = {}; A.waiterTab = 'mesas'; toast(`Pedido #${o.id} enviado a cocina · mesa ${o.mesa}`); },

  bScreen: s => { S.B.screen = s; },
  bQty: arg => { const [k, d] = arg.split(':'); const f = S.B.form; f[k] = Math.max(k === 'fam' ? 1 : 0, Math.min(12, f[k] + Number(d))); },
  bSlot: s => { S.B.form.slot = s; },
  bZona: z => { S.B.form.zona = z; },
  bConfirm: () => { const B = S.B, f = B.form, x = B.hours.find(h => h.h === hourOf(f.slot)); x.s += f.fam; x.i += f.inv;
    B.confirmed = { ...f }; B.arrivals.push({ id: 'me', name: 'Familia de la acción 1482', fam: f.fam, inv: f.inv, time: f.slot, zona: f.zona });
    toast('Confirmado: la cocina y la recepción ya te tienen en cuenta'); },
  bUndo: () => { const B = S.B, c = B.confirmed; if (!c) return; const x = B.hours.find(h => h.h === hourOf(c.slot)); x.s -= c.fam; x.i -= c.inv;
    B.arrivals = B.arrivals.filter(a => a.id !== 'me'); B.confirmed = null; toast('Tu aviso quedó cancelado'); },
  bSuggest: () => { const B = S.B, x13 = B.hours.find(h => h.h === 13), x12 = B.hours.find(h => h.h === 12), x14 = B.hours.find(h => h.h === 14);
    const people = Math.min(x13.s + x13.i, Math.max(0, hTot(x13) - B.cap) + 12), s = Math.round(people * 0.65), i = people - s;
    x13.s -= s; x13.i -= i; x12.s += Math.ceil(s / 2); x12.i += Math.ceil(i / 2); x14.s += Math.floor(s / 2); x14.i += Math.floor(i / 2);
    B.suggested = { fam: 18, people }; toast(`Sugerencia enviada · ${people} personas cambian de horario`); },
  bWarehouse: () => { S.B.sentWarehouse = true; toast('Pedido de insumos enviado al almacén'); },
  bAssign: arg => { const [aid, tid] = arg.split(':'); const B = S.B, a = B.arrivals.find(x => x.id === aid), t = B.zones.flatMap(z => z.tables).find(x => x.id === tid);
    if (!a || !t) return; t.st = 'ocu'; t.who = null; B.arrivals = B.arrivals.filter(x => x.id !== aid); toast(`${a.name}: mesa ${t.id} asignada · el mesero ya fue avisado`); },
  bTable: tid => { const B = S.B, t = B.zones.flatMap(z => z.tables).find(x => x.id === tid); if (!t) return;
    if (t.st === 'ocu') { t.st = 'pronto'; toast(`Mesa ${t.id} pidió la cuenta`); }
    else if (t.st === 'pronto') { t.st = 'libre'; toast(`Mesa ${t.id} quedó libre`); }
    else if (t.st === 'libre') { const w = B.wait.find(x => x.n <= t.cap); if (w) { t.st = 'ocu'; B.wait = B.wait.filter(x => x !== w); toast(`${w.name} pasa a la mesa ${t.id}`); } else toast(`Mesa ${t.id} libre · nadie en espera cabe en ella`); }
    else toast(`Mesa ${t.id} está apartada para quien confirmó`); },
  bNotify: id => { const w = S.B.wait.find(x => x.id === id); if (w) { w.notified = S.clock; toast(`${w.name} recibirá un mensaje cuando su mesa esté lista`); } },

  cCat: c => { S.C.cat = c; S.C.open = null; },
  cOpen: id => { S.C.open = id; },
  cOpt: arg => { const [k, v] = arg.split(':'); S.C.opts[k] = v; },
  cAdd: id => { const C = S.C, d = cDish(id); if (!d || d.st === 'off') return;
    const note = d.options ? [C.opts.termino.toLowerCase(), C.opts.acomp.toLowerCase(), C.opts.nota.trim()].filter(Boolean).join(' · ') : '';
    const ex = C.cart.find(x => x.id === id && x.note === note); if (ex) ex.qty++; else C.cart.push({ id, name: d.name, price: d.price, qty: 1, note, hot: d.hot ?? null });
    C.open = null; C.opts.nota = ''; toast(`${d.name} agregado a tu pedido`); },
  cRemove: k => { S.C.cart.splice(Number(k), 1); },
  cSend: () => { const C = S.C; if (!C.cart.length) return; const id = C.nextId++;
    const o = { id, mesa: 'Terraza 12', mesero: 'Andrés', t: S.clock, st: 'prep', notified: false, items: C.cart.map(x => ({ name: x.name, qty: x.qty, note: x.note, temp: x.hot, checks: checksFor(x.name, x.note) })) };
    C.orders.push(o); C.my = id; C.cart = []; C.phone = 'seg'; C.courtesy = false; C.rating = 0; toast(`Pedido #${id} enviado a cocina`);
    later(() => { if (o.st === 'prep') { o.st = 'pase'; C.sel = o.id; toast(`El pedido #${id} llegó al pase para revisión`); render(); } }, 4500); },
  cSel: id => { S.C.sel = Number(id); },
  cHeat: arg => { const [id, k] = arg.split(':').map(Number); const o = S.C.orders.find(x => x.id === id); if (!o) return; o.items[k].temp = 70; S.C.stats.corr++; toast(`${o.items[k].name}: ahora a 70 °C`); },
  cNotify: id => { const o = S.C.orders.find(x => x.id === Number(id)); if (o) { o.notified = true; toast(`Avisamos al socio de ${o.mesa} y le ofrecimos una cortesía`); } },
  cDispatch: id => { const C = S.C, o = C.orders.find(x => x.id === Number(id)); if (!o || !o.items.every(itemReady)) return;
    o.st = 'camino'; C.stats.rev += sum(o.items, i => i.qty); toast(`Pedido #${o.id} despachado a ${o.mesa}`);
    later(() => { o.st = 'servido'; if (o.id === C.my) toast(`Pedido #${o.id} servido en la mesa`); render(); }, o.id === C.my ? 5000 : 1200); },
  cPhone: p => { S.C.phone = p; },
  cCourtesy: () => { const o = myOrder(); S.C.courtesy = true; if (o) o.items.push({ name: 'Postre del día (cortesía)', qty: 1, note: '', temp: null, checks: [{ l: 'Completo según la comanda', d: true }] }); toast('Cortesía aceptada'); },
  cCall: () => { toast('Le avisamos a Andrés que lo necesitas'); },
  cRate: n => { S.C.rating = Number(n); toast('Gracias por calificar tu almuerzo'); }
};

/* ---------- render con memoria de scroll y foco ---------- */
function render() {
  const keep = {};
  document.querySelectorAll('[data-scroll]').forEach(el => (keep[el.dataset.scroll] = el.scrollTop));
  const ae = document.activeElement, fk = ae && ae.dataset && ae.dataset.act ? ae.dataset.act + '|' + (ae.dataset.arg || '') + '|' + (ae.id || '') : null;
  $('#clock').textContent = hmp(S.clock);
  ['a', 'b', 'c'].forEach(v => $('#tab-' + v).setAttribute('aria-selected', String(S.view === v)));
  const tabs = document.querySelector('.ptabs');
  if (tabs) tabs.hidden = Boolean(S.profile);
  const profileLabel = $('#session-profile');
  if (profileLabel) profileLabel.textContent = S.profile ? `Vista de ${S.profile.label}` : 'Prototipos de Alimentos y Bebidas';
  $('#view').innerHTML = S.view === 'a' ? viewA() : S.view === 'b' ? viewB() : viewC();
  document.querySelectorAll('[data-scroll]').forEach(el => { if (keep[el.dataset.scroll] != null) el.scrollTop = keep[el.dataset.scroll]; });
  if (fk) { const [act, arg, id] = fk.split('|'); const el = id ? document.getElementById(id) : [...document.querySelectorAll(`[data-act="${act}"]`)].find(x => (x.dataset.arg || '') === arg); if (el && !el.disabled) el.focus({ preventScroll: true }); }
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT') return;
  const fn = H[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el.dataset.arg, el); render();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'cCheck') { const [id, k, j] = el.dataset.arg.split(':').map(Number); const o = S.C.orders.find(x => x.id === id); if (o) o.items[k].checks[j].d = el.checked; render(); }
  if (el.dataset.act === 'bCel') { S.B.form.cel = el.checked; }
});
document.addEventListener('input', e => { if (e.target.dataset.act === 'cNota') S.C.opts.nota = e.target.value; });

const h = (location.hash || '').replace('#', '');
if (['a', 'b', 'c'].includes(h)) S.view = h;
window.addEventListener('message', event => {
  if (event.origin !== location.origin) return;
  if (event.data?.type === 'farallones:products-loaded') {
    applyFirebaseProducts(event.data.products);
    return;
  }
  if (event.data?.type === 'farallones:session' && event.data.profile?.view) {
    S.profile = event.data.profile;
    S.view = event.data.profile.view;
    render();
  }
});
render();
})();
