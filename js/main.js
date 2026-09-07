import { hasProfile, getActive } from './store.js';
import { $, mount } from './lib/dom.js';
import * as sheet from './views/sheet.js';

import onboarding from './views/onboarding.js';
import home from './views/home.js';
import workout from './views/workout.js';
import summary from './views/summary.js';
import progress from './views/progress.js';
import routine from './views/routine.js';
import achievements from './views/achievements.js';
import settings from './views/settings.js';

const ROUTES = [
  { re: /^#\/inicio$/,            view: home,         tab: 'inicio' },
  { re: /^#\/entreno\/([\w-]+)$/, view: workout,      tab: null, keys: ['id'] },
  { re: /^#\/resumen\/([\w-]+)$/, view: summary,      tab: null, keys: ['id'] },
  { re: /^#\/sesion\/([\w-]+)$/,  view: summary,      tab: 'progreso', keys: ['id'] },
  { re: /^#\/progreso$/,          view: progress,     tab: 'progreso' },
  { re: /^#\/rutina$/,            view: routine,      tab: 'rutina' },
  { re: /^#\/logros$/,            view: achievements, tab: 'logros' },
  { re: /^#\/ajustes$/,           view: settings,     tab: 'ajustes' }
];

const NAV = [
  { tab: 'inicio',   href: '#/inicio',   icon: '🏠', label: 'Hoy' },
  { tab: 'progreso', href: '#/progreso', icon: '📈', label: 'Progreso' },
  { tab: 'rutina',   href: '#/rutina',   icon: '📋', label: 'Rutina' },
  { tab: 'logros',   href: '#/logros',   icon: '🏅', label: 'Logros' },
  { tab: 'ajustes',  href: '#/ajustes',  icon: '💗', label: 'Perfil' }
];

let currentView = null;
let currentParams = {};

const ctx = {
  go(hash) { if (location.hash === hash) render(); else location.hash = hash; },
  rerender() { render(); },
  openSheet(id) { sheet.open(id); }
};

function resolve() {
  const hash = location.hash || '#/inicio';
  for (const r of ROUTES) {
    const m = hash.match(r.re);
    if (m) {
      const params = {};
      (r.keys || []).forEach((k, i) => { params[k] = m[i + 1]; });
      return { ...r, params };
    }
  }
  return { ...ROUTES[0], params: {} };
}

function renderNav(tab, hide) {
  const nav = $('#nav');
  nav.hidden = hide;
  nav.innerHTML = NAV.map(n => `
    <a class="nav__item${n.tab === tab ? ' is-on' : ''}" href="${n.href}"
       ${n.tab === tab ? 'aria-current="page"' : ''}>
      <span class="nav__icon">${n.icon}</span>
      <span class="nav__label">${n.label}</span>
    </a>`).join('');
}

function render() {
  const app = $('#app');
  sheet.close();

  if (!hasProfile()) {
    currentView?.unmounted?.();
    currentView = onboarding;
    currentParams = {};
    document.body.classList.add('is-onboarding');
    const view = mount(app, onboarding.render());
    onboarding.mounted?.(view, {}, ctx);
    renderNav(null, true);
    return;
  }
  document.body.classList.remove('is-onboarding');

  const route = resolve();
  if (currentView && currentView !== route.view) currentView.unmounted?.();
  currentView = route.view;
  currentParams = route.params;

  const active = getActive();
  const inLiveWorkout = route.view === workout && active && active.dayId === route.params.id;
  document.body.classList.toggle('is-workout', !!inLiveWorkout);

  const view = mount(app, route.view.render(route.params));
  route.view.mounted?.(view, route.params, ctx);
  renderNav(route.tab, !!inLiveWorkout);
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/inicio';
  render();
});

// Aviso discreto para instalar la app en la pantalla de inicio.
let installEvent = null;
window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault();
  installEvent = ev;
  const bar = document.createElement('div');
  bar.className = 'install';
  bar.innerHTML = `<span>Añade Zurifit a tu pantalla de inicio</span>
    <button type="button" data-install>Instalar</button><button type="button" data-dismiss aria-label="Cerrar">✕</button>`;
  document.body.appendChild(bar);
  bar.addEventListener('click', async e => {
    if (e.target.closest('[data-install]') && installEvent) { installEvent.prompt(); installEvent = null; bar.remove(); }
    if (e.target.closest('[data-dismiss]')) bar.remove();
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* sin conexión al registrar, da igual */ });
  });
}
