// Gráficas en SVG puro: sin librerías, funcionan sin conexión.

import { esc } from './dom.js';

const W = 320, H = 170, PAD_L = 34, PAD_R = 12, PAD_T = 16, PAD_B = 26;

function scale(values, height) {
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || Math.max(max * 0.2, 1);
  const lo = Math.max(0, min - span * 0.25);
  const hi = max + span * 0.25;
  return {
    lo, hi,
    y: v => PAD_T + (height - PAD_T - PAD_B) * (1 - (v - lo) / (hi - lo || 1))
  };
}

export function lineChart(points, { unit = 'kg', color = 'var(--lav)', id = 'c' } = {}) {
  if (!points || points.length === 0) {
    return `<p class="chart-empty">Aún no hay datos suficientes. Registra un par de sesiones y aquí aparecerá tu progreso.</p>`;
  }
  if (points.length === 1) {
    const p = points[0];
    return `<div class="chart-single"><span class="chart-single__v">${esc(p.y)} ${esc(unit)}</span>
      <span class="chart-single__l">${esc(p.label)} · a partir de la segunda sesión verás la curva</span></div>`;
  }
  const values = points.map(p => p.y);
  const s = scale(values, H);
  const stepX = (W - PAD_L - PAD_R) / (points.length - 1);
  const xy = points.map((p, i) => [PAD_L + i * stepX, s.y(p.y)]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)},${H - PAD_B} L${PAD_L},${H - PAD_B} Z`;
  const gid = `grad-${id}`;
  const ticks = [s.hi, (s.hi + s.lo) / 2, s.lo];

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Evolución de ${esc(unit)}: de ${esc(points[0].y)} a ${esc(points[points.length - 1].y)}">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${ticks.map(t => `<line class="chart__grid" x1="${PAD_L}" x2="${W - PAD_R}" y1="${s.y(t).toFixed(1)}" y2="${s.y(t).toFixed(1)}"/>
       <text class="chart__tick" x="${PAD_L - 6}" y="${(s.y(t) + 3).toFixed(1)}" text-anchor="end">${Math.round(t)}</text>`).join('')}
    <path d="${area}" fill="url(#${gid})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${xy.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === xy.length - 1 ? 4.2 : 2.6}"
        fill="${i === xy.length - 1 ? color : 'var(--surface)'}" stroke="${color}" stroke-width="2"/>`).join('')}
    <text class="chart__x" x="${PAD_L}" y="${H - 8}">${esc(points[0].label)}</text>
    <text class="chart__x" x="${W - PAD_R}" y="${H - 8}" text-anchor="end">${esc(points[points.length - 1].label)}</text>
  </svg>`;
}

export function barChart(bars, { unit = '', color = 'var(--rose)', goal = null } = {}) {
  if (!bars || !bars.length) {
    return `<p class="chart-empty">Todavía no hay semanas registradas.</p>`;
  }
  const values = bars.map(b => b.y);
  const max = Math.max(...values, goal ? goal[1] : 0, 1);
  const inner = H - PAD_T - PAD_B;
  const slot = (W - PAD_L - PAD_R) / bars.length;
  const bw = Math.min(26, slot * 0.62);

  const goalLine = goal ? `
    <line class="chart__goal" x1="${PAD_L}" x2="${W - PAD_R}"
      y1="${(PAD_T + inner * (1 - goal[0] / max)).toFixed(1)}"
      y2="${(PAD_T + inner * (1 - goal[0] / max)).toFixed(1)}"/>
    <text class="chart__tick" x="${W - PAD_R}" y="${(PAD_T + inner * (1 - goal[0] / max) - 4).toFixed(1)}"
      text-anchor="end">objetivo ${goal[0]}</text>` : '';

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Resumen por semanas">
    <line class="chart__grid" x1="${PAD_L}" x2="${W - PAD_R}" y1="${H - PAD_B}" y2="${H - PAD_B}"/>
    <text class="chart__tick" x="${PAD_L - 6}" y="${PAD_T + 4}" text-anchor="end">${Math.round(max)}</text>
    ${goalLine}
    ${bars.map((b, i) => {
      const h = Math.max(2, inner * (b.y / max));
      const x = PAD_L + slot * i + (slot - bw) / 2;
      const y = PAD_T + inner - h;
      const hit = goal && b.y >= goal[0];
      return `<rect class="chart__bar${hit ? ' is-hit' : ''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}"
          width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="${hit ? 'var(--mint)' : color}"/>
        <text class="chart__x" x="${(x + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(b.label)}</text>`;
    }).join('')}
  </svg>`;
}
