// Cronómetro de descanso: barra fija abajo, con anillo de progreso,
// sonido y vibración al terminar. Sobrevive a los repintados de vista.

import { beep, haptic, toast } from './fx.js';
import { note } from '../data/messages.js';
import { firstName, getState } from '../store.js';

let el = null;
let raf = null;
let endsAt = 0;
let total = 0;
let paused = false;
let pausedLeft = 0;
let label = '';

function ensure() {
  if (el) return el;
  el = document.createElement('div');
  el.id = 'rest-timer';
  el.className = 'rest';
  el.innerHTML = `
    <button class="rest__ring" type="button" data-act="toggle" aria-label="Pausar o reanudar">
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle class="rest__track" cx="22" cy="22" r="19"></circle>
        <circle class="rest__fill" cx="22" cy="22" r="19"></circle>
      </svg>
      <span class="rest__count">0:00</span>
    </button>
    <div class="rest__info">
      <strong class="rest__title">Descanso</strong>
      <span class="rest__label"></span>
    </div>
    <div class="rest__actions">
      <button type="button" class="rest__btn" data-act="minus">-15s</button>
      <button type="button" class="rest__btn" data-act="plus">+15s</button>
      <button type="button" class="rest__btn rest__btn--go" data-act="skip">Listo</button>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', ev => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (act === 'skip') stop();
    if (act === 'plus') { endsAt += 15000; total += 15; haptic(); }
    if (act === 'minus') { endsAt = Math.max(Date.now() + 1000, endsAt - 15000); haptic(); }
    if (act === 'toggle') togglePause();
  });
  return el;
}

function fmt(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function tick() {
  if (!el) return;
  const left = paused ? pausedLeft : (endsAt - Date.now()) / 1000;
  const pct = total ? Math.max(0, Math.min(1, left / total)) : 0;
  const circ = 2 * Math.PI * 19;
  el.querySelector('.rest__count').textContent = fmt(left);
  const fill = el.querySelector('.rest__fill');
  fill.style.strokeDasharray = `${circ}`;
  fill.style.strokeDashoffset = `${circ * (1 - pct)}`;
  el.classList.toggle('is-low', left <= 5 && left > 0);
  if (!paused && left <= 0) return finish();
  raf = requestAnimationFrame(tick);
}

function finish() {
  beep('end');
  haptic([60, 80, 60]);
  const seed = getState().sessions.length + Math.floor(Date.now() / 60000);
  toast(note('rest', firstName(), seed), { icon: '⏱️', duration: 3200 });
  stop();
}

export function start(seconds, text = '') {
  ensure();
  total = seconds;
  endsAt = Date.now() + seconds * 1000;
  paused = false;
  label = text;
  el.querySelector('.rest__label').textContent = text;
  el.classList.add('is-on');
  document.body.classList.add('has-rest');
  cancelAnimationFrame(raf);
  tick();
}

export function stop() {
  cancelAnimationFrame(raf);
  if (el) { el.classList.remove('is-on', 'is-low'); }
  document.body.classList.remove('has-rest');
  paused = false;
}

export function togglePause() {
  if (!el || !el.classList.contains('is-on')) return;
  if (paused) { endsAt = Date.now() + pausedLeft * 1000; paused = false; }
  else { pausedLeft = (endsAt - Date.now()) / 1000; paused = true; }
  el.classList.toggle('is-paused', paused);
  haptic();
}

export function isRunning() {
  return !!el && el.classList.contains('is-on');
}
