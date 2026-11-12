(() => {
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hm = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return (((h + 11) % 12) + 1) + ':' + String(mm).padStart(2, '0'); };
const hmp = m => hm(m) + (Math.floor(m / 60) % 24 < 12 ? ' a. m.' : ' p. m.');
const currentTime = () => new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date());
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

/* ---------- reloj real ---------- */
// Los tiempos se guardan en "minutos locales desde 1970": hm() sigue mostrando la hora del día
// y una resta da los minutos transcurridos, aunque el pedido sea de otro día.
let S;
const nowMin = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 60000) + (S ? S.clockOffset : 0);
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const todayLabel = () => { const d = new Date(); return `${DAYS[d.getDay()]} ${d.getDate()}`; };
const sundayLabel = () => { const d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); return `domingo ${d.getDate()} de ${MONTHS[d.getMonth()]}`; };

/* ---------- configuración fija del Club ---------- */
const WAITER_ZONE = 'terraza';
const TABLE_ST = { libre: 'libre', ocu: 'ocupada', pronto: 'pidió la cuenta', apa: 'apartada' };
const ZONES = [
  { id: 'aire', name: 'Comedor con aire', icon: 'snow', cols: 4, tables: [['A1', 4], ['A2', 4], ['A3', 4], ['A4', 6], ['A5', 4], ['A6', 4], ['A7', 6], ['A8', 2], ['A9', 4], ['A10', 4], ['A11', 2], ['A12', 4], ['A13', 6], ['A14', 4], ['A15', 4], ['A16', 4]] },
  { id: 'terraza', name: 'Terraza', icon: 'sun', cols: 4, tables: [['T1', 4], ['T2', 4], ['T3', 4], ['T4', 6], ['T5', 4], ['T6', 4], ['T7', 4], ['T8', 4], ['T9', 8], ['T10', 6], ['T11', 4], ['T12', 4]] },
  { id: 'palmas', name: 'Comedor Palmas', icon: 'fork', cols: 3, tables: [['P1', 6], ['P2', 4], ['P3', 4], ['P4', 4], ['P5', 4], ['P6', 4], ['P7', 4], ['P8', 4], ['P9', 2]] }
];
// Horas que el socio puede elegir (12:00 a 2:00 p. m.).
const PLAN_HOURS = [12, 13, 14];
const zoneName = id => ZONES.find(z => z.id === id)?.name || id || 'cualquier zona';

