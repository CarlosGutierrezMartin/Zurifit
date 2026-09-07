// Estado y persistencia. Todo vive en el localStorage del móvil de la usuaria:
// no hay servidor, no se envía nada a ningún sitio.

const KEY = 'zurifit.state.v1';

const DEFAULT_STATE = {
  version: 1,
  profile: null,          // { name, emoji, startDate, createdAt }
  settings: {
    sound: true,
    vibrate: true,
    autoRest: true,
    showRir: true,
    weekOverride: null    // para ajustar manualmente la semana del programa
  },
  sessions: [],           // sesiones terminadas
  active: null,           // sesión en curso (se guarda por si cierra la app)
  achievements: {},       // id -> fecha ISO de desbloqueo
  meta: { noteDate: null, noteSeed: 0 }
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return migrate({ ...structuredClone(DEFAULT_STATE), ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      meta: { ...DEFAULT_STATE.meta, ...(parsed.meta || {}) } });
  } catch (err) {
    console.warn('No se ha podido leer el progreso guardado', err);
    return structuredClone(DEFAULT_STATE);
  }
}

function migrate(s) {
  if (!Array.isArray(s.sessions)) s.sessions = [];
  if (!s.achievements || typeof s.achievements !== 'object') s.achievements = {};
  return s;
}

let saveTimer = null;
export function save(immediate = false) {
  const write = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('No se ha podido guardar', err);
    }
  };
  if (immediate) { clearTimeout(saveTimer); write(); return; }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(write, 250);
}

export function getState() { return state; }
export function update(fn) { fn(state); save(); return state; }

// ---------------------------------------------------------------- perfil ---

export function hasProfile() { return !!(state.profile && state.profile.name); }

export function createProfile({ name, emoji, startDate }) {
  state.profile = {
    name: name.trim(),
    emoji: emoji || '🌸',
    startDate: startDate || todayISO(),
    createdAt: new Date().toISOString()
  };
  save(true);
  return state.profile;
}

export function firstName() {
  return state.profile ? state.profile.name.split(' ')[0] : '';
}

// ------------------------------------------------------------- calendario ---

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Lunes de la semana que contiene esa fecha.
export function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const shift = (d.getDay() + 6) % 7;   // 0 = lunes
  d.setDate(d.getDate() - shift);
  return d;
}

export function weekKey(dateOrISO) {
  const d = typeof dateOrISO === 'string' ? parseISO(dateOrISO) : new Date(dateOrISO);
  const m = mondayOf(d);
  m.setMinutes(m.getMinutes() - m.getTimezoneOffset());
  return m.toISOString().slice(0, 10);   // clave = lunes de esa semana
}

// Semana del programa (1, 2, 3...), contando desde el lunes de la semana
// en la que empezó. Se puede ajustar a mano desde Ajustes.
export function programWeek(dateISO) {
  if (state.settings.weekOverride) return state.settings.weekOverride;
  if (!state.profile) return 1;
  const start = mondayOf(parseISO(state.profile.startDate));
  const ref = mondayOf(dateISO ? parseISO(dateISO) : new Date());
  const weeks = Math.floor((ref - start) / (7 * 24 * 3600 * 1000));
  return Math.max(1, weeks + 1);
}

export function daysSince(iso) {
  const a = parseISO(iso), b = parseISO(todayISO());
  return Math.round((b - a) / 86400000);
}

// --------------------------------------------------------- sesión activa ---

export function getActive() { return state.active; }

export function startSession(session) {
  state.active = session;
  save(true);
  return session;
}

export function touchActive(fn) {
  if (!state.active) return null;
  fn(state.active);
  save();
  return state.active;
}

export function discardActive() {
  state.active = null;
  save(true);
}

export function finishSession(session) {
  state.sessions.push(session);
  state.sessions.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
  state.active = null;
  save(true);
  return session;
}

export function deleteSession(id) {
  state.sessions = state.sessions.filter(s => s.id !== id);
  save(true);
}

// ------------------------------------------------------------- logros ---

export function unlockAchievements(ids) {
  const fresh = [];
  const now = new Date().toISOString();
  ids.forEach(id => {
    if (!state.achievements[id]) { state.achievements[id] = now; fresh.push(id); }
  });
  if (fresh.length) save(true);
  return fresh;
}

// ------------------------------------------------------- copia de datos ---

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sessions)) {
    throw new Error('El archivo no tiene el formato de una copia de Zurifit.');
  }
  state = migrate({ ...structuredClone(DEFAULT_STATE), ...parsed,
    settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
    meta: { ...DEFAULT_STATE.meta, ...(parsed.meta || {}) } });
  save(true);
  return state;
}

export function resetAll() {
  state = structuredClone(DEFAULT_STATE);
  save(true);
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
