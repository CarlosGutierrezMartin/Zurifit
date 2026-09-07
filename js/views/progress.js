import { getState, parseISO } from '../store.js';
import { EXERCISES, GROUPS } from '../data/exercises.js';
import { PROGRAM } from '../data/program.js';
import { esc } from '../lib/dom.js';
import { lineChart, barChart } from '../lib/charts.js';
import * as S from '../stats.js';

let tab = 'resumen';
let exId = null;
let metric = 'peso';

function weekLabel(iso) {
  const d = parseISO(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function resumen() {
  const stats = S.globalStats();
  const weeks = stats.weeks.slice(-8);
  const records = S.allRecords();

  if (!getState().sessions.length) {
    return `<div class="card card--empty">
      <p>Todavía no hay nada que enseñar aquí, pero en cuanto termines tu primer entrenamiento esto se llena de gráficas. Prometido.</p>
      <a class="btn btn--primary" href="#/inicio">Ir a entrenar</a>
    </div>`;
  }

  return `
  <div class="stats-grid stats-grid--4">
    <div class="stat"><span class="stat__v">${stats.totalSessions}</span><span class="stat__l">entrenos</span></div>
    <div class="stat"><span class="stat__v">${S.fmtBig(stats.totalVolume)}</span><span class="stat__l">kg movidos</span></div>
    <div class="stat"><span class="stat__v">${stats.totalPRs}</span><span class="stat__l">récords</span></div>
    <div class="stat"><span class="stat__v">${S.fmtDuration(stats.totalMinutes * 60)}</span><span class="stat__l">entrenando</span></div>
  </div>

  <section class="card">
    <h3 class="section-title">Peso total movido por semana</h3>
    ${barChart(weeks.map(w => ({ label: weekLabel(w.week), y: Math.round(w.volume) })), { unit: 'kg' })}
    <p class="card__meta">Cada barra es una semana. Subir un poco cada semana ya es progresar.</p>
  </section>

  <section class="card">
    <h3 class="section-title">Cardio por semana</h3>
    ${barChart(weeks.map(w => ({ label: weekLabel(w.week), y: w.cardio })), {
      unit: 'min', color: 'var(--peach)', goal: weeks.length ? weeks[weeks.length - 1].goal : null })}
    <p class="card__meta">Las barras verdes son semanas en las que llegaste al objetivo. Si un día haces menos, no pasa nada.</p>
  </section>

  <section class="card">
    <h3 class="section-title">Entrenos por semana</h3>
    ${barChart(weeks.map(w => ({ label: weekLabel(w.week), y: w.sessions })), { unit: '', color: 'var(--lav)', goal: [4, 4] })}
  </section>

  <section class="card">
    <h3 class="section-title">🏅 Tus récords</h3>
    ${records.length ? `<table class="table">
      <thead><tr><th>Ejercicio</th><th>Máximo</th><th>Veces</th></tr></thead>
      <tbody>
        ${records.map(r => {
          const m = EXERCISES[r.id];
          const best = m.noWeight
            ? `${r.maxReps} ${m.unit === 'time' ? 's' : 'reps'}`
            : `${S.fmtKg(r.topWeight)} kg × ${r.repsAtTop || '-'}`;
          return `<tr><td><button class="linkbtn" data-goex="${esc(r.id)}">${esc(m.short)}</button></td>
            <td><b>${best}</b></td><td>${r.sessions}</td></tr>`;
        }).join('')}
      </tbody></table>` : '<p class="chart-empty">Aún no hay récords.</p>'}
  </section>`;
}

function ejercicios() {
  const withHistory = Object.keys(EXERCISES)
    .map(id => ({ id, n: S.historyFor(id).length }))
    .filter(x => x.n > 0);

  if (!withHistory.length) {
    return '<div class="card card--empty"><p>Cuando registres ejercicios, aquí verás la evolución de cada uno.</p></div>';
  }
  const current = exId && withHistory.some(x => x.id === exId) ? exId : withHistory[0].id;
  const h = S.historyFor(current);
  const m = EXERCISES[current];
  const rec = S.recordsFor(current);
  const points = h.map(e => ({
    label: S.fmtDate(e.date),
    y: metric === 'volumen' ? Math.round(e.volume)
      : m.noWeight ? e.maxReps
      : metric === 'estimado' ? Math.round(S.estimate1RM(e.bestSet.w, e.bestSet.r))
      : e.topWeight
  }));
  const unit = metric === 'volumen' ? 'kg totales' : m.noWeight ? (m.unit === 'time' ? 's' : 'reps') : 'kg';

  return `
  <div class="select-wrap">
    <select class="select" id="ex-select" aria-label="Elige un ejercicio">
      ${Object.entries(GROUPS).map(([g, label]) => {
        const items = withHistory.filter(x => EXERCISES[x.id].group === g);
        if (!items.length) return '';
        return `<optgroup label="${esc(label)}">${items.map(x =>
          `<option value="${esc(x.id)}"${x.id === current ? ' selected' : ''}>${esc(EXERCISES[x.id].short)} (${x.n})</option>`).join('')}</optgroup>`;
      }).join('')}
    </select>
  </div>

  <div class="tabs tabs--sub" role="tablist">
    ${[['peso', m.noWeight ? 'Repeticiones' : 'Peso máximo'], ['volumen', 'Volumen'],
       ...(m.noWeight ? [] : [['estimado', 'Fuerza est.']])]
      .map(([k, l]) => `<button class="tab${metric === k ? ' is-on' : ''}" data-metric="${k}">${l}</button>`).join('')}
  </div>

  <section class="card">
    <h3 class="section-title">${esc(m.name)}</h3>
    ${lineChart(points, { unit, id: current, color: metric === 'volumen' ? 'var(--rose)' : 'var(--lav)' })}
    <div class="mini-stats">
      ${m.noWeight
        ? `<div><b>${rec.maxReps}</b><span>mejor marca</span></div>`
        : `<div><b>${S.fmtKg(rec.topWeight)} kg</b><span>peso máximo</span></div>
           <div><b>${S.fmtKg(rec.best1rm)} kg</b><span>fuerza estimada</span></div>`}
      <div><b>${h.length}</b><span>veces hecho</span></div>
      <div><b>${S.fmtBig(rec.bestVolume)}</b><span>mejor volumen</span></div>
    </div>
    ${metric === 'estimado' ? '<p class="card__meta">La fuerza estimada es un cálculo teórico (fórmula de Epley) a partir del peso y las repeticiones. Sirve para comparar contigo misma, no para intentar levantarlo.</p>' : ''}
  </section>

  <section class="card">
    <h3 class="section-title">Historial de ${esc(m.short)}</h3>
    <ul class="donelist">
      ${[...h].reverse().map(e => `<li>
        <b>${esc(S.fmtDate(e.date))}</b>
        <span>${e.sets.map(s => m.noWeight ? `${s.r}${m.unit === 'time' ? 's' : ''}` : `${s.r}×${S.fmtKg(s.w)}kg`).join(' · ')}</span>
        ${e.note ? `<em>📝 ${esc(e.note)}</em>` : ''}
      </li>`).join('')}
    </ul>
  </section>`;
}

function historial() {
  const sessions = [...getState().sessions].reverse();
  if (!sessions.length) return '<div class="card card--empty"><p>Sin entrenos todavía.</p></div>';
  const byMonth = new Map();
  sessions.forEach(s => {
    const d = parseISO(s.date);
    const k = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(s);
  });
  return [...byMonth.entries()].map(([month, list]) => `
    <section class="month">
      <h3 class="section-title">${esc(month)} <span class="muted">${list.length} entrenos</span></h3>
      ${list.map(s => `
        <a class="row" href="#/sesion/${esc(s.id)}">
          <span class="row__emoji">${esc(PROGRAM.find(d => d.id === s.dayId)?.emoji || '💪')}</span>
          <span class="row__body">
            <b>Día ${s.dayNumber} · ${esc(s.title)}</b>
            <small>${esc(S.fmtDateLong(s.date))} · ${S.fmtBig(s.volume)} kg · ${S.fmtDuration(s.durationSec)}${s.prs?.length ? ` · 🥇${s.prs.length}` : ''}</small>
          </span>
          <span class="row__chevron">›</span>
        </a>`).join('')}
    </section>`).join('');
}

export default {
  render() {
    return `
    <header class="topbar topbar--simple"><h1>Progreso</h1></header>
    <div class="tabs" role="tablist">
      ${[['resumen', 'Resumen'], ['ejercicios', 'Ejercicios'], ['historial', 'Historial']]
        .map(([k, l]) => `<button class="tab${tab === k ? ' is-on' : ''}" data-tab="${k}" role="tab"
          aria-selected="${tab === k}">${l}</button>`).join('')}
    </div>
    <div class="pad pad--flush" id="progress-body">
      ${tab === 'resumen' ? resumen() : tab === 'ejercicios' ? ejercicios() : historial()}
    </div>`;
  },

  mounted(root, params, ctx) {
    root.addEventListener('click', ev => {
      const t = ev.target.closest('[data-tab]');
      if (t) { tab = t.dataset.tab; ctx.rerender(); return; }
      const mt = ev.target.closest('[data-metric]');
      if (mt) { metric = mt.dataset.metric; ctx.rerender(); return; }
      const go = ev.target.closest('[data-goex]');
      if (go) { exId = go.dataset.goex; tab = 'ejercicios'; metric = 'peso'; ctx.rerender(); }
    });
    root.querySelector('#ex-select')?.addEventListener('change', ev => {
      exId = ev.target.value;
      metric = 'peso';
      ctx.rerender();
    });
  }
};
