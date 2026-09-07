import { getState, firstName, programWeek, todayISO, weekKey, getActive, update } from '../store.js';
import { PROGRAM, cardioTarget, setsFor, weeklyCardioGoal } from '../data/program.js';
import { note } from '../data/messages.js';
import { esc } from '../lib/dom.js';
import * as S from '../stats.js';

function greeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'Qué horas, ';
  if (h < 13) return 'Buenos días, ';
  if (h < 21) return 'Buenas tardes, ';
  return 'Buenas noches, ';
}

function dailyNote(name) {
  const st = getState();
  const today = todayISO();
  if (st.meta.noteDate !== today) {
    update(s => {
      s.meta.noteDate = today;
      s.meta.noteSeed = Math.floor(Math.random() * 1000);
    });
  }
  return note('daily', name, getState().meta.noteSeed);
}

export default {
  render() {
    const st = getState();
    const name = firstName();
    const week = programWeek();
    const stats = S.globalStats();
    const active = getActive();
    const wk = S.currentWeekSummary();
    const doneThisWeek = st.sessions.filter(s => weekKey(s.date) === weekKey(todayISO()));
    const doneDayIds = doneThisWeek.map(s => s.dayId);
    const next = S.suggestedDay();
    const target = cardioTarget(next, week);
    const goal = weeklyCardioGoal(week);
    const mems = S.memories(2);
    const recent = [...st.sessions].reverse().slice(0, 3);

    return `
    <header class="topbar">
      <div>
        <p class="topbar__hi">${esc(greeting())}<strong>${esc(name)}</strong></p>
        <p class="topbar__sub">Semana ${week} del programa${week <= 2 ? ' · adaptación' : ''}</p>
      </div>
      <a class="avatar" href="#/ajustes" aria-label="Perfil y ajustes">
        <span>${esc(st.profile.emoji || '🌸')}</span>
      </a>
    </header>

    <section class="card card--level">
      <div class="level">
        <span class="level__emoji">${stats.level.emoji}</span>
        <div class="level__body">
          <p class="level__name">Nivel ${stats.level.index} · ${esc(stats.level.name)}</p>
          <div class="bar"><span class="bar__fill" style="width:${stats.level.pct.toFixed(0)}%"></span></div>
          <p class="level__hint">${stats.level.next
            ? `${S.fmtBig(stats.level.next - stats.level.xp)} puntos para <b>${esc(stats.level.nextName)}</b>`
            : 'Nivel máximo. Eres una leyenda.'}</p>
        </div>
      </div>
    </section>

    ${active ? `
    <a class="card card--resume" href="#/entreno/${esc(active.dayId)}">
      <div>
        <p class="eyebrow">Sesión en curso</p>
        <h2 class="card__title">Día ${active.dayNumber} · ${esc(active.title)}</h2>
        <p class="card__meta">${S.doneSets(active)} de ${S.plannedSets(active)} series hechas</p>
      </div>
      <span class="card__cta">Seguir →</span>
    </a>` : `
    <section class="card card--hero">
      <p class="eyebrow">${doneDayIds.length >= 4 ? 'Semana completada · extra' : 'Hoy te toca'}</p>
      <h2 class="hero__title"><span class="hero__emoji">${next.emoji}</span> Día ${next.number}</h2>
      <p class="hero__sub">${esc(next.title)}</p>
      <ul class="hero__facts">
        <li><b>${next.exercises.length}</b> ejercicios</li>
        <li><b>${next.exercises.reduce((t, e) => t + setsFor(e, week), 0)}</b> series</li>
        <li><b>${target[0] === target[1] ? target[0] : `${target[0]}-${target[1]}`}</b> min cardio</li>
      </ul>
      <a class="btn btn--primary btn--xl" href="#/entreno/${esc(next.id)}">Empezar entrenamiento</a>
      <p class="hero__note">${esc(next.duration)} aprox., calentamiento y cardio incluidos.</p>
    </section>`}

    <section class="card card--note">
      <span class="card--note__icon">💌</span>
      <p>${esc(dailyNote(name))}</p>
    </section>

    <section class="week">
      <h3 class="section-title">Esta semana</h3>
      <div class="week__days">
        ${PROGRAM.map(d => {
          const done = doneDayIds.filter(x => x === d.id).length;
          return `<a class="daychip${done ? ' is-done' : ''}" href="#/entreno/${d.id}">
            <span class="daychip__emoji">${done ? '✓' : d.emoji}</span>
            <span class="daychip__label">Día ${d.number}</span>
          </a>`;
        }).join('')}
      </div>
      <div class="week__meters">
        <div class="meter">
          <div class="meter__head"><span>Entrenos</span><b>${wk.sessions}/4</b></div>
          <div class="bar"><span class="bar__fill" style="width:${Math.min(100, wk.sessions / 4 * 100)}%"></span></div>
        </div>
        <div class="meter">
          <div class="meter__head"><span>Cardio</span><b>${wk.cardio}/${goal[0]}-${goal[1]} min</b></div>
          <div class="bar"><span class="bar__fill bar__fill--mint" style="width:${Math.min(100, wk.cardio / goal[0] * 100)}%"></span></div>
        </div>
      </div>
    </section>

    <section class="stats-grid">
      <div class="stat"><span class="stat__v">${stats.currentStreak}</span><span class="stat__l">semanas de racha</span></div>
      <div class="stat"><span class="stat__v">${stats.totalSessions}</span><span class="stat__l">entrenos</span></div>
      <div class="stat"><span class="stat__v">${S.fmtBig(stats.totalVolume)}</span><span class="stat__l">kg movidos</span></div>
      <div class="stat"><span class="stat__v">${stats.totalPRs}</span><span class="stat__l">récords</span></div>
    </section>

    ${mems.length ? `
    <section class="memories">
      <h3 class="section-title">Mira lo que has cambiado</h3>
      ${mems.map(m => `
        <div class="card card--memory">
          <span class="memory__badge">${esc(m.badge)}</span>
          <p>${m.text}</p>
        </div>`).join('')}
    </section>` : ''}

    ${recent.length ? `
    <section class="recent">
      <h3 class="section-title">Últimos entrenos <a class="link" href="#/progreso">ver todo</a></h3>
      ${recent.map(s => `
        <a class="row" href="#/sesion/${esc(s.id)}">
          <span class="row__emoji">${esc(PROGRAM.find(d => d.id === s.dayId)?.emoji || '💪')}</span>
          <span class="row__body">
            <b>Día ${s.dayNumber} · ${esc(s.title)}</b>
            <small>${esc(S.fmtDateLong(s.date))} · ${S.fmtBig(s.volume)} kg${s.prs?.length ? ` · ${s.prs.length} récord${s.prs.length > 1 ? 's' : ''}` : ''}</small>
          </span>
          <span class="row__chevron">›</span>
        </a>`).join('')}
    </section>` : `
    <section class="card card--empty">
      <p>Aquí irán apareciendo tus entrenos, tus récords y tus gráficas. Empieza cuando quieras: no hay prisa.</p>
    </section>`}`;
  }
};
