import { getState, update, firstName, deleteSession } from '../store.js';
import { EXERCISES } from '../data/exercises.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { note } from '../data/messages.js';
import { esc } from '../lib/dom.js';
import { confetti, haptic } from '../lib/fx.js';
import * as S from '../stats.js';

const FEELINGS = [
  { v: 1, e: '😵', l: 'Dura' },
  { v: 2, e: '😅', l: 'Justa' },
  { v: 3, e: '🙂', l: 'Bien' },
  { v: 4, e: '😄', l: 'Genial' },
  { v: 5, e: '🤩', l: 'Volando' }
];

export default {
  render(params) {
    const session = getState().sessions.find(s => s.id === params.id);
    if (!session) return '<div class="pad"><a class="back" href="#/inicio">← Inicio</a><p>No encuentro esa sesión.</p></div>';

    const fresh = JSON.parse(sessionStorage.getItem('zurifit.fresh') || '[]');
    const isFresh = sessionStorage.getItem('zurifit.freshId') !== session.id
      && Date.now() - new Date(session.finishedAt).getTime() < 60000;
    const stats = S.globalStats();
    const unlocked = ACHIEVEMENTS.filter(a => fresh.includes(a.id));

    return `
    <div class="pad summary${isFresh ? ' is-fresh' : ''}">
      <a class="back" href="#/inicio">← Inicio</a>

      <header class="summary__head">
        <span class="summary__emoji">${esc(session.emoji || '💪')}</span>
        <h1>${isFresh ? '¡Sesión terminada!' : `Día ${session.dayNumber} · ${esc(session.title)}`}</h1>
        <p>${esc(S.fmtDateLong(session.date))}</p>
      </header>

      ${isFresh ? `<p class="summary__love">${esc(note('finish', firstName(), session.durationSec))}</p>` : ''}

      <div class="stats-grid stats-grid--4">
        <div class="stat"><span class="stat__v">${S.fmtDuration(session.durationSec)}</span><span class="stat__l">duración</span></div>
        <div class="stat"><span class="stat__v">${S.fmtBig(session.volume)}</span><span class="stat__l">kg movidos</span></div>
        <div class="stat"><span class="stat__v">${S.doneSets(session)}</span><span class="stat__l">series</span></div>
        <div class="stat"><span class="stat__v">${session.cardio?.done ? session.cardio.minutes : 0}</span><span class="stat__l">min cardio</span></div>
      </div>

      ${session.prs?.length ? `
      <section class="card card--prs">
        <h3 class="section-title">🥇 Récords de hoy</h3>
        <ul class="prlist">
          ${session.prs.map(p => `<li>${esc(S.prLabel(p.exerciseId, p))}</li>`).join('')}
        </ul>
        <p class="card__meta">Esto no lo movías antes. Está en los datos.</p>
      </section>` : ''}

      ${unlocked.length && isFresh ? `
      <section class="card card--ach">
        <h3 class="section-title">🎉 Logros desbloqueados</h3>
        <div class="ach-row">
          ${unlocked.map(a => `<div class="ach-mini"><span>${a.emoji}</span><b>${esc(a.name)}</b></div>`).join('')}
        </div>
      </section>` : ''}

      <section class="card">
        <h3 class="section-title">¿Cómo te has sentido?</h3>
        <div class="feelings" data-feel>
          ${FEELINGS.map(f => `<button type="button" class="feel${session.feeling === f.v ? ' is-on' : ''}"
            data-v="${f.v}"><span>${f.e}</span><small>${f.l}</small></button>`).join('')}
        </div>
      </section>

      <section class="card">
        <h3 class="section-title">Lo que has hecho</h3>
        <ul class="donelist">
          ${session.exercises.map(ex => {
            const m = EXERCISES[ex.id];
            const u = m.unit === 'time' ? 's' : '';
            return `<li>
              <b>${esc(m.short)}</b>
              <span>${ex.sets.map(s => m.noWeight ? `${s.r}${u}` : `${s.r}×${S.fmtKg(s.w)}kg`).join(' · ')}</span>
              ${ex.note ? `<em>📝 ${esc(ex.note)}</em>` : ''}
            </li>`;
          }).join('')}
          ${session.cardio?.done ? `<li><b>Cardio</b><span>${session.cardio.minutes} min · ${esc(session.cardio.label)}</span></li>` : ''}
        </ul>
      </section>

      <section class="card card--level">
        <div class="level">
          <span class="level__emoji">${stats.level.emoji}</span>
          <div class="level__body">
            <p class="level__name">Nivel ${stats.level.index} · ${esc(stats.level.name)}</p>
            <div class="bar"><span class="bar__fill" style="width:${stats.level.pct.toFixed(0)}%"></span></div>
            <p class="level__hint">${stats.totalSessions} entrenos · ${stats.currentStreak} semanas de racha</p>
          </div>
        </div>
      </section>

      <a class="btn btn--primary btn--xl" href="#/inicio">Volver al inicio</a>
      <button class="btn btn--ghost" type="button" data-act="del">Borrar esta sesión</button>
    </div>`;
  },

  mounted(root, params, ctx) {
    const session = getState().sessions.find(s => s.id === params.id);
    if (!session) return;

    if (root.querySelector('.is-fresh')) {
      confetti({ count: 120, duration: 3200 });
      haptic([20, 60, 20, 60, 40]);
      sessionStorage.setItem('zurifit.freshId', session.id);
    }

    root.querySelector('[data-feel]')?.addEventListener('click', ev => {
      const btn = ev.target.closest('[data-v]');
      if (!btn) return;
      const v = Number(btn.dataset.v);
      update(s => {
        const target = s.sessions.find(x => x.id === params.id);
        if (target) target.feeling = target.feeling === v ? null : v;
      });
      haptic();
      ctx.rerender();
    });

    root.querySelector('[data-act="del"]')?.addEventListener('click', () => {
      if (confirm('¿Borrar esta sesión del historial? No se puede deshacer.')) {
        deleteSession(params.id);
        location.hash = '#/progreso';
      }
    });
  }
};
