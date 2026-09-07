// Celebraciones: confeti, avisos, vibración y sonido.
import { getState } from '../store.js';

let audioCtx = null;
function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

export function beep(pattern = 'tick') {
  if (!getState().settings.sound) return;
  const ac = ctx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume();
  const notes = pattern === 'end'   ? [[880, 0], [1174, .14], [1568, .28]]
              : pattern === 'pr'    ? [[659, 0], [880, .1], [1318, .2], [1760, .32]]
              : pattern === 'done'  ? [[660, 0]]
              : [[440, 0]];
  notes.forEach(([freq, at]) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(0.22, ac.currentTime + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + 0.28);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + at);
    osc.stop(ac.currentTime + at + 0.3);
  });
}

export function haptic(pattern = [12]) {
  if (!getState().settings.vibrate) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ------------------------------------------------------------------ toast ---

export function toast(message, { icon = '💗', kind = 'info', duration = 3600 } = {}) {
  let host = document.getElementById('toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toasts';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.innerHTML = `<span class="toast__icon">${icon}</span><span class="toast__msg">${message}</span>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 400);
  }, duration);
}

// --------------------------------------------------------------- confeti ---

const COLORS = ['#E8869B', '#F6B6C8', '#8B7BE8', '#B9AEF5', '#F2A35E', '#5FC9A8', '#FFD79A'];

export function confetti({ count = 90, duration = 2600 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.width = innerWidth * dpr;
  const H = canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  const g = canvas.getContext('2d');

  const parts = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: -Math.random() * H * 0.4,
    r: (4 + Math.random() * 6) * dpr,
    vx: (Math.random() - 0.5) * 2.4 * dpr,
    vy: (2 + Math.random() * 3.4) * dpr,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.25,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.random() > 0.35 ? 'rect' : 'circle'
  }));

  const t0 = performance.now();
  (function frame(now) {
    const elapsed = now - t0;
    g.clearRect(0, 0, W, H);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.03 * dpr;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.fillStyle = p.color;
      g.globalAlpha = Math.max(0, 1 - elapsed / duration);
      if (p.shape === 'rect') g.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      else { g.beginPath(); g.arc(0, 0, p.r / 1.6, 0, Math.PI * 2); g.fill(); }
      g.restore();
    });
    if (elapsed < duration) requestAnimationFrame(frame);
    else canvas.remove();
  })(t0);
}

export function celebratePR(text) {
  confetti({ count: 60, duration: 1800 });
  haptic([18, 60, 18, 60, 30]);
  beep('pr');
  toast(text, { icon: '🥇', kind: 'pr', duration: 4200 });
}