/* ---------- estado de la interfaz (propio de cada pestaña) ---------- */
function uiInitial() {
  return {
    clock: 0, clockOffset: 0, view: 'a', profile: null,
    A: { screen: 'panel', confirming: null, waiterTab: 'mesas', draft: { mesa: null, people: 2, items: {} }, staff: 14, menu: [], orders: [], notices: [], calls: [], seatings: [] },
    B: {
      screen: 'plan', cap: 0, form: { fam: 4, inv: 0, slot: '12:30', zona: 'aire', cel: false },
      waitForm: { name: '', n: 2, zona: 'cualquier zona' },
      hours: [], all: [], tables: [], zones: [], arrivals: [], wait: [], confirmed: null, suggestion: null, warehouse: null
    },
    C: {
      phone: 'carta', cat: 'Fuertes', cart: [], open: null, opts: { termino: 'Tres cuartos', acomp: 'Papa criolla', nota: '' },
      sel: null, my: null, rating: 0, courtesy: false, stats: { rev: 0, corr: 0, dev: 0 }, menu: [], orders: []
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

/* ---------- datos iniciales que se siembran en Firebase ---------- */
// Solo se siembra el menú (todo disponible); lo demás lo crean las personas desde la app.
function seedState() {
  const menu = [
    ['bandeja', 'Bandeja paisa', 'Fuertes', 46000, 25, { hot: 66 }],
    ['frijolada', 'Frijolada', 'Fuertes', 36000, 25, { hot: 66 }],
    ['churrasco', 'Churrasco 300 g', 'Fuertes', 62000, 30, { hot: 68, options: true }],
    ['lomo', 'Lomo al trapiche', 'Fuertes', 58000, 30, { hot: 67 }],
    ['salmon', 'Salmón en salsa de maracuyá', 'Fuertes', 64000, 25, { hot: 66 }],
    ['pechuga', 'Pechuga a la plancha', 'Fuertes', 41000, 20, { hot: 67 }],
    ['arroz', 'Arroz con pollo', 'Fuertes', 32000, 20, { hot: 66 }],
    ['hamburguesa', 'Hamburguesa del club', 'Fuertes', 35000, 15, { hot: 65 }],
    ['ajiaco', 'Ajiaco santafereño', 'Sopas', 38000, 12, { hot: 58, fast: true, icon: 'bowl' }],
    ['sancocho', 'Sancocho de gallina', 'Sopas', 34000, 20, { hot: 72, icon: 'bowl' }],
    ['limonada', 'Limonada de coco', 'Bebidas', 9000, 6, { fast: true, icon: 'glass' }],
    ['lulo', 'Jugo de lulo', 'Bebidas', 8000, 5, { fast: true, icon: 'glass' }]
  ];
  const products = {};
  menu.forEach(([id, name, cat, price, min, extra], order) => {
    products[id] = { name, cat, price, min, st: 'ok', icon: 'fork', order, ...extra };
  });
  return {
    meta: { seededAt: Date.now(), staff: 14 },
    products,
    // Sin pedidos, llegadas, lista de espera ni estados de mesa predeterminados:
    // solo existe lo que se crea desde la app (todas las mesas arrancan libres).
    orders: null, pase: null, tables: null,
    notices: null, seatings: null, diners: null,
    calls: null,
    plan: null, arrivals: null, waitlist: null,
    stats: null
  };
}
// Sembrar no pisa un menú que ya exista en Firebase; reiniciar solo devuelve su disponibilidad.
function seedOps(reset) {
  const seed = seedState(), ops = [];
  const hasProducts = Object.keys(DB.products || {}).length > 0;
  Object.entries(seed).forEach(([p, v]) => { if (p !== 'products' || !hasProducts) ops.push({ p, v }); });
  if (hasProducts && reset) {
    Object.keys(DB.products).forEach(id => {
      const s = seed.products[id];
      ops.push({ p: `products/${id}/st`, v: s ? s.st : 'ok' }, { p: `products/${id}/left`, v: s?.left ?? null }, { p: `products/${id}/since`, v: s?.since ?? null });
    });
  }
  return ops;
}

/* ---------- base de datos compartida ---------- */
// DB es una copia del árbol de Realtime Database. Cada acción produce operaciones
// { p: ruta, v: valor } o { p, inc: n }; se aplican aquí al instante y la página
// principal las guarda en Firebase, que luego devuelve el árbol actualizado a todos.
let DB = {};
let MODE = 'pending'; // pending | firebase | local
const clone = v => JSON.parse(JSON.stringify(v));
function applyOp({ p, v, inc }) {
  const keys = p.split('/'), last = keys.pop();
  let o = DB;
  for (const k of keys) { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }
  if (inc != null) o[last] = (Number(o[last]) || 0) + inc;
  else if (v == null) delete o[last];
  else o[last] = clone(v);
}
function commit(ops) {
  if (!ops.length) return;
  ops.forEach(applyOp);
  hydrate();
  if (MODE === 'firebase') window.parent.postMessage({ type: 'farallones:write', ops }, location.origin);
}
const newKey = prefix => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nextNum = (list, base) => Math.max(base, ...list.map(o => Number(o.id) || 0)) + 1;
const vals = o => Object.entries(o || {}).filter(([, v]) => v && typeof v === 'object').map(([k, v]) => ({ ...v, _key: k }));
const arr = x => (Array.isArray(x) ? x.filter(v => v != null) : x && typeof x === 'object' ? Object.values(x) : []);
const uid = () => S.profile?.uid || 'local';
const allowedViews = () => (S.profile ? S.profile.views || [S.profile.view] : ['a', 'b', 'c']);
const socioKey = () => 'socio-' + uid();
const waiterName = () => S.profile?.name || 'Andrés';

function normProduct(id, p) {
  if (!p || typeof p !== 'object') return null;
  const name = p.name ?? p.nombre;
  if (!name) return null;
  const rawSt = p.st ?? p.estado, avail = p.available ?? p.disponible;
  const st = ['ok', 'few', 'off'].includes(rawSt) ? rawSt : avail === false ? 'off' : 'ok';
  const cat = String(p.cat ?? p.category ?? p.categoria ?? 'Fuertes');
  const icon = ICONS[p.icon] ? p.icon : cat === 'Bebidas' ? 'glass' : cat === 'Sopas' ? 'bowl' : 'fork';
  return {
    id, name: String(name), cat, icon, st,
    price: Number(p.price ?? p.precio) || 0,
    min: Number(p.min ?? p.tiempoPreparacion) || 20,
    left: p.left ?? null, since: p.since ?? null,
    hot: p.hot == null ? null : Number(p.hot),
    fast: Boolean(p.fast ?? p.rapido), options: Boolean(p.options ?? p.opciones),
    order: Number(p.order ?? 999)
  };
}
// Confirmaciones simuladas del resto de meseros: suben solas desde que se envía el aviso.
const noticeConf = (n, staff) => n.conf != null ? Number(n.conf)
  : Math.min(staff, Math.min(staff - 1, Math.floor((Date.now() - (n.createdAt || 0)) / 380)) + (n.acked ? 1 : 0));
// El pedido del socio pasa solo al pase y, una vez despachado, se marca servido al llegar.
const paseSt = (o, ms) => o.st === 'prep' && o.toPaseAt && ms >= o.toPaseAt ? 'pase'
  : o.st === 'camino' && o.servedAt && ms >= o.servedAt ? 'servido' : o.st;
const leftTxt = d => (d.left != null ? `Quedan ${d.left}` : 'Quedan pocas');
const sinceTxt = (d, pre = ' desde ') => (d.since != null ? pre + hm(d.since) : '');

let lastSig = '';
function liveSig() {
  const ms = Date.now(), staff = Number(DB.meta?.staff) || 14;
  return nowMin() + '|' + vals(DB.notices).map(n => noticeConf(n, staff)).join(',') + '|' + vals(DB.pase).map(o => paseSt(o, ms)).join(',');
}

function hydrate() {
  const A = S.A, B = S.B, C = S.C, ms = Date.now();
  S.clock = nowMin();
  lastSig = liveSig();
  const menu = Object.entries(DB.products || {}).map(([id, p]) => normProduct(id, p)).filter(Boolean)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'));
  A.menu = menu;
  C.menu = menu.filter(d => d.price > 0);
  A.staff = Number(DB.meta?.staff) || 14;
  A.orders = vals(DB.orders).map(o => ({ ...o, items: arr(o.items).map(arr) }));
  A.notices = vals(DB.notices).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .map(n => ({ ...n, mine: Boolean(n.acked), conf: noticeConf(n, A.staff) }));
  A.calls = vals(DB.calls).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  A.seatings = vals(DB.seatings).map(x => ({ ...x, t: Number(x.t) || 0, people: Number(x.people) || 0 }));
  B.zones = ZONES.map(z => ({ ...z, tables: z.tables.map(([id, cap]) => ({ id, cap, st: DB.tables?.[id]?.st || 'libre', who: DB.tables?.[id]?.who || null })) }));
  B.tables = B.zones.flatMap(z => z.tables.map(t => ({ ...t, zone: z })));
  B.cap = sum(B.tables, t => t.cap);
  const arrivals = vals(DB.arrivals).filter(a => hourOf(a.slot))
    .map(a => ({ ...a, id: a._key, fam: Number(a.fam) || 0, inv: Number(a.inv) || 0 }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  B.all = arrivals;
  B.hours = PLAN_HOURS.map(h => { const xs = arrivals.filter(a => hourOf(a.slot) === h); return { h, s: sum(xs, a => a.fam), i: sum(xs, a => a.inv), n: xs.length }; });
  B.suggestion = DB.plan?.suggestion || null;
  B.warehouse = DB.plan?.warehouse || null;
  B.arrivals = arrivals.filter(a => !a.seated && !a.waiting);
  B.confirmed = arrivals.find(a => a._key === socioKey()) || null;
  B.wait = vals(DB.waitlist).sort((a, b) => (a.order || 0) - (b.order || 0)).map(w => ({ ...w, id: w._key, n: Number(w.n) || 1 }));
  C.orders = vals(DB.pase).map(o => ({ ...o, st: paseSt(o, ms), items: arr(o.items).map(it => ({ ...it, qty: Number(it.qty) || 1, checks: arr(it.checks) })) }));
  const mine = C.orders.filter(o => o.owner && o.owner === uid()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
  C.my = mine?._key ?? null;
  // Indicadores del pase calculados con los pedidos: despachados, calentados y devueltos.
  C.sent = C.orders.filter(o => o.st === 'camino' || o.st === 'servido');
  C.stats = { rev: sum(C.sent, o => sum(o.items, i => i.qty)), corr: sum(C.orders, o => o.items.filter(i => i.heated).length), dev: C.orders.filter(o => o.returned).length };
  // Mesa del socio: la que eligió (QR) o la que le asignó Recepción.
  C.tableId = DB.diners?.[uid()]?.table || (B.confirmed?.seated ? B.confirmed.table : null);
  C.rating = Number(mine?.rating) || 0;
  C.courtesy = Boolean(mine?.courtesy);
  announce();
}

/* Avisos de lo que hicieron otras personas desde sus propios dispositivos. */
let seen = null;
function announce() {
  const now = {
    orders: new Set(S.A.orders.map(o => o._key)),
    notices: new Set(S.A.notices.map(n => n._key)),
    calls: new Set(S.A.calls.map(c => c._key)),
    pase: Object.fromEntries(S.C.orders.map(o => [o._key, o.st])),
    sug: S.B.confirmed?.suggest?.at ?? null
  };
  if (seen) {
    if (S.view === 'a' && part('desk')) S.A.orders.forEach(o => { if (!seen.orders.has(o._key) && o.st === 'pend') toast(`Nuevo pedido #${o.id} · ${PUNTO[o.punto] || o.punto}, mesa ${o.mesa}`); });
    if (S.view === 'a' && part('phone')) {
      S.A.notices.forEach(n => { const d = dishById(n.dish); if (!seen.notices.has(n._key) && !n.mine && d) toast(`Cocina avisa: se agotó ${d.name}`); });
      S.A.calls.forEach(c => { if (!seen.calls.has(c._key)) toast(`${c.mesa} te necesita en la mesa`); });
    }
    if (S.view === 'b' && part('phone') && now.sug && now.sug !== seen.sug && !S.B.confirmed?.suggest?.answer) toast('El Club te sugiere otro horario para el domingo');
    if (S.view === 'c') S.C.orders.forEach(o => {
      const before = seen.pase[o._key];
      if (before === 'prep' && o.st === 'pase') { toast(`El pedido #${o.id} llegó al pase para revisión`); if (!S.C.sel) S.C.sel = o._key; }
      if (before === 'camino' && o.st === 'servido' && o._key === S.C.my) toast(`Pedido #${o.id} servido en la mesa`);
      if (!before && o.st === 'pase' && part('desk')) toast(`Nuevo pedido #${o.id} en el pase · ${o.mesa}`);
    });
  }
  seen = now;
}

S = uiInitial();

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
const PUNTO = { Restaurante: 'Restaurante principal', Terraza: 'Terraza', Palmas: 'Comedor Palmas', Kiosko: 'Kiosko piscina' };

function aAlerts() {
  const A = S.A, out = [];
  aActive().filter(isLate).sort((a, b) => a.t - b.t).forEach(o => out.push({ k: 'bad', i: 'clock', t: `Pedido retrasado · #${o.id}`, d: `${PUNTO[o.punto] || o.punto}, mesa ${o.mesa} · ${elapsed(o)} min desde la comanda` }));
  A.notices.slice().reverse().forEach(n => { const d = dishById(n.dish); if (d && d.st === 'off') out.push({ k: 'neu', i: 'ban', t: `${d.name} agotada · ${hm(d.since ?? n.t)}`, d: `Retirada del menú · ${n.conf} de ${A.staff} meseros confirmaron el aviso` }); });
  A.menu.filter(d => d.st === 'few').forEach(d => out.push({ k: 'warn', i: 'warn', t: 'Pocas porciones', d: `${d.name}: ${leftTxt(d).toLowerCase()}` }));
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
  <div class="${stageCls()}">
    ${part('desk') ? `<div style="min-width:0">
      <p class="caption">Pantalla de escritorio</p>
      <div class="seg" role="group" aria-label="Pantalla">
        <button data-act="aScreen" data-arg="panel" aria-pressed="${A.screen === 'panel'}">A1 · Panel de control</button>
        <button data-act="aScreen" data-arg="cocina" aria-pressed="${A.screen === 'cocina'}">A2 · Cocina y disponibilidad</button>
      </div>
      ${A.screen === 'panel' ? aPanel() : aKitchen()}
    </div>` : ''}
    ${part('phone') ? `<div class="phone-wrap"><p class="caption">A3 · App del mesero</p>${aWaiter()}</div>` : ''}
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
  // Prevista: lo que confirmaron los socios. Real: comensales sentados hoy (seatings en Firebase).
  const nowH = Math.floor(S.clock / 60) % 24, today = Math.floor(S.clock / 1440), cap = S.B.cap;
  const prev = {}, real = {};
  S.B.hours.forEach(x => { prev[x.h] = hTot(x); });
  S.A.seatings.filter(x => Math.floor(x.t / 1440) === today).forEach(x => { const h = Math.floor(x.t / 60) % 24; real[h] = (real[h] || 0) + x.people; });
  const hours = [...new Set([...PLAN_HOURS, ...Object.keys(real).map(Number)])].sort((a, b) => a - b);
  const maxV = Math.max(cap, ...Object.values(prev), ...Object.values(real)), px = v => Math.round(v / maxV * 170);
  const bars = hours.map(h => {
    const p = prev[h] || 0, r = h <= nowH ? (real[h] || 0) : null;
    return `<div class="grp"><div class="bcol"><span>${p}</span><div class="b-prev" style="height:${px(p)}px"></div></div><div class="bcol"><span style="color:${r && r > cap ? 'var(--bad)' : 'var(--green)'};font-weight:700">${r ?? '—'}</span><div class="b-real" style="height:${r ? px(r) : 0}px"></div></div></div>`;
  }).join('');
  const pNow = prev[nowH] || 0, rNow = real[nowH] || 0;
  const demand = rNow > pNow && pNow ? ['warn', `+${Math.round((rNow / pNow - 1) * 100)} % sobre lo previsto a la ${hmp(nowH * 60)}`, `Llegaron ${rNow - pNow} comensales más de los que confirmaron.`]
    : rNow && !pNow ? ['warn', `${rNow} comensales sin aviso a la ${hmp(nowH * 60)}`, 'Ningún socio había confirmado para esta hora.']
    : pNow ? ['ok', `A la ${hmp(nowH * 60)}: ${rNow} de ${pNow} comensales previstos`, 'La llegada va en línea con lo confirmado.']
    : ['neu', 'Sin datos para esta hora', 'Los comensales se cuentan al sentarlos en una mesa (Recepción o mesero).'];
  const att = act.filter(o => o.st !== 'listo').sort((a, b) => a.t - b.t).slice(0, 4);
  const rows = S.B.zones.map(z => {
    const os = act.filter(o => o.zona === z.id || o.punto === z.name), w = os.filter(o => o.st !== 'listo');
    const occP = Math.round(z.tables.filter(t => t.st === 'ocu' || t.st === 'pronto').length / z.tables.length * 100);
    const av = w.length ? Math.round(sum(w, elapsed) / w.length) : 0, lt = os.filter(isLate).length;
    const col = av > A_GOAL ? 'var(--bad)' : av > 25 ? 'var(--warn)' : 'var(--ok)';
    return `<tr><td><b>${z.name}</b></td><td>${os.length}</td><td style="color:${col};font-weight:700">${w.length ? av + ' min' : '—'}</td><td style="color:${lt ? 'var(--bad)' : 'inherit'};font-weight:${lt ? 700 : 400}">${lt}</td><td><div style="display:flex;align-items:center;gap:8px"><div class="bar"><i style="width:${occP}%"></i></div><span>${occP} %</span></div></td></tr>`;
  }).join('');
  return `<div class="screen">
    ${appHead('Sincronía A&B · Panel de control', 'Director de A&B', `${todayLabel()} · ${hmp(S.clock)}`)}
    <div class="sbody">
      <div class="kpis">
        <div class="kpi dark"><span class="l">Pedidos activos</span><span class="v">${act.length}</span><span class="n">En todo el Club</span></div>
        <div class="kpi"><span class="l"><span class="dot" style="border:2px solid var(--muted)"></span>Pendientes</span><span class="v">${pend}</span><span class="n">Esperan que cocina los tome</span></div>
        <div class="kpi"><span class="l" style="color:var(--warn)"><span class="dot" style="background:var(--warn-dot)"></span>En preparación</span><span class="v">${prep}</span><span class="n">En las estaciones</span></div>
        <div class="kpi"><span class="l" style="color:var(--ok)">${ic('check', 13, 'currentColor', 3)}Listos</span><span class="v">${ready}</span><span class="n">Esperando al mesero</span></div>
        <div class="kpi bad"><span class="l">${ic('warn', 13, 'currentColor', 2.5)}Retrasados</span><span class="v">${late.length}</span><span class="n">Más de ${A_GOAL} min</span></div>
        <div class="kpi"><span class="l">${ic('clock', 13)}Espera promedio</span><span class="v">${avg}<small style="font-size:16px"> min</small></span><span class="n" style="color:${avg > A_GOAL ? 'var(--bad)' : 'var(--ok)'};font-weight:700">Meta: ${A_GOAL} min o menos</span></div>
      </div>
      <div class="row c2">
        <section class="card">
          <div class="card-head"><div><h2>Demanda prevista frente a la real</h2><span class="sub">Confirmados por los socios frente a sentados hoy</span></div>
            <div class="legend"><span><i class="sw" style="background:#DCE6DF;border:1.5px solid var(--sage)"></i>Prevista</span><span><i class="sw" style="background:var(--green)"></i>Real</span><span><i style="width:16px;border-top:2px dashed var(--bad)"></i>Capacidad</span></div></div>
          <div class="chart" role="img" aria-label="Barras de comensales previstos y reales por hora; capacidad de ${cap} puestos">
            <div class="cap" style="bottom:${px(cap)}px"></div><span class="capl" style="bottom:${px(cap) + 3}px">${cap}</span>${bars}
          </div>
          <div class="xlab">${hours.map(h => `<span style="${h === nowH ? 'color:var(--green);font-weight:700' : ''}">${hm(h * 60)}${h === nowH ? ' · ahora' : ''}</span>`).join('')}</div>
          <div class="alert a-${demand[0]}" style="margin-top:12px">${ic('chart', 20, demand[0] === 'warn' ? 'var(--warn)' : demand[0] === 'ok' ? 'var(--ok)' : 'var(--ink)')}<div class="grow"><span class="tt">${demand[1]}</span><span>${demand[2]}</span></div></div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Alertas</h2><span class="badge bg-neu">${aAlerts().length} activas</span></div>
          <div class="stack" data-scroll="a-alerts" style="max-height:330px;overflow-y:auto">${aAlerts().map(alertHTML).join('') || '<p class="empty">No hay alertas activas.</p>'}</div>
        </section>
      </div>
      <div class="row c2">
        <section class="card"><div class="card-head"><h2>Estado por comedor</h2></div>
          <div class="tablewrap"><table><thead><tr><th>Comedor</th><th>Activos</th><th>Espera prom.</th><th>Retrasados</th><th>Ocupación</th></tr></thead><tbody>${rows}</tbody></table></div>
        </section>
        <section class="card"><div class="card-head"><h2>Pedidos que necesitan atención</h2><button class="btn sm" data-act="aScreen" data-arg="cocina">Ir a cocina</button></div>
          <div class="stack">${att.map(o => { const e = elapsed(o), pct = Math.min(100, Math.round(e / A_GOAL * 100)), c = e > A_GOAL ? 'var(--bad)' : e > 25 ? 'var(--warn-dot)' : 'var(--green)';
            return `<div><div style="display:flex;justify-content:space-between;font-size:14px;gap:8px"><span><b>#${o.id}</b> · ${PUNTO[o.punto] || o.punto}, mesa ${o.mesa} · ${o.mesero}</span><b class="tnum" style="color:${e > A_GOAL ? 'var(--bad)' : 'inherit'}">${e} min</b></div><div class="bar" style="margin-top:6px"><i style="width:${pct}%;background:${c}"></i></div></div>`; }).join('') || '<p class="empty">No hay pedidos en espera.</p>'}
            <p class="sub" style="margin:0">La barra se llena al llegar a la meta de ${A_GOAL} minutos.</p></div>
        </section>
      </div>
    </div></div>`;
}

function orderCard(o) {
  const late = isLate(o), e = elapsed(o);
  const items = o.items.map(([q, n, note]) => `<li>${q}× ${esc(n)}${note ? ` · <b>${esc(note)}</b>` : ''}</li>`).join('');
  let action = '';
  if (o.st === 'pend') action = `<button class="btn ${late ? 'bad' : 'primary'} block" data-act="aMove" data-arg="${o._key}:prep">Empezar</button>`;
  else if (o.st === 'prep') action = `<button class="btn ${late ? 'bad' : 'ok'} block" data-act="aMove" data-arg="${o._key}:listo">Marcar listo</button>`;
  else if (o.st === 'listo') action = `<span class="sub" style="color:var(--ok);display:flex;gap:6px;align-items:center">${ic('bell', 14)}${o.mesero} fue avisado</span><button class="btn block" data-act="aMove" data-arg="${o._key}:entregado">Entregado</button>`;
  return `<article class="ocard ${late ? 'late' : o.st === 'listo' ? 'ready' : ''}">
    <div class="top2"><span class="id">#${o.id}</span><span class="meta" style="${late ? 'color:var(--bad);font-weight:700' : ''}">${hm(o.t)} · ${o.st === 'listo' ? 'listo' : e + ' min'}</span></div>
    <b style="font-size:14px">${PUNTO[o.punto] || esc(o.punto)} · Mesa ${o.mesa}</b>
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
    if (A.confirming === d.id) return `<div class="confirm"><div><b>${esc(d.name)}</b><div class="st st-warn">${d.st === 'few' ? '▲ ' + leftTxt(d) + ' porciones' : '● Disponible'}</div></div><span style="font-size:14px;color:var(--warn-ink)">¿Marcarlo como agotado? Se retira del menú en todos los puntos y se avisa a ${A.staff} meseros.</span><div style="display:flex;gap:8px"><button class="btn sm" data-act="aCancel">Cancelar</button><button class="btn sm primary" style="flex:1" data-act="aOff" data-arg="${d.id}">Sí, marcar agotado y avisar</button></div></div>`;
    const st = d.st === 'off' ? `<span class="st st-off">⊘ Agotado${sinceTxt(d)}</span>` : d.st === 'few' ? `<span class="st st-warn">▲ ${leftTxt(d)} porciones</span>` : '<span class="st st-ok">● Disponible</span>';
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
  const A = S.A, me = waiterName(), mine = aActive().filter(o => o.mesero === me);
  const calls = A.calls.filter(c => c.mesero === me || !c.mesero);
  const unread = A.notices.filter(n => !n.mine && dishById(n.dish)?.st === 'off');
  const lateMine = mine.filter(isLate);
  const tab = A.waiterTab;
  let body;
  if (tab === 'mesas') {
    const alerts = unread.map(n => `<div class="alert a-dark">${ic('ban', 22, '#fff')}<div class="grow"><span class="tt">Se agotó: ${esc(dishById(n.dish).name)}</span><span style="font-size:12px;color:#D9DCD9">Cocina · ${hm(n.t)} · ya no lo ofrezcas</span></div><button class="btn sm" style="background:#fff;border-color:#fff;color:var(--ink)" data-act="aAck" data-arg="${n._key}">Entendido</button></div>`).join('')
      + calls.map(c => `<div class="alert a-warn" style="border:1px solid var(--warn-line)">${ic('bell', 22, 'var(--warn)')}<div class="grow"><span class="tt">${esc(c.mesa)} te necesita</span><span style="font-size:12px">El socio te llamó desde la app · ${hm(c.t)}</span></div><button class="btn sm primary" data-act="aCallDone" data-arg="${c._key}">Voy</button></div>`).join('')
      + lateMine.map(o => `<div class="alert a-bad" style="border:1px solid var(--bad-line)">${ic('clock', 22, 'var(--bad)')}<div class="grow"><span class="tt">Mesa ${o.mesa} · el pedido va en ${elapsed(o)} min</span><span style="font-size:12px;color:var(--bad-ink)">Cocina ya lo ve como retrasado. Avísale a la mesa.</span></div></div>`).join('');
    const cards = mine.sort((a, b) => String(a.mesa).localeCompare(String(b.mesa), 'es', { numeric: true })).map(o => {
      const late = isLate(o), e = elapsed(o);
      const st = o.st === 'listo' ? `<span class="st st-ok">✓ Recoger en el pase</span>` : late ? `<span class="st" style="color:var(--bad)">▲ Retrasado · #${o.id}</span>` : o.st === 'prep' ? `<span class="st st-warn">● En preparación</span>` : `<span class="st" style="color:var(--muted)">○ Pendiente en cocina</span>`;
      return `<div class="tcard ${late ? 'late' : o.st === 'listo' ? 'ready' : ''}"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:16px">Mesa ${o.mesa}</b><b class="tnum" style="font-size:13px;color:${late ? 'var(--bad)' : o.st === 'listo' ? 'var(--ok)' : 'var(--muted)'}">${o.st === 'listo' ? 'Listo' : e + ' min'}</b></div>${st}${o.st === 'listo' ? `<button class="btn sm ok" style="margin-top:4px" data-act="aMove" data-arg="${o._key}:entregado">Entregado</button>` : ''}</div>`;
    }).join('');
    body = `${alerts}<h3 class="h3s">Mis pedidos <span>Meta: ${A_GOAL} min</span></h3><div class="grid2">${cards || '<p class="empty" style="grid-column:span 2">No tienes pedidos activos. Toma uno en <b>Tomar pedido</b>.</p>'}</div>`;
  } else if (tab === 'menu') {
    body = cats(A.menu).map(c => `<h3 class="h3s">${esc(c)} <span>Actualizado al instante</span></h3><div class="list">${A.menu.filter(d => d.cat === c).map(d => `<div class="li"><div style="min-width:0"><div class="nm ${d.st === 'off' ? 'struck' : ''}">${esc(d.name)}</div><div class="ds">${d.st === 'off' ? 'Agotado' + sinceTxt(d, ' desde las ') : 'Sale en ~' + d.min + ' min'}</div></div>${d.st === 'off' ? '<span class="tag-off">Agotado</span>' : d.st === 'few' ? `<span class="st st-warn">${leftTxt(d)}</span>` : '<span class="st st-ok">Disponible</span>'}</div>`).join('')}</div>`).join('');
  } else {
    // Salón: todas las mesas con su estado real; el mesero elige una y le toma el pedido.
    const dr = A.draft, t = dr.mesa ? tableById(dr.mesa) : null;
    body = t ? waiterOrder(t) : waiterMap();
  }
  const badge = unread.length + lateMine.length + calls.length;
  const salon = tab === 'salon' || tab === 'nuevo';
  return `<div class="phone">
    <div class="ph-head"><div><h3>Hola, ${esc(me)}</h3><small>${hmp(S.clock)} · ${mine.length} pedido${mine.length === 1 ? '' : 's'} activo${mine.length === 1 ? '' : 's'}</small></div>
      <button class="bell" data-act="aWTab" data-arg="mesas" aria-label="Alertas: ${badge} nuevas">${ic('bell', 20)}${badge ? `<b>${badge}</b>` : ''}</button></div>
    <div class="ph-body" data-scroll="a-phone">${body}</div>
    <nav class="ph-nav" aria-label="Secciones del mesero">
      <button data-act="aWTab" data-arg="mesas" ${tab === 'mesas' ? 'aria-current="page"' : ''}>${ic('grid', 22)}Mis pedidos</button>
      <button data-act="aWTab" data-arg="salon" ${salon ? 'aria-current="page"' : ''}>${ic('plus', 22)}Tomar pedido</button>
      <button data-act="aWTab" data-arg="menu" ${tab === 'menu' ? 'aria-current="page"' : ''}>${ic('fork', 22)}Menú</button>
    </nav></div>`;
}

const ORDER_ST = { pend: 'pendiente', prep: 'en preparación', listo: 'listo' };
const tableOrders = id => aActive().filter(o => o.mesa === id);
function waiterMap() {
  const zones = [...S.B.zones].sort((a, b) => (b.id === WAITER_ZONE) - (a.id === WAITER_ZONE));
  const all = zones.flatMap(z => z.tables), count = st => all.filter(t => t.st === st).length;
  const stat = (l, v, c) => `<div class="tcard" style="padding:8px 10px"><span class="sub">${l}</span><b class="tnum" style="font-size:20px;color:${c}">${v}</b></div>`;
  return `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${stat('Libres', count('libre'), 'var(--ok)')}${stat('Ocupadas', count('ocu'), 'var(--green)')}${stat('Pidieron cuenta', count('pronto'), 'var(--warn)')}</div>
    <p class="sub" style="margin:0">Elige la mesa a la que le vas a tomar el pedido.</p>
    ${zones.map(z => {
      const tb = z.tables.map(t => {
        const n = tableOrders(t.id).length;
        const lab = t.st === 'libre' ? `Libre · ${t.cap}` : t.st === 'pronto' ? 'Cuenta' : t.st === 'apa' ? (t.who ? esc(t.who) : 'Apartada') : n ? `${n} pedido${n === 1 ? '' : 's'}` : `${t.cap} p.`;
        return `<button class="tbl t-${t.st}" data-act="aPick" data-arg="${t.id}" aria-label="Mesa ${t.id}, ${TABLE_ST[t.st]}, ${t.cap} personas"><b>${t.id}</b><span>${lab}</span></button>`;
      }).join('');
      return `<h3 class="h3s"><span style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:var(--green)">${ic(z.icon, 16)}${z.name}${z.id === WAITER_ZONE ? ' · tu zona' : ''}</span><span>${z.tables.filter(t => t.st === 'libre').length} libres</span></h3>
        <div class="tmap" style="grid-template-columns:repeat(4,minmax(0,1fr))">${tb}</div>`;
    }).join('')}
    <div class="lg" style="font-size:12px"><span><i style="border:2px solid var(--ok);background:var(--paper)"></i>Libre</span><span><i style="background:var(--green)"></i>Ocupada</span><span><i style="background:var(--warn-bg);border:1px solid var(--warn-dot)"></i>Pidió la cuenta</span><span><i style="background:var(--bg-2);border:1.5px dashed #6B6252"></i>Apartada</span></div>`;
}
function waiterOrder(t) {
  const A = S.A, dr = A.draft, n = sum(Object.values(dr.items), x => x), orders = tableOrders(t.id);
  const badge = t.st === 'libre' ? 'bg-ok' : t.st === 'pronto' ? 'bg-warn' : 'bg-neu';
  const action = t.st === 'ocu' ? `<button class="btn sm" data-act="aTable" data-arg="${t.id}">Pidió la cuenta</button>`
    : t.st === 'pronto' ? `<button class="btn sm" data-act="aTable" data-arg="${t.id}">Quedó libre</button>` : '';
  const head = `<section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><b style="font-size:18px">Mesa ${t.id}</b><div class="sub">${t.zone.name} · ${t.cap} puestos</div></div><span class="badge ${badge}">${TABLE_ST[t.st][0].toUpperCase() + TABLE_ST[t.st].slice(1)}</span></div>
      ${t.st === 'libre' ? `<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600">Comensales</span><div class="stepper"><button data-act="aPeople" data-arg="-1" aria-label="Quitar un comensal" ${dr.people > 1 ? '' : 'disabled'}>−</button><output class="tnum">${dr.people}</output><button class="plus" data-act="aPeople" data-arg="1" aria-label="Agregar un comensal" ${dr.people < t.cap ? '' : 'disabled'}>+</button></div></div><span class="sub">Al enviar el pedido, la mesa queda ocupada para todos.</span>` : ''}
      ${orders.length ? `<span class="sub">Pedidos activos: ${orders.map(o => `#${o.id} (${ORDER_ST[o.st] || o.st})`).join(', ')}</span>` : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="aPick" data-arg="">← Cambiar mesa</button>${action}</div>
    </section>`;
  if (t.st === 'apa') return head + `<p class="empty">Esta mesa está apartada${t.who ? ' para ' + esc(t.who) : ''}. Recepción la asigna.</p>`;
  return `${head}
    <h3 class="h3s">Platos <span>Solo puedes pedir lo disponible</span></h3>
    <div class="list" data-scroll="a-new">${A.menu.map(d => { const q = dr.items[d.id] || 0; return `<div class="li"><div style="min-width:0"><div class="nm ${d.st === 'off' ? 'struck' : ''}">${esc(d.name)}</div><div class="ds">${d.st === 'off' ? 'Agotado' : d.st === 'few' ? leftTxt(d) + ' · ~' + d.min + ' min' : '~' + d.min + ' min'}</div></div>${d.st === 'off' ? '<span class="tag-off">Agotado</span>' : `<div class="stepper"><button data-act="aQty" data-arg="${d.id}:-1" aria-label="Quitar ${esc(d.name)}" ${q ? '' : 'disabled'}>−</button><output class="tnum">${q}</output><button class="plus" data-act="aQty" data-arg="${d.id}:1" aria-label="Agregar ${esc(d.name)}">+</button></div>`}</div>`; }).join('')}</div>
    <button class="btn primary block" data-act="aSend" ${n ? '' : 'disabled'}>Enviar a cocina · Mesa ${t.id} · ${n} plato${n === 1 ? '' : 's'}</button>`;
}

/* =========================================================
   PROPUESTA B · Domingo previsto
   ========================================================= */
const SLOTS = [['12:00', 12], ['12:30', 12], ['1:00', 13], ['1:30', 13], ['2:00', 14]];
const hourOf = slot => SLOTS.find(s => s[0] === slot)?.[1];
const hTot = x => x.s + x.i;
const bTotals = () => { const H = S.B.hours; return { s: sum(H, x => x.s), i: sum(H, x => x.i), t: sum(H, hTot) }; };
function occ(h) {
  const x = S.B.hours.find(y => y.h === h), p = x && S.B.cap ? hTot(x) / S.B.cap : 0;
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
    ['En la <b>app del socio</b>, elige personas, hora y zona, y confirma.', 'Mira cómo cambian el pronóstico y las porciones sugeridas en <b>Planeación</b>.', 'Si una franja se llena, envía la sugerencia de horario a esas familias.', 'En <b>Recepción</b>, asigna mesa a quien llega o libera una mesa tocándola.'])}
  <div class="${stageCls()}">
    ${part('desk') ? `<div style="min-width:0">
      <p class="caption">Pantallas del Club</p>
      <div class="seg" role="group" aria-label="Pantalla">
        <button data-act="bScreen" data-arg="plan" aria-pressed="${B.screen === 'plan'}">B2 · Planeación de cocina</button>
        <button data-act="bScreen" data-arg="recep" aria-pressed="${B.screen === 'recep'}">B3 · Recepción de mesas (tableta)</button>
      </div>
      ${B.screen === 'plan' ? bPlan() : bRecep()}
    </div>` : ''}
    ${part('phone') ? `<div class="phone-wrap"><p class="caption">B1 · App del socio</p>${bSocio()}</div>` : ''}
  </div>`;
}

/* Producción sugerida: reparte los comensales confirmados según lo que realmente se ha pedido
   en el Club (pedidos de cocina y de la carta guardados en Firebase). */
function dishForecast(diners) {
  const counts = {};
  S.A.orders.forEach(o => o.items.forEach(([q, name]) => { counts[name] = (counts[name] || 0) + (Number(q) || 0); }));
  S.C.orders.forEach(o => o.items.forEach(it => { counts[it.name] = (counts[it.name] || 0) + (Number(it.qty) || 0); }));
  const rows = S.A.menu.map(d => ({ d, q: counts[d.name] || 0 })).filter(r => r.q > 0);
  const total = sum(rows, r => r.q);
  return rows.map(r => ({ ...r, share: r.q / total, sug: Math.ceil(diners * r.q / total) })).sort((a, b) => b.q - a.q);
}

function bPlan() {
  const B = S.B, tt = bTotals(), rows = dishForecast(tt.t);
  const maxV = Math.max(B.cap, ...B.hours.map(hTot)), px = v => Math.round(v / maxV * 200), capPx = px(B.cap);
  const bars = B.hours.map(x => { const over = hTot(x) > B.cap; return `<div class="bcol"><span style="font-weight:700;color:${over ? 'var(--bad)' : 'var(--ink)'}">${hTot(x)}</span><div class="stacked"><div style="height:${px(x.i)}px;background:var(--sage);border-radius:4px 4px 0 0"></div><div style="height:${px(x.s)}px;background:var(--green)"></div></div></div>`; }).join('');
  const worst = B.hours.reduce((a, b) => (hTot(b) > hTot(a) ? b : a));
  const over = hTot(worst) > B.cap, overPct = Math.round((hTot(worst) / B.cap - 1) * 100);
  const cands = B.all.filter(a => hourOf(a.slot) === worst.h && !a.seated && !a.suggest);
  let alertBox;
  if (!tt.t) alertBox = `<div class="alert a-neu">${ic('users', 20)}<div class="grow"><span class="tt">Aún no hay confirmaciones</span><span>Cuando los socios avisen en la app que vienen, aquí aparece el pronóstico por franja.</span></div></div>`;
  else if (over) alertBox = `<div class="alert a-bad" style="flex-wrap:wrap">${ic('warn', 20, 'var(--bad)')}<div class="grow" style="flex:1 1 260px"><span class="tt">La franja de ${hmp(worst.h * 60)} supera en ${overPct} % la capacidad de ${B.cap} puestos.</span><span style="color:var(--bad-ink)">${worst.n} familia${worst.n === 1 ? '' : 's'} confirmaron a esa hora.</span></div>${cands.length ? `<button class="btn sm bad" data-act="bSuggest" data-arg="${worst.h}">Sugerir otro horario a ${cands.length} familia${cands.length === 1 ? '' : 's'}</button>` : '<span class="sub">Todas ya recibieron la sugerencia.</span>'}</div>`;
  else alertBox = `<div class="alert a-ok">${ic('check', 20, 'var(--ok)')}<div class="grow"><span class="tt">Ninguna franja supera la capacidad</span><span>Hay ${B.cap} puestos en los tres comedores.</span></div></div>`;
  const sg = B.suggestion;
  if (sg) {
    const fams = B.all.filter(a => a.suggest?.at === sg.at);
    const moved = fams.filter(a => a.suggest.answer === 'move').length, kept = fams.filter(a => a.suggest.answer === 'keep').length;
    alertBox += `<div class="alert a-ok" style="margin-top:8px">${ic('send', 20, 'var(--ok)')}<div class="grow"><span class="tt">Sugerencia enviada a ${sg.sent} familia${sg.sent === 1 ? '' : 's'} de la franja de ${hmp(sg.hour * 60)}</span><span>${moved} cambiaron de horario · ${kept} lo mantuvieron · ${Math.max(0, fams.length - moved - kept)} sin responder</span></div></div>`;
  }
  const groups = B.all.filter(a => a.cel || a.fam + a.inv >= 8);
  const known = groups.map(a => `<div class="alert" style="border:1px solid var(--line)">${ic(a.cel ? 'gift' : 'users', 22, 'var(--green)')}<div class="grow"><span class="tt">${a.cel ? 'Celebración' : 'Grupo grande'} · ${a.fam + a.inv} personas</span><span>${esc(a.name)} · ${zoneName(a.zona)} · ${esc(a.slot)} p. m.</span></div></div>`).join('')
    || '<p class="empty">Ningún socio ha anunciado celebraciones ni grupos grandes.</p>';
  const reinf = over ? `<div class="alert a-warn">${ic('users', 22, 'var(--warn)')}<div class="grow"><span class="tt">Refuerzo sugerido</span><span>${hTot(worst)} comensales a las ${hmp(worst.h * 60)} para ${B.cap} puestos: conviene reforzar la línea caliente en esa franja.</span></div></div>` : '';
  const avail = d => d.st === 'off' ? `<span style="color:var(--bad);font-weight:700">⊘ Agotado hoy · revisar insumos</span>` : d.st === 'few' ? `<span style="color:var(--warn);font-weight:700">▲ ${leftTxt(d)}</span>` : '<span style="color:var(--ok);font-weight:700">✓ Disponible</span>';
  const table = !rows.length ? '<p class="empty">Aún no hay pedidos registrados en el Club para calcular la producción.</p>'
    : !tt.t ? '<p class="empty">Aún no hay comensales confirmados para el domingo.</p>'
    : `<div class="tablewrap"><table style="min-width:640px"><thead><tr><th>Plato</th><th>Pedidos en el Club</th><th>Participación</th><th>Porciones sugeridas</th><th>Disponibilidad hoy</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.d.name)}</b></td><td>${r.q}</td><td>${Math.round(r.share * 100)} %</td><td style="font-size:17px;font-weight:700">${r.sug}</td><td>${avail(r.d)}</td></tr>`).join('')}</tbody></table></div>`;
  const canSend = rows.length && tt.t;
  return `<div class="screen">
    ${appHead('Domingo previsto · Planeación de cocina', 'Chef ejecutivo', `${todayLabel()} · ${hmp(S.clock)}`)}
    <div class="sbody">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px">
        <div><h2 style="margin:0;font-family:var(--display);font-size:24px;color:var(--green)">Así viene el ${sundayLabel()}</h2><span class="sub">Según lo que los socios confirmaron en la app y lo que se ha pedido en el Club</span></div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px"><button class="btn primary" data-act="bWarehouse" ${canSend ? '' : 'disabled'}>${B.warehouse ? 'Reenviar pedido al almacén' : 'Enviar pedido al almacén'}</button>${B.warehouse ? `<span class="sub">✓ Último envío a las ${hm(B.warehouse.t)}</span>` : ''}</div>
      </div>
      <div class="kpis">
        <div class="kpi dark"><span class="l">Comensales previstos</span><span class="v">${tt.t.toLocaleString('es-CO')}</span><span class="n">Confirmados en la app</span></div>
        <div class="kpi"><span class="l"><i class="sw" style="background:var(--green)"></i>Socios y familia</span><span class="v">${tt.s}</span><span class="n">Titulares y beneficiarios</span></div>
        <div class="kpi"><span class="l"><i class="sw" style="background:var(--sage)"></i>Invitados anunciados</span><span class="v">${tt.i}</span><span class="n">Registrados para portería</span></div>
        <div class="kpi"><span class="l">${ic('users', 13)}Familias</span><span class="v">${B.all.length}</span><span class="n">Avisaron que vienen</span></div>
      </div>
      <div class="row c2">
        <section class="card"><div class="card-head"><div><h2>Comensales previstos por franja</h2><span class="sub">Almuerzo del domingo</span></div><div class="legend"><span><i class="sw" style="background:var(--green)"></i>Socios</span><span><i class="sw" style="background:var(--sage)"></i>Invitados</span><span><i style="width:16px;border-top:2px dashed var(--bad)"></i>Capacidad: ${B.cap} puestos</span></div></div>
          <div class="chart" style="height:250px" role="img" aria-label="Barras de socios e invitados confirmados por hora del domingo">
            <div class="cap" style="bottom:${capPx}px"></div><span class="capl" style="bottom:${capPx + 3}px">${B.cap}</span>${bars}</div>
          <div class="xlab">${B.hours.map(x => `<span>${hm(x.h * 60)}</span>`).join('')}</div>
          <div style="margin-top:12px">${alertBox}</div>
        </section>
        <section class="card"><div class="card-head"><h2>Celebraciones y grupos</h2><span class="sub">Anunciados por los socios</span></div><div class="stack">${known}${reinf}</div></section>
      </div>
      <section class="card"><div class="card-head"><h2>Producción sugerida para el mise en place</h2><span class="sub">Se recalcula con cada confirmación y cada pedido</span></div>${table}</section>
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
const WAIT_ZONES = [['cualquier zona', 'Cualquiera'], ...ZONES.map(z => [z.name, z.name])];
function bRecep() {
  const B = S.B, all = B.zones.flatMap(z => z.tables), wf = B.waitForm;
  const libres = all.filter(t => t.st === 'libre').length, pronto = all.filter(t => t.st === 'pronto').length;
  const zones = B.zones.map(z => {
    const l = z.tables.filter(t => t.st === 'libre').length, p = z.tables.filter(t => t.st === 'pronto').length;
    const tb = z.tables.map(t => {
      const lab = t.st === 'libre' ? `Libre · ${t.cap} p.` : t.st === 'pronto' ? 'Se libera' : t.st === 'apa' ? (t.who ? 'Para ' + esc(t.who) : 'Apartada') : `${t.cap} p.`;
      const hint = t.st === 'ocu' ? 'tocar: pidió la cuenta' : t.st === 'pronto' ? 'tocar: liberar' : t.st === 'libre' ? (B.wait.length ? 'tocar: dar al siguiente en espera' : 'tocar: ocupar') : 'apartada';
      return `<button class="tbl t-${t.st}" data-act="bTable" data-arg="${t.id}" aria-label="Mesa ${t.id}, ${lab}; ${hint}"><b>${t.id}</b><span>${lab}</span></button>`;
    }).join('');
    return `<section class="card" style="padding:14px"><div class="card-head" style="margin-bottom:10px"><span style="display:flex;align-items:center;gap:8px;font-weight:700;color:var(--green)">${ic(z.icon, 18)}${z.name}</span><span class="sub">${l} libres · ${p} se liberan</span></div><div class="tmap" style="grid-template-columns:repeat(${z.cols},minmax(0,1fr))">${tb}</div></section>`;
  }).join('');
  const arr = B.arrivals.map(a => { const t = bSuggestTable(a); return `<div class="stack" style="gap:6px;padding:12px;border-radius:12px;background:var(--green-soft)"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(a.name)}</b><span class="st st-ok">Confirmó · ${esc(a.slot)}</span></div><span class="sub" style="color:var(--ink)">${a.fam} de la familia${a.inv ? ' + ' + a.inv + ' invitados' : ''} · prefiere ${zoneName(a.zona)}</span>${t ? `<button class="btn primary sm" data-act="bAssign" data-arg="${a.id}:${t.id}">Asignar mesa ${t.id} (${t.cap} p.) y avisar al mesero</button>` : `<span class="st st-warn">No hay mesa libre del tamaño</span><button class="btn sm" data-act="bToWait" data-arg="${a.id}">Pasar a la lista de espera</button>`}</div>`; }).join('') || '<p class="empty">Ninguna familia confirmada está por llegar.</p>';
  const waitMin = w => Math.max(0, S.clock - (w.t ?? S.clock));
  const wait = B.wait.map(w => `<div class="stack" style="gap:6px;padding:12px;border-radius:12px;border:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(w.name)}</b><span class="st st-warn">Espera ${waitMin(w)} min</span></div><span class="sub" style="color:var(--ink)">${w.n} personas · ${w.from ? 'confirmó en la app' : 'no avisó'} · ${esc(w.zona)}</span>${w.notified ? `<span class="st st-ok">✓ Avisado al celular · ${hm(w.notified)}</span>` : `<button class="btn sm" style="border-color:var(--green);color:var(--green)" data-act="bNotify" data-arg="${w.id}">Avisarle al celular cuando esté lista</button>`}</div>`).join('') || '<p class="empty">No hay nadie esperando.</p>';
  const form = `<div class="stack" style="gap:8px;padding:12px;border-radius:12px;background:var(--paper-2);border:1px dashed var(--line-2)">
      <b style="color:var(--green)">Agregar a la lista</b>
      <input id="b-wname" type="text" data-act="bWName" value="${esc(wf.name)}" placeholder="Nombre de la familia" autocomplete="off" style="padding:8px 10px;border-radius:8px;border:1px solid var(--line-2);background:var(--paper)">
      <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600">Personas</span><div class="stepper"><button data-act="bWQty" data-arg="-1" aria-label="Quitar una persona" ${wf.n > 1 ? '' : 'disabled'}>−</button><output class="tnum">${wf.n}</output><button class="plus" data-act="bWQty" data-arg="1" aria-label="Agregar una persona">+</button></div></div>
      <div class="chips">${WAIT_ZONES.map(([v, l]) => `<button class="chip-b" data-act="bWZona" data-arg="${esc(v)}" aria-pressed="${wf.zona === v}">${esc(l)}</button>`).join('')}</div>
      <button class="btn primary sm" data-act="bAddWait">Agregar a la lista de espera</button>
    </div>`;
  return `<div class="screen">
    ${appHead('Domingo previsto · Recepción de mesas', 'Recepción', `${todayLabel()} · ${hmp(S.clock)}`)}
    <div class="sbody">
      <div class="kpis">
        <div class="kpi"><span class="l" style="color:var(--ok)">Mesas libres</span><span class="v">${libres}</span><span class="n">De ${all.length} mesas</span></div>
        <div class="kpi"><span class="l" style="color:var(--warn)">Se liberan pronto</span><span class="v">${pronto}</span><span class="n">Pidieron la cuenta</span></div>
        <div class="kpi"><span class="l">Familias por llegar</span><span class="v">${B.arrivals.length}</span><span class="n">Confirmaron en la app</span></div>
        <div class="kpi dark"><span class="l">En lista de espera</span><span class="v">${B.wait.length}</span><span class="n">${B.wait.length ? `El primero lleva ${waitMin(B.wait[0])} min` : 'Nadie esperando'}</span></div>
      </div>
      <div class="row" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start">
        <div class="stack" style="grid-column:span 2;min-width:0"><div class="row" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${zones}
          <section class="card" style="padding:14px"><span style="font-weight:700;color:var(--green)">Convenciones</span><div class="lg" style="margin-top:10px;flex-direction:column;align-items:flex-start"><span><i style="border:2px solid var(--ok);background:var(--paper)"></i>Libre</span><span><i style="background:var(--green)"></i>Ocupada</span><span><i style="background:var(--warn-bg);border:1px solid var(--warn-dot)"></i>Se libera pronto (cuenta o postre)</span><span><i style="background:var(--bg-2);border:1.5px dashed #6B6252"></i>Apartada para quien confirmó</span></div><p class="sub" style="margin:10px 0 0">Toca una mesa para cambiar su estado. Una mesa libre se le da al primero de la lista que quepa; si no hay nadie esperando, queda ocupada.</p></section>
        </div></div>
        <aside class="stack" style="min-width:0">
          <section class="card"><div class="card-head"><h2>Llegando ahora</h2></div><div class="stack">${arr}</div></section>
          <section class="card"><div class="card-head"><h2>Lista de espera</h2><span class="sub">${B.wait.length} grupo${B.wait.length === 1 ? '' : 's'}</span></div><div class="stack">${wait}${form}</div></section>
        </aside>
      </div>
    </div></div>`;
}

function bSocio() {
  const B = S.B, f = B.form;
  let body;
  if (B.confirmed) {
    const c = B.confirmed, sg = c.suggest && !c.suggest.answer ? c.suggest : null;
    const alts = sg ? SLOTS.filter(([, h]) => h !== sg.from && occ(h)[2] < 1) : [];
    const sugCard = sg ? `<section class="alert a-warn" style="flex-direction:column;border:1px solid var(--warn-line)"><div style="display:flex;gap:10px">${ic('clock', 22, 'var(--warn)')}<span style="color:var(--warn-ink)"><b>A la ${hmp(sg.from * 60)} el Club va a estar lleno.</b> Si puedes llegar a otra hora, te ahorras la espera.</span></div>
        <div class="chips">${alts.map(([s]) => `<button class="chip-b" data-act="bMove" data-arg="${s}">Llegar a las ${s}</button>`).join('')}</div>
        <button class="btn block" data-act="bKeep">Mantener mi horario</button></section>` : '';
    body = `${sugCard}<div class="card" style="text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;padding:24px 18px">
      <span style="width:56px;height:56px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center">${ic('check', 28, 'currentColor', 3)}</span>
      <h3 style="margin:0;font-family:var(--display);font-size:22px;color:var(--green)">¡Los esperamos!</h3>
      <p style="margin:0;font-size:14px">${c.fam + c.inv} personas · ${esc(c.slot)} p. m. · ${zoneName(c.zona)}</p>
      <p class="sub" style="margin:0">${c.inv ? `Tus ${c.inv} invitados ya quedaron registrados en portería. ` : ''}La cocina ya te tiene en cuenta.</p>
      ${c.seated ? `<span class="badge bg-ok">Recepción te asignó la mesa ${esc(c.table)}</span>` : c.waiting ? '<span class="badge bg-warn">Estás en la lista de espera: te avisamos al celular</span>' : ''}
    </div>
    <div class="alert a-ok">${ic('users', 20, 'var(--ok)')}<div class="grow"><span class="tt">Al llegar</span><span>Recepción te asigna mesa en la zona que elegiste; no tienes que buscarla.</span></div></div>
    ${c.seated ? '' : '<button class="btn block" data-act="bUndo">Cambiar o cancelar mi llegada</button>'}`;
  } else {
    const slots = SLOTS.map(([s, h]) => { const [lab, col, p] = occ(h); return `<button class="slot" data-act="bSlot" data-arg="${s}" aria-pressed="${f.slot === s}" aria-label="${s}, ${lab}"><b>${s}</b><span class="occ"><i style="width:${Math.min(100, Math.round(p * 100))}%;background:${col}"></i></span><small style="color:${col}">${lab}</small></button>`; }).join('');
    const zones = ZONES.map(z => { const n = sum(B.all.filter(a => a.zona === z.id), a => a.fam + a.inv);
      return `<button class="zone" data-act="bZona" data-arg="${z.id}" aria-pressed="${f.zona === z.id}">${ic(z.icon, 18, 'var(--green)')}<span class="n">${z.name}</span><span class="sub">${n ? n + ' confirmados' : 'Sin confirmados'}</span></button>`; }).join('');
    const [lab] = occ(hourOf(f.slot));
    body = `<p style="margin:0;font-size:13px">Avísanos si vienes y con cuántos invitados: la cocina se prepara para ti. <b>No es una reserva</b>; si cambias de plan, no pasa nada.</p>
    <section class="card" style="padding:12px 14px"><b style="color:var(--green)">¿Cuántos vienen?</b>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><div><div style="font-weight:600">Tu familia</div><div class="sub">Titular y beneficiarios</div></div><div class="stepper"><button data-act="bQty" data-arg="fam:-1" aria-label="Quitar una persona" ${f.fam > 1 ? '' : 'disabled'}>−</button><output class="tnum">${f.fam}</output><button class="plus" data-act="bQty" data-arg="fam:1" aria-label="Agregar una persona">+</button></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:1px solid #F0EBE0"><div><div style="font-weight:600">Invitados</div><div class="sub">Agiliza su entrada en portería</div></div><div class="stepper"><button data-act="bQty" data-arg="inv:-1" aria-label="Quitar un invitado" ${f.inv > 0 ? '' : 'disabled'}>−</button><output class="tnum">${f.inv}</output><button class="plus" data-act="bQty" data-arg="inv:1" aria-label="Agregar un invitado">+</button></div></div>
    </section>
    <section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:10px"><b style="color:var(--green)">¿A qué hora llegan?</b><div class="slots">${slots}</div>
      <span class="sub" style="color:var(--ink)">${lab === 'Muy lleno' || lab === 'Lleno' ? 'A esa hora el Club estará muy lleno. Elegir otra franja te ahorra espera.' : 'Según las confirmaciones, a esa hora hay espacio.'}</span></section>
    <section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:8px"><b style="color:var(--green)">¿Dónde prefieren almorzar?</b>${zones}</section>
    <label class="card" style="padding:12px 14px;display:flex;align-items:center;gap:12px"><span style="flex:1"><span style="display:block;font-weight:600">¿Celebran algo?</span><span class="sub">Cuéntanos si es un cumpleaños o un grupo grande</span></span><input type="checkbox" id="b-cel" data-act="bCel" ${f.cel ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--green)"></label>
    <button class="btn primary block" style="min-height:50px;font-size:16px" data-act="bConfirm">Confirmar que vamos · ${f.fam + f.inv} personas</button>
    <span class="sub" style="text-align:center">Puedes cambiarlo hasta el domingo a las 10:00 a. m.</span>`;
  }
  return `<div class="phone">
    <div class="ph-head"><div><small style="letter-spacing:1.5px;text-transform:uppercase">Mi club · acción 1482</small><h3>Planea tu domingo</h3><small>${sundayLabel().replace(/^d/, 'D')} · almuerzo</small></div></div>
    <div class="ph-body" data-scroll="b-phone">${body}</div></div>`;
}

/* =========================================================
   PROPUESTA C · Mesa al día
   ========================================================= */
const cDish = id => S.C.menu.find(d => d.id === id);
const cartTotal = () => sum(S.C.cart, x => x.price * x.qty);
const cartCount = () => sum(S.C.cart, x => x.qty);
const myOrder = () => S.C.orders.find(o => o._key === S.C.my);
const altFor = d => S.C.menu.find(x => x.cat === d.cat && x.id !== d.id && x.st === 'ok');
const CAT_ORDER = ['Fuertes', 'Sopas', 'Bebidas'];
const cats = menu => [...new Set(menu.map(d => d.cat))].sort((a, b) => ((CAT_ORDER.indexOf(a) + 1) || 99) - ((CAT_ORDER.indexOf(b) + 1) || 99) || a.localeCompare(b, 'es'));
const itemReady = it => it.checks.every(c => c.d) && (it.temp == null || it.temp >= 63);

function viewC() {
  const C = S.C;
  return `
  ${guide('Propuesta C', 'Mesa al día: del pedido en la mesa al plato bien servido',
    'El socio pide desde la mesa viendo la disponibilidad real, sigue su pedido y recibe aviso si se retrasa. En el pase, cada plato se revisa contra el estándar antes de salir. Responde a C4 (la decepción al final de la espera) y a los errores de comanda.',
    ['En la <b>carta</b>, abre el churrasco, elige término y acompañamiento, y agrégalo con un ajiaco.', 'Envía el pedido: en unos segundos llega al <b>pase</b>.', 'Revisa la lista de chequeo. Si un plato está frío, caliéntalo antes de despachar.', 'Despacha y mira el seguimiento en el celular. Con <b>+5 min</b> puedes simular una demora.'])}
  <div class="${stageCls()}">
    ${part('desk') ? `<div style="min-width:0"><p class="caption">C3 · Estación de pase</p>${cPase()}</div>` : ''}
    ${part('phone') ? `<div class="phone-wrap"><p class="caption">${C.phone === 'carta' ? 'C1 · App del socio · Carta en la mesa' : 'C2 · App del socio · Seguimiento del pedido'}</p>${cPhone()}</div>` : ''}
  </div>`;
}

function cPase() {
  const C = S.C, q = C.orders.filter(o => o.st === 'pase' || o.st === 'prep');
  if (!q.find(o => o._key === C.sel && o.st === 'pase')) C.sel = q.filter(o => o.st === 'pase').sort((a, b) => a.t - b.t)[0]?._key ?? null;
  const sel = C.orders.find(o => o._key === C.sel);
  const queue = q.sort((a, b) => a.t - b.t).map(o => { const e = S.clock - o.t, col = e > 30 ? 'var(--bad)' : e > 20 ? 'var(--warn)' : 'var(--ok)';
    return `<button data-act="cSel" data-arg="${o._key}" aria-pressed="${o._key === C.sel}" ${o.st === 'prep' ? 'disabled style="opacity:.7"' : ''}><span style="display:flex;justify-content:space-between;width:100%;gap:8px"><b style="font-size:16px">#${o.id} · ${esc(o.mesa)}</b><b class="tnum" style="color:${col}">${e} min</b></span><span class="sub">${sum(o.items, i => i.qty)} platos · ${esc(o.mesero || 'mesero por asignar')} · ${o.st === 'prep' ? 'en cocina, aún no llega' : o.owner ? 'nuevo · desde la carta' : 'por revisar'}</span></button>`; }).join('') || '<p class="empty">No hay pedidos por despachar.</p>';
  let detail = '<div class="card"><p class="empty">Elige un pedido de la lista para revisarlo.</p></div>';
  if (sel) {
    const e = S.clock - sel.t, allOk = sel.items.every(itemReady);
    const cards = sel.items.map((it, k) => {
      const tempOk = it.temp == null || it.temp >= 63;
      const done = it.checks.filter(c => c.d).length, total = it.checks.length;
      return `<article class="card" style="display:flex;flex-direction:column;gap:10px;${tempOk ? '' : 'border:2px solid var(--bad)'}">
        <div class="ph-photo">${ic('camera', 26, 'currentColor', 1.8)}<span>Foto estándar: ${esc(it.name)}</span></div>
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b style="font-size:16px">${it.qty}× ${esc(it.name)}</b><b class="tnum" style="font-size:13px;color:${done === total && tempOk ? 'var(--ok)' : 'var(--warn)'}">${done} de ${total}</b></div>
        ${it.checks.map((c, j) => `<label class="check"><input type="checkbox" id="chk-${sel._key}-${k}-${j}" data-act="cCheck" data-arg="${sel._key}:${k}:${j}" ${c.d ? 'checked' : ''}><span>${esc(c.l)}</span></label>`).join('')}
        ${it.temp == null ? `<div class="temp" style="background:var(--neutral-bg)">${ic('glass', 18, 'var(--muted)')}<span>Bebida fría · no requiere medir temperatura</span></div>`
          : tempOk ? `<div class="temp" style="background:var(--ok-bg);color:#17402A">${ic('therm', 18, 'var(--ok)')}<span><b>${it.temp} °C</b> · temperatura correcta</span></div>`
          : `<div class="temp" style="background:var(--bad-bg);color:var(--bad-ink)">${ic('therm', 18, 'var(--bad)')}<span><b style="color:var(--bad)">${it.temp} °C</b> · por debajo de 63 °C</span></div><button class="btn badline sm" data-act="cHeat" data-arg="${sel._key}:${k}">Calentar y volver a medir</button>`}
      </article>`;
    }).join('');
    detail = `<section class="card" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:flex-end"><div><h2 style="font-family:var(--display);font-size:22px">Pedido #${sel.id} · ${esc(sel.mesa)}</h2><span class="sub">Comanda a las ${hm(sel.t)} · mesero ${esc(sel.mesero || 'por asignar')}${sel.owner ? ' · el socio lo sigue en su celular' : ''}</span></div><span class="badge ${e > 30 ? 'bg-neu' : 'bg-ok'}" style="${e > 30 ? 'background:var(--bad-bg);color:var(--bad)' : ''}">${e} min · prometido a la ${hm(sel.t + 30)}</span></div>
      <div class="row" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${cards}</div>
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid #F0EBE0;padding-top:12px">
        <span class="sub">${allOk ? 'Todo revisado. Al despachar, el socio ve “En camino”.' : 'Completa la lista y corrige la temperatura para poder despachar.'}</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="cNotify" data-arg="${sel._key}" ${sel.notified ? 'disabled' : ''}>${sel.notified ? '✓ Demora avisada' : 'Avisar demora al socio'}</button><button class="btn primary" data-act="cDispatch" data-arg="${sel._key}" ${allOk ? '' : 'disabled'}>Despachar a ${esc(sel.mesa)}</button></div>
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
      <section class="card"><h2>Platos despachados</h2>${(() => {
        const by = {};
        C.sent.forEach(o => o.items.forEach(i => { const d = by[i.name] || (by[i.name] = { q: 0, h: 0 }); d.q += i.qty; if (i.heated) d.h++; }));
        const list = Object.entries(by).sort((a, b) => b[1].q - a[1].q).slice(0, 6);
        return list.length ? `<div class="list" style="border:none;padding:0;margin-top:8px">${list.map(([n, d]) => `<div class="li"><span>${esc(n)}</span><span class="st ${d.h ? 'st-warn' : 'st-ok'}">${d.q} despachado${d.q === 1 ? '' : 's'}${d.h ? ` · ${d.h} corregido${d.h === 1 ? '' : 's'}` : ' ✓'}</span></div>`).join('')}</div>` : '<p class="empty" style="margin-top:8px">Aún no se ha despachado ningún plato.</p>';
      })()}
        <p class="sub" style="margin:8px 0 0">Cada plato sale con la misma lista de chequeo y a 63 °C o más.</p></section>
    </div></div></div>`;
}

function cPhone() {
  const C = S.C;
  let body, bottom = '';
  const t = myTable();
  if (C.phone === 'carta' && !t) {
    // Sin mesa todavía: en el Club la daría el QR de la mesa; aquí se elige entre las ocupadas.
    const occ = S.B.tables.filter(x => x.st === 'ocu' || x.st === 'pronto');
    body = `<section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:6px"><b style="color:var(--green)">¿En qué mesa estás?</b><span class="sub">En el Club basta con escanear el código QR de la mesa.</span></section>
      ${occ.length ? S.B.zones.map(z => { const ts = occ.filter(x => x.zone.id === z.id); return ts.length ? `<h3 class="h3s">${z.name}</h3><div class="tmap" style="grid-template-columns:repeat(4,minmax(0,1fr))">${ts.map(x => `<button class="tbl t-ocu" data-act="cTable" data-arg="${x.id}"><b>${x.id}</b><span>${x.cap} p.</span></button>`).join('')}</div>` : ''; }).join('')
        : '<p class="empty">Aún no hay mesas ocupadas. Pide en recepción que te asignen una.</p>'}`;
  } else if (C.phone === 'carta') {
    const cs = cats(C.menu); if (cs.length && !cs.includes(C.cat)) C.cat = cs[0];
    const tabs = cs.map(c => `<button class="chip-b" data-act="cCat" data-arg="${esc(c)}" aria-pressed="${C.cat === c}">${esc(c)}</button>`).join('');
    const dishes = C.menu.filter(d => d.cat === C.cat).map(d => {
      if (d.st === 'off') return `<article class="dish off"><div class="r1"><span class="thumb">${ic('ban', 24, 'var(--muted)', 1.8)}</span><div style="flex:1;min-width:0"><div class="struck" style="font-weight:700">${esc(d.name)}</div><div class="sub" style="color:#3E4440">Se agotó hoy${sinceTxt(d, ' a las ')}.${altFor(d) ? ` Te sugerimos ${esc(altFor(d).name.toLowerCase())}.` : ''}</div></div></div></article>`;
      const badge = d.fast ? `<span class="badge bg-ok">Rápido · ~${d.min} min</span>` : d.st === 'few' ? `<span class="badge bg-warn">Quedan pocas · ~${d.min} min</span>` : `<span class="badge bg-neu">~${d.min} min</span>`;
      const inCart = sum(C.cart.filter(x => x.id === d.id), x => x.qty);
      const open = C.open === d.id;
      const opts = open ? `<div class="opt"><span class="lb">Término</span><div class="chips">${['Medio', 'Tres cuartos', 'Bien asado'].map(o => `<button class="chip-b" data-act="cOpt" data-arg="termino:${o}" aria-pressed="${C.opts.termino === o}">${o}</button>`).join('')}</div></div>
        <div class="opt"><span class="lb">Acompañamiento</span><div class="chips">${['Papa criolla', 'Papa a la francesa', 'Yuca'].map(o => `<button class="chip-b" data-act="cOpt" data-arg="acomp:${o}" aria-pressed="${C.opts.acomp === o}">${o}</button>`).join('')}</div></div>
        <label class="opt" for="c-nota"><span class="lb">Algo más para la cocina</span><input id="c-nota" data-act="cNota" value="${esc(C.opts.nota)}" placeholder="Ej.: sin chimichurri" style="padding:8px 10px;border-radius:8px;border:1px solid var(--line-2);background:var(--paper-2)"></label>
        <button class="btn primary block" data-act="cAdd" data-arg="${d.id}">Agregar al pedido · ${money(d.price)}</button>` : '';
      return `<article class="dish ${open ? 'sel' : ''}"><div class="r1"><span class="thumb">${ic(d.icon, 24, '#9A8F78', 1.8)}</span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><b>${esc(d.name)}</b><span>${badge}${inCart ? ` <span class="badge bg-ok">En tu pedido: ${inCart}</span>` : ''}</span></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><b class="tnum" style="font-size:14px">${money(d.price)}</b>${open ? '' : `<button class="btn sm primary" data-act="${d.options ? 'cOpen' : 'cAdd'}" data-arg="${d.id}" aria-label="${d.options ? 'Elegir opciones de' : 'Agregar'} ${esc(d.name)}">${d.options ? 'Elegir' : 'Agregar'}</button>`}</div></div>${opts}</article>`;
    }).join('');
    const busy = S.B.tables.filter(t => t.st === 'ocu' || t.st === 'pronto').length / (S.B.tables.length || 1) >= 0.8;
    body = `<div class="alert a-ok">${ic('bolt', 20, 'var(--ok)')}<span>${busy ? 'Hoy hay alta afluencia. ' : ''}Lo marcado <b>Rápido</b> llega en menos de 15 min.</span></div><div class="chips">${tabs}</div>${dishes}
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
      body = `<section class="card" style="background:var(--green);border-color:var(--green);color:var(--on-dark)"><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--on-dark-2)"><span>Pedido #${o.id} · ${esc(o.mesa)}</span><span>Mesero: ${esc(o.mesero || 'por asignar')}</span></div><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-top:8px"><div><div style="font-size:13px;color:var(--on-dark-2)">${o.st === 'servido' ? 'Tu pedido' : 'Tu plato llega'}</div><div style="font-family:var(--display);font-size:30px;font-weight:700">${eta}</div></div><div style="font-size:12px;color:var(--on-dark-2);text-align:right">Pediste a las ${hm(o.t)}<br>Prometido: ${hm(due)}</div></div></section>
        <section class="card steps" style="padding:14px 16px">${steps}</section>
        <div class="list">${o.items.map(it => `<div class="li"><div style="min-width:0"><div class="nm">${it.qty}× ${esc(it.name)}</div>${it.note ? `<div class="ds">${esc(it.note)}</div>` : ''}</div>${status(it)}</div>`).join('')}</div>
        ${courtesy}
        <div class="grid2"><button class="btn" data-act="cCall">${ic('bell', 16)} Llamar al mesero</button><button class="btn" data-act="cPhone" data-arg="carta">${ic('plus', 16)} Otra ronda</button></div>
        ${rating}
        ${o.st === 'servido' ? (o.returned ? '<div class="alert a-neu"><span>Reportaste un problema con tu plato: A&amp;B ya lo sabe y te van a atender.</span></div>' : '<button class="btn block" data-act="cReturn">Tuve un problema con mi plato</button>') : ''}`;
    }
  }
  return `<div class="phone">
    <div class="ph-head" style="${C.phone === 'carta' ? '' : ''}"><div><small style="letter-spacing:1.5px;text-transform:uppercase">Carta del día</small><h3>${t ? `${t.zone.name} · Mesa ${t.id}` : 'Elige tu mesa'}</h3></div>${t ? `<button class="btn sm" style="background:transparent;color:var(--on-dark);border-color:#47665A" data-act="cTable" data-arg="">${ic('pin', 14)} Cambiar</button>` : ''}</div>
    <div class="ph-body" data-scroll="c-phone">${body}</div>
    ${bottom}
    <nav class="ph-nav" aria-label="Secciones del socio">
      <button data-act="cPhone" data-arg="carta" ${C.phone === 'carta' ? 'aria-current="page"' : ''}>${ic('fork', 22)}Carta</button>
      <button data-act="cPhone" data-arg="seg" ${C.phone === 'seg' ? 'aria-current="page"' : ''}>${ic('clock', 22)}Mi pedido</button>
    </nav></div>`;
}

/* ---------- piezas comunes ---------- */
/* Con perfil activo solo se muestran sus pantallas (desk / phone) y sin la guía de la demo. */
const part = p => !S.profile?.parts || S.profile.parts.includes(p);
const stageCls = () => (S.profile?.parts?.length === 1 ? 'stage solo' : 'stage');

function guide(tag, title, what, steps) {
  if (S.profile?.parts) return '';
  return `<section class="guide"><div><span class="tag">${tag}</span><h1>${title}</h1><p>${what}</p></div><div><h2>Pruébalo</h2><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol></div></section>`;
}
function appHead(t, who, chip) {
  return `<div class="ahead"><div style="display:flex;align-items:center;gap:12px"><div class="mono" style="width:34px;height:34px;font-size:12px" aria-hidden="true">CF</div><div><div class="t">Club Campestre Farallones</div><div class="s">${t}</div></div></div><div class="r"><span class="chip">${chip}</span><span>${who}</span></div></div>`;
}

/* ---------- acciones ---------- */
// Lo que es de la interfaz (pestañas, borradores, carrito) cambia S; lo que deben ver
// los demás perfiles se guarda con commit() en la base compartida.
const findA = key => S.A.orders.find(x => x._key === key);
const tableById = id => S.B.tables.find(t => t.id === id) || null;
// Cada vez que se sienta gente en una mesa queda registrado: es la demanda "real" del panel.
const seatOp = (table, people) => ({ p: `seatings/${newKey('s')}`, v: { table, people, t: S.clock } });
// Mesero de una mesa: quien le tomó el último pedido.
const waiterFor = tid => S.A.orders.filter(o => o.mesa === tid).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0]?.mesero || null;
const myTable = () => { const t = S.C.tableId && tableById(S.C.tableId); return t && (t.st === 'ocu' || t.st === 'pronto') ? t : null; };
const findC = key => S.C.orders.find(x => x._key === key);
const H = {
  view: v => { if (S.profile && !allowedViews().includes(v)) return; S.view = v; try { history.replaceState(null, '', '#' + v); } catch { location.hash = v; } window.scrollTo({ top: 0 }); },
  tick: n => { S.clockOffset += Number(n); hydrate(); toast(`Reloj de la demo: ${hmp(S.clock)}`); },
  reset: () => {
    if (!window.confirm('¿Reiniciar la demo? Se borran los pedidos, avisos y confirmaciones de todos los perfiles y se vuelve al escenario inicial.')) return;
    S.clockOffset = 0; commit(seedOps(true)); toast('La demo volvió al inicio para todos los perfiles');
  },

  aScreen: s => { S.A.screen = s; },
  aMove: arg => { const [key, st] = arg.split(':'); const o = findA(key); if (!o) return;
    commit([{ p: `orders/${key}/st`, v: st }]);
    if (st === 'listo') toast(`Pedido #${o.id} listo · avisamos a ${o.mesero}`);
    if (st === 'entregado') toast(`Pedido #${o.id} entregado en ${PUNTO[o.punto] || o.punto}, mesa ${o.mesa}`); },
  aAsk: id => { S.A.confirming = id; },
  aCancel: () => { S.A.confirming = null; },
  aOff: id => { const A = S.A, d = dishById(id); if (!d) return; A.confirming = null;
    commit([
      { p: `products/${id}/st`, v: 'off' }, { p: `products/${id}/since`, v: S.clock }, { p: `products/${id}/left`, v: null },
      { p: `notices/${newKey('n')}`, v: { dish: id, t: S.clock, createdAt: Date.now(), acked: false } }
    ]);
    toast(`${d.name} quedó agotada · aviso enviado a ${A.staff} meseros`); },
  aOn: id => { const d = dishById(id); if (!d) return;
    commit([
      { p: `products/${id}/st`, v: 'ok' }, { p: `products/${id}/left`, v: null }, { p: `products/${id}/since`, v: null },
      ...S.A.notices.filter(n => n.dish === id).map(n => ({ p: `notices/${n._key}`, v: null }))
    ]);
    toast(`${d.name} vuelve a estar disponible en todos los puntos`); },
  aAck: key => { const n = S.A.notices.find(x => x._key === key); if (n && !n.mine) { commit([{ p: `notices/${key}/acked`, v: true }]); toast('Cocina ve que ya leíste el aviso'); } },
  aCallDone: key => { const c = S.A.calls.find(x => x._key === key); if (!c) return; commit([{ p: `calls/${key}`, v: null }]); toast(`Vas en camino a ${c.mesa}`); },
  aWTab: t => { S.A.waiterTab = t; },
  // El mesero avisa desde el salón; asignar una mesa libre sigue siendo de Recepción.
  aTable: tid => { const t = tableById(tid); if (!t) return;
    if (t.st === 'ocu') { commit([{ p: `tables/${tid}/st`, v: 'pronto' }]); toast(`Mesa ${t.id} pidió la cuenta · Recepción ya lo ve`); }
    else if (t.st === 'pronto') { commit([{ p: `tables/${tid}`, v: null }]); toast(`Mesa ${t.id} quedó libre · Recepción puede asignarla`); }
    else if (t.st === 'libre') toast(`Mesa ${t.id} está libre · Recepción la asigna a quien llegue`);
    else toast(`Mesa ${t.id} está apartada para ${t.who ? 'la familia ' + t.who : 'quien confirmó'}`); },
  aPick: tid => { const A = S.A;
    if (!tid) { A.draft.mesa = null; return; }
    const t = tableById(tid); if (!t) return;
    if (t.st === 'apa') { toast(`Mesa ${t.id} está apartada${t.who ? ' para ' + t.who : ''} · la asigna Recepción`); return; }
    if (A.draft.mesa !== tid) A.draft.people = Math.min(2, t.cap);
    A.draft.mesa = tid; A.waiterTab = 'salon'; },
  aPeople: d => { const dr = S.A.draft, t = tableById(dr.mesa); if (!t) return; dr.people = Math.max(1, Math.min(t.cap, dr.people + Number(d))); },
  aQty: arg => { const [id, d] = arg.split(':'); const it = S.A.draft.items; it[id] = Math.max(0, (it[id] || 0) + Number(d)); if (!it[id]) delete it[id]; },
  aSend: () => { const A = S.A, dr = A.draft, t = tableById(dr.mesa);
    if (!t) { toast('Primero elige la mesa'); A.waiterTab = 'salon'; return; }
    if (t.st === 'apa') { toast(`Mesa ${t.id} quedó apartada · elige otra`); dr.mesa = null; return; }
    const items = Object.entries(dr.items).filter(([id]) => dishById(id) && dishById(id).st !== 'off').map(([id, q]) => [q, dishById(id).name, '']);
    if (!items.length) { toast('Agrega al menos un plato disponible'); return; }
    const opened = t.st === 'libre';
    const o = { id: nextNum(A.orders, 0), punto: t.zone.name, zona: t.zone.id, mesa: t.id, mesero: waiterName(), t: S.clock, st: 'pend', items, createdAt: Date.now(), owner: uid() };
    commit([{ p: `orders/${newKey('o')}`, v: o }, ...(opened ? [{ p: `tables/${t.id}`, v: { st: 'ocu' } }, seatOp(t.id, dr.people)] : [])]);
    dr.items = {}; dr.mesa = null; A.waiterTab = 'mesas';
    toast(`Pedido #${o.id} enviado a cocina · mesa ${t.id}${opened ? ' (ahora ocupada)' : ''}`); },

  bScreen: s => { S.B.screen = s; },
  bQty: arg => { const [k, d] = arg.split(':'); const f = S.B.form; f[k] = Math.max(k === 'fam' ? 1 : 0, Math.min(12, f[k] + Number(d))); },
  bSlot: s => { S.B.form.slot = s; },
  bZona: z => { S.B.form.zona = z; },
  bConfirm: () => { const B = S.B, f = B.form; if (B.confirmed) return;
    commit([{ p: `arrivals/${socioKey()}`, v: { name: 'Familia de la acción 1482', fam: f.fam, inv: f.inv, slot: f.slot, zona: f.zona, cel: f.cel, owner: uid(), createdAt: Date.now() } }]);
    toast('Confirmado: la cocina y la recepción ya te tienen en cuenta'); },
  bUndo: () => { const B = S.B, c = B.confirmed; if (!c) return;
    commit([{ p: `arrivals/${socioKey()}`, v: null }, ...B.wait.filter(w => w.from === socioKey()).map(w => ({ p: `waitlist/${w.id}`, v: null }))]);
    B.form = { fam: c.fam, inv: c.inv, slot: c.slot, zona: c.zona, cel: Boolean(c.cel) };
    toast('Tu aviso quedó cancelado'); },
  // Planeación propone otro horario a las familias de la franja llena; cada socio decide en su app.
  bSuggest: h => { const B = S.B, hour = Number(h), at = Date.now();
    const fams = B.all.filter(a => hourOf(a.slot) === hour && !a.seated && !a.suggest);
    if (!fams.length) return;
    commit([...fams.map(a => ({ p: `arrivals/${a.id}/suggest`, v: { at, from: hour } })), { p: 'plan/suggestion', v: { at, hour, sent: fams.length } }]);
    toast(`Sugerencia enviada a ${fams.length} familia${fams.length === 1 ? '' : 's'}`); },
  bMove: slot => { const c = S.B.confirmed; if (!c?.suggest) return;
    commit([{ p: `arrivals/${c.id}/slot`, v: slot }, { p: `arrivals/${c.id}/suggest/answer`, v: 'move' }]);
    toast(`Listo: los esperamos a las ${slot}`); },
  bKeep: () => { const c = S.B.confirmed; if (!c?.suggest) return;
    commit([{ p: `arrivals/${c.id}/suggest/answer`, v: 'keep' }]); toast('Mantienes tu horario'); },
  bWarehouse: () => { const tt = bTotals(), rows = dishForecast(tt.t); if (!rows.length || !tt.t) return;
    commit([{ p: 'plan/warehouse', v: { t: S.clock, at: Date.now(), diners: tt.t, items: rows.map(r => ({ name: r.d.name, qty: r.sug })) } }]);
    toast(`Pedido enviado al almacén · ${rows.length} plato${rows.length === 1 ? '' : 's'} para ${tt.t} comensales`); },
  bAssign: arg => { const [aid, tid] = arg.split(':'); const B = S.B, a = B.arrivals.find(x => x.id === aid), t = tableById(tid);
    if (!a || !t) return;
    commit([{ p: `tables/${tid}`, v: { st: 'ocu' } }, { p: `arrivals/${aid}/seated`, v: true }, { p: `arrivals/${aid}/table`, v: tid }, seatOp(tid, a.fam + a.inv)]);
    toast(`${a.name}: mesa ${t.id} asignada · el mesero ya la ve ocupada`); },
  bToWait: aid => { const a = S.B.arrivals.find(x => x.id === aid); if (!a) return;
    commit([{ p: `arrivals/${aid}/waiting`, v: true }, { p: `waitlist/${newKey('w')}`, v: { name: a.name, n: a.fam + a.inv, zona: zoneName(a.zona), from: aid, t: S.clock, order: Date.now() } }]);
    toast(`${a.name} pasó a la lista de espera`); },
  bTable: tid => { const B = S.B, t = tableById(tid); if (!t) return;
    if (t.st === 'ocu') { commit([{ p: `tables/${tid}/st`, v: 'pronto' }]); toast(`Mesa ${t.id} pidió la cuenta`); }
    else if (t.st === 'pronto') { commit([{ p: `tables/${tid}`, v: null }]); toast(`Mesa ${t.id} quedó libre`); }
    else if (t.st === 'libre') { const w = B.wait.find(x => x.n <= t.cap);
      if (w) {
        commit([{ p: `tables/${tid}`, v: { st: 'ocu' } }, { p: `waitlist/${w.id}`, v: null }, seatOp(tid, w.n),
          ...(w.from ? [{ p: `arrivals/${w.from}/seated`, v: true }, { p: `arrivals/${w.from}/table`, v: tid }, { p: `arrivals/${w.from}/waiting`, v: null }] : [])]);
        toast(`${w.name} pasa a la mesa ${t.id}`);
      } else { commit([{ p: `tables/${tid}`, v: { st: 'ocu' } }, seatOp(tid, t.cap)]); toast(`Mesa ${t.id} ocupada`); } }
    else toast(`Mesa ${t.id} está apartada para quien confirmó`); },
  bNotify: id => { const w = S.B.wait.find(x => x.id === id); if (w) { commit([{ p: `waitlist/${id}/notified`, v: S.clock }]); toast(`${w.name} recibirá un mensaje cuando su mesa esté lista`); } },
  bWQty: d => { const f = S.B.waitForm; f.n = Math.max(1, Math.min(20, f.n + Number(d))); },
  bWZona: z => { S.B.waitForm.zona = z; },
  bAddWait: () => { const f = S.B.waitForm, name = f.name.trim();
    if (!name) { toast('Escribe el nombre de la familia'); return; }
    commit([{ p: `waitlist/${newKey('w')}`, v: { name, n: f.n, zona: f.zona, t: S.clock, order: Date.now() } }]);
    S.B.waitForm = { name: '', n: 2, zona: 'cualquier zona' };
    toast(`${name} entró a la lista de espera`); },

  cCat: c => { S.C.cat = c; S.C.open = null; },
  cOpen: id => { S.C.open = id; },
  cOpt: arg => { const [k, v] = arg.split(':'); S.C.opts[k] = v; },
  cAdd: id => { const C = S.C, d = cDish(id); if (!d || d.st === 'off') return;
    const note = d.options ? [C.opts.termino.toLowerCase(), C.opts.acomp.toLowerCase(), C.opts.nota.trim()].filter(Boolean).join(' · ') : '';
    const ex = C.cart.find(x => x.id === id && x.note === note); if (ex) ex.qty++; else C.cart.push({ id, name: d.name, price: d.price, qty: 1, note, hot: d.hot ?? null });
    C.open = null; C.opts.nota = ''; toast(`${d.name} agregado a tu pedido`); },
  cRemove: k => { S.C.cart.splice(Number(k), 1); },
  cTable: tid => { if (!tid) { commit([{ p: `diners/${uid()}`, v: null }]); return; }
    const t = tableById(tid); if (!t) return;
    commit([{ p: `diners/${uid()}`, v: { table: tid, at: Date.now() } }]); S.C.phone = 'carta'; toast(`Estás en la mesa ${t.id} · ${t.zone.name}`); },
  cSend: () => { const C = S.C; if (!C.cart.length) return;
    const t = myTable(); if (!t) { toast('Primero elige tu mesa'); return; }
    // Si un plato se agotó mientras estaba en el carrito, no se envía.
    const gone = C.cart.filter(x => cDish(x.id)?.st === 'off' || !cDish(x.id));
    if (gone.length) { C.cart = C.cart.filter(x => !gone.includes(x)); toast(`Se agotó: ${gone.map(x => x.name).join(', ')}. Lo quitamos de tu pedido.`); return; }
    const id = nextNum(C.orders, 249), ms = Date.now();
    const o = { id, mesa: `${t.zone.name} ${t.id}`, table: t.id, mesero: waiterFor(t.id), t: S.clock, st: 'prep', notified: false, owner: uid(), createdAt: ms, toPaseAt: ms + 4500,
      items: C.cart.map(x => ({ name: x.name, qty: x.qty, note: x.note, temp: x.hot, checks: checksFor(x.name, x.note) })) };
    commit([{ p: `pase/${newKey('p')}`, v: o }]);
    C.cart = []; C.phone = 'seg'; toast(`Pedido #${id} enviado a cocina`); },
  cSel: key => { S.C.sel = key; },
  cHeat: arg => { const [key, k] = arg.split(':'); const o = findC(key); if (!o || !o.items[k]) return;
    commit([{ p: `pase/${key}/items/${k}/temp`, v: 70 }, { p: `pase/${key}/items/${k}/heated`, v: true }]); toast(`${o.items[k].name}: ahora a 70 °C`); },
  cNotify: key => { const o = findC(key); if (o) { commit([{ p: `pase/${key}/notified`, v: true }]); toast(`Avisamos al socio de ${o.mesa} y le ofrecimos una cortesía`); } },
  cDispatch: key => { const o = findC(key); if (!o || !o.items.every(itemReady)) return;
    commit([
      { p: `pase/${key}/st`, v: 'camino' }, { p: `pase/${key}/servedAt`, v: Date.now() + (o.owner ? 5000 : 1200) }
    ]);
    toast(`Pedido #${o.id} despachado a ${o.mesa}`); },
  cPhone: p => { S.C.phone = p; },
  cCourtesy: () => { const o = myOrder(); if (!o || o.courtesy) return;
    commit([
      { p: `pase/${o._key}/courtesy`, v: true },
      { p: `pase/${o._key}/items/${o.items.length}`, v: { name: 'Postre del día (cortesía)', qty: 1, note: '', checks: [{ l: 'Completo según la comanda', d: true }] } }
    ]);
    toast('Cortesía aceptada'); },
  cCall: () => { const t = myTable(), o = myOrder();
    const table = t?.id || o?.table, mesero = (table && waiterFor(table)) || o?.mesero || null;
    if (!table) { toast('Primero elige tu mesa'); return; }
    commit([{ p: `calls/${newKey('c')}`, v: { mesa: `Mesa ${table}`, table, mesero, t: S.clock, createdAt: Date.now() } }]);
    toast(mesero ? `Le avisamos a ${mesero} que lo necesitas` : 'Le avisamos a los meseros que los necesitas'); },
  cReturn: () => { const o = myOrder(); if (!o || o.returned) return;
    commit([{ p: `pase/${o._key}/returned`, v: true }]); toast('Gracias por avisar: A&B ya lo sabe'); },
  cRate: n => { const o = myOrder(); if (!o) return; commit([{ p: `pase/${o._key}/rating`, v: Number(n) }]); toast('Gracias por calificar tu almuerzo'); }
};

/* ---------- render con memoria de scroll y foco ---------- */
function render() {
  const keep = {};
  document.querySelectorAll('[data-scroll]').forEach(el => (keep[el.dataset.scroll] = el.scrollTop));
  const ae = document.activeElement, fk = ae && ae.dataset && ae.dataset.act ? ae.dataset.act + '|' + (ae.dataset.arg || '') + '|' + (ae.id || '') : null;
  const caret = ae && ae.tagName === 'INPUT' && ae.type === 'text' ? [ae.selectionStart, ae.selectionEnd] : null;
  $('#clock').textContent = currentTime();
  ['a', 'b', 'c'].forEach(v => $('#tab-' + v).setAttribute('aria-selected', String(S.view === v)));
  const tabs = document.querySelector('.ptabs');
  if (tabs) tabs.hidden = allowedViews().length < 2;
  ['a', 'b', 'c'].forEach(v => { $('#tab-' + v).hidden = !allowedViews().includes(v); });
  // Con perfil solo el Director de A&B puede reiniciar la demo; el +5 min es solo de la demo sin sesión.
  const tickBtn = $('.clock [data-act="tick"]'), resetBtn = $('.clock [data-act="reset"]');
  if (tickBtn) tickBtn.hidden = Boolean(S.profile);
  if (resetBtn) resetBtn.hidden = Boolean(S.profile) && S.profile.role !== 'director';
  const profileLabel = $('#session-profile');
  if (profileLabel) profileLabel.textContent = S.profile ? `Vista de ${S.profile.label}` : 'Prototipos de Alimentos y Bebidas';
  $('#view').innerHTML = MODE === 'pending'
    ? '<p class="empty" role="status">Conectando con la base de datos…</p>'
    : S.view === 'a' ? viewA() : S.view === 'b' ? viewB() : viewC();
  document.querySelectorAll('[data-scroll]').forEach(el => { if (keep[el.dataset.scroll] != null) el.scrollTop = keep[el.dataset.scroll]; });
  if (fk) {
    const [act, arg, id] = fk.split('|');
    const el = id ? document.getElementById(id) : [...document.querySelectorAll(`[data-act="${act}"]`)].find(x => (x.dataset.arg || '') === arg);
    if (el && !el.disabled) { el.focus({ preventScroll: true }); if (caret && el.setSelectionRange) el.setSelectionRange(caret[0], caret[1]); }
  }
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT') return;
  const fn = H[el.dataset.act]; if (!fn) return;
  if (MODE === 'pending' && !['view', 'tick', 'reset'].includes(el.dataset.act)) return;
  e.preventDefault(); fn(el.dataset.arg, el); render();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'cCheck') {
    const [key, k, j] = el.dataset.arg.split(':');
    if (findC(key)?.items[k]?.checks[j]) commit([{ p: `pase/${key}/items/${k}/checks/${j}/d`, v: el.checked }]);
    render();
  }
  if (el.dataset.act === 'bCel') { S.B.form.cel = el.checked; }
});
document.addEventListener('input', e => {
  if (e.target.dataset.act === 'cNota') S.C.opts.nota = e.target.value;
  if (e.target.dataset.act === 'bWName') S.B.waitForm.name = e.target.value;
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.act === 'bWName') { e.preventDefault(); H.bAddWait(); render(); } });

/* ---------- conexión con la página principal (Firebase) ---------- */
const embedded = window.parent !== window;
function receiveState(mode, db) {
  const first = MODE === 'pending';
  if (mode === 'firebase') { MODE = 'firebase'; DB = db && typeof db === 'object' ? db : {}; }
  else if (first) { MODE = 'local'; DB = {}; }
  else return;
  // La primera vez que alguien abre la app con la base vacía, siembra el escenario inicial.
  if (!DB.meta?.seededAt) commit(seedOps(false));
  else hydrate();
  render();
}
const h = (location.hash || '').replace('#', '');
if (['a', 'b', 'c'].includes(h)) S.view = h;
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== window.parent) return;
  const d = event.data || {};
  if (d.type === 'farallones:session' && d.profile) {
    const firstSession = !S.profile || S.profile.uid !== d.profile.uid;
    S.profile = d.profile;
    // Conserva la pestaña elegida si la página principal vuelve a enviar la sesión.
    if (firstSession || !allowedViews().includes(S.view)) S.view = d.profile.view || allowedViews()[0];
    if (MODE !== 'pending') hydrate();
    render();
  }
  if (d.type === 'farallones:state') receiveState(d.mode, d.db);
  if (d.type === 'farallones:write-failed') toast(d.message || 'No se pudo guardar el cambio en la base de datos');
});
render();
if (embedded) window.parent.postMessage({ type: 'farallones:ready' }, location.origin);
else receiveState('local');
// Reloj real, confirmaciones que van llegando y pedidos que avanzan solos.
setInterval(() => {
  const clock = $('#clock');
  if (clock) clock.textContent = currentTime();
  if (MODE !== 'pending' && liveSig() !== lastSig) { hydrate(); render(); }
}, 500);
})();
