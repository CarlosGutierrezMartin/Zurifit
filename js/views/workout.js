import { dayById, setsFor, cardioTarget } from '../data/program.js';
import { EXERCISES, CHECKLIST } from '../data/exercises.js';
import { note } from '../data/messages.js';
import { evaluate } from '../data/achievements.js';
import { getActive, startSession, touchActive, discardActive, finishSession,
         programWeek, todayISO, uid, firstName, getState, unlockAchievements } from '../store.js';
import { esc } from '../lib/dom.js';
import * as timer from '../lib/timer.js';
import { celebratePR, toast, haptic, beep } from '../lib/fx.js';
import * as S from '../stats.js';

let wakeLock = null;
let clockId = null;

// ------------------------------------------------------------- construir ---

function buildSession(day, week) {
  return {
    id: uid(),
    dayId: day.id,
    dayNumber: day.number,
    title: day.title,
    emoji: day.emoji,
    week,
    date: todayISO(),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    durationSec: 0,
    exercises: day.exercises.map(e => {
      const sug = S.suggestion(e.id, e, week);
      return {
        id: e.id,
        baseId: e.id,
        altOf: e.altOf || null,
        target: e.reps,
        rest: e.rest,
        optional: !!e.optional,
        skipped: false,
        note: '',
        sets: Array.from({ length: setsFor(e, week) }, () => ({
          w: sug.weight ?? '', r: sug.reps ?? '', done: false, rir: null
        }))
      };
    }),
    cardio: {
      minutes: cardioTarget(day, week)[0],
      label: day.cardio.label,
      done: false
    },
    prs: []
  };
}

async function keepAwake() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch { /* el navegador puede negarlo, no pasa nada */ }
}
function releaseAwake() {
  try { wakeLock?.release(); } catch {}
  wakeLock = null;
}

// -------------------------------------------------------------- récords ---

function sessionBest(sessionEx) {
  const done = sessionEx.sets.filter(s => s.done && s.r);
  if (!done.length) return null;
  const topWeight = Math.max(...done.map(s => Number(s.w) || 0));
  return {
    topWeight,
    repsAtTop: Math.max(...done.filter(s => (Number(s.w) || 0) === topWeight).map(s => Number(s.r) || 0), 0),
    maxReps: Math.max(...done.map(s => Number(s.r) || 0))
  };
}

// ------------------------------------------------------------- plantillas ---

function setRow(ex, set, i, showRir) {
  const meta = EXERCISES[ex.id];
  const unit = meta.unit === 'time' ? 's' : 'reps';
  return `
  <div class="setrow${set.done ? ' is-done' : ''}" data-set="${i}">
    <span class="setrow__n">${i + 1}</span>
    ${meta.noWeight ? '<span class="setrow__nw">—</span>' : `
    <label class="setrow__field">
      <input class="setrow__input" type="number" inputmode="decimal" step="0.5" min="0"
             data-field="w" value="${set.w === '' ? '' : esc(set.w)}" placeholder="0"
             aria-label="Peso en kilos, serie ${i + 1}">
      <span class="setrow__unit">kg</span>
    </label>`}
    <label class="setrow__field">
      <input class="setrow__input" type="number" inputmode="numeric" step="1" min="0"
             data-field="r" value="${set.r === '' ? '' : esc(set.r)}" placeholder="0"
             aria-label="${unit === 's' ? 'Segundos' : 'Repeticiones'}, serie ${i + 1}">
      <span class="setrow__unit">${unit}</span>
    </label>
    <button class="setrow__check" type="button" data-act="toggle-set"
            aria-pressed="${set.done}" aria-label="Marcar serie ${i + 1} como hecha">✓</button>
    ${showRir && set.done ? `
    <div class="rir" role="group" aria-label="Repeticiones en reserva">
      <span class="rir__label">¿Te quedaban?</span>
      ${[0, 1, 2, 3].map(v => `<button type="button" class="rir__chip${set.rir === v ? ' is-on' : ''}"
        data-act="rir" data-rir="${v}">${v === 3 ? '3+' : v}</button>`).join('')}
    </div>` : ''}
  </div>`;
}

function exerciseCard(ex, idx, week) {
  const meta = EXERCISES[ex.id];
  const day = dayById(getActive().dayId);
  const progEx = day.exercises[idx];
  const sug = S.suggestion(ex.id, { ...progEx, reps: ex.target, sets: ex.sets.length }, week);
  const last = S.lastPerformance(ex.id);
  const doneCount = ex.sets.filter(s => s.done).length;
  const unit = meta.unit === 'time' ? 's' : 'reps';
  const showRir = getState().settings.showRir;

  return `
  <article class="exercise${doneCount === ex.sets.length ? ' is-complete' : ''}${ex.skipped ? ' is-skipped' : ''}"
           data-ex="${idx}" id="ex-${idx}">
    <header class="exercise__head">
      <div class="exercise__title">
        <h3>${esc(meta.name)}</h3>
        <p class="exercise__tag">${esc(meta.tag)} · ${ex.sets.length} × ${ex.target[0]}${ex.target[1] !== ex.target[0] ? `-${ex.target[1]}` : ''} ${unit}${meta.perSide ? ' por lado' : ''}</p>
      </div>
      <div class="exercise__badges">
        <span class="pill">${doneCount}/${ex.sets.length}</span>
        <button class="iconbtn" type="button" data-act="info" aria-label="Ver ficha del ejercicio">?</button>
      </div>
    </header>

    ${ex.skipped ? '<p class="exercise__skipped">Ejercicio saltado hoy. No pasa nada.</p>' : `
    <p class="exercise__sug ${sug.level === 'sube' ? 'is-up' : ''}">
      ${sug.level === 'sube' ? '⬆️ ' : sug.level === 'nuevo' ? '✨ ' : '📌 '}${esc(sug.text)}
    </p>

    <div class="sets">
      ${ex.sets.map((s, i) => setRow(ex, s, i, showRir)).join('')}
    </div>

    <div class="exercise__foot">
      <button class="chipbtn" type="button" data-act="add-set">+ serie</button>
      ${ex.sets.length > 1 ? '<button class="chipbtn" type="button" data-act="del-set">− serie</button>' : ''}
      ${ex.altOf ? `<button class="chipbtn" type="button" data-act="swap">↔ ${esc(EXERCISES[ex.altOf].short)}</button>` : ''}
      ${ex.baseId !== ex.id ? `<button class="chipbtn" type="button" data-act="swap">↔ ${esc(EXERCISES[ex.baseId].short)}</button>` : ''}
      <button class="chipbtn" type="button" data-act="note">📝 nota</button>
      ${ex.optional ? '<button class="chipbtn" type="button" data-act="skip">saltar</button>' : ''}
      <span class="exercise__rest">descanso ${ex.rest}s</span>
    </div>

    ${ex.note ? `<p class="exercise__note">📝 ${esc(ex.note)}</p>` : ''}
    ${last ? `<p class="exercise__last">Última vez (${esc(S.fmtDate(last.date))}): ${last.sets.map(s =>
        meta.noWeight ? `${s.r}${unit === 's' ? 's' : ''}` : `${s.r}×${S.fmtKg(s.w)}kg`).join(' · ')}</p>` : ''}
    `}
  </article>`;
}

function cardioCard(session, week) {
  const day = dayById(session.dayId);
  const t = cardioTarget(day, week);
  return `
  <article class="exercise exercise--cardio${session.cardio.done ? ' is-complete' : ''}" id="cardio">
    <header class="exercise__head">
      <div class="exercise__title">
        <h3>Cardio · ${esc(day.cardio.label)}</h3>
        <p class="exercise__tag">${t[0] === t[1] ? `${t[0]}` : `${t[0]}-${t[1]}`} min · ${esc(day.cardio.intensity)}</p>
      </div>
      <button class="iconbtn" type="button" data-act="info-cardio" aria-label="Ver ficha del cardio">?</button>
    </header>
    <p class="exercise__sug">🚶‍♀️ ${esc(day.cardio.note)} Si puedes hablar en frases, la intensidad es la correcta.</p>
    <div class="cardio">
      <button class="stepper" type="button" data-act="cardio-minus" aria-label="Quitar 5 minutos">−</button>
      <div class="cardio__value"><b id="cardio-min">${session.cardio.minutes}</b><span>min</span></div>
      <button class="stepper" type="button" data-act="cardio-plus" aria-label="Añadir 5 minutos">+</button>
      <button class="btn btn--soft" type="button" data-act="cardio-done">
        ${session.cardio.done ? '✓ Cardio hecho' : 'Marcar cardio'}
      </button>
    </div>
  </article>`;
}

// ------------------------------------------------------------------ vista ---

export default {
  render(params) {
    const day = dayById(params.id);
    if (!day) return '<p class="pad">Ese día no existe.</p>';
    const week = programWeek();
    const active = getActive();

    if (active && active.dayId !== day.id) {
      return `
      <div class="pad">
        <a class="back" href="#/inicio">← Inicio</a>
        <div class="card">
          <h2 class="card__title">Tienes otra sesión a medias</h2>
          <p>Estás en mitad del <b>Día ${active.dayNumber} · ${esc(active.title)}</b>.</p>
          <div class="btn-row">
            <a class="btn btn--primary" href="#/entreno/${esc(active.dayId)}">Seguir con esa</a>
            <button class="btn btn--ghost" data-act="discard-other" type="button">Descartarla y empezar el Día ${day.number}</button>
          </div>
        </div>
      </div>`;
    }

    if (!active) return this.preview(day, week);
    return this.live(active, week);
  },

  preview(day, week) {
    const target = cardioTarget(day, week);
    return `
    <div class="pad">
      <a class="back" href="#/inicio">← Inicio</a>
      <header class="dayhead">
        <span class="dayhead__emoji">${day.emoji}</span>
        <h1>Día ${day.number}</h1>
        <p>${esc(day.title)}</p>
        <p class="dayhead__meta">${esc(day.duration)} · semana ${week}${week <= 2 ? ' (2 series por ejercicio)' : ''}</p>
      </header>

      <ol class="plan">
        ${day.exercises.map(e => {
          const m = EXERCISES[e.id];
          const u = m.unit === 'time' ? 's' : 'reps';
          return `<li class="plan__item">
            <span class="plan__name">${esc(m.name)}${e.optional ? ' <i>(opcional)</i>' : ''}</span>
            <span class="plan__scheme">${setsFor(e, week)} × ${e.reps[0]}${e.reps[1] !== e.reps[0] ? `-${e.reps[1]}` : ''} ${u}${m.perSide ? '/lado' : ''}</span>
          </li>`;
        }).join('')}
        <li class="plan__item plan__item--cardio">
          <span class="plan__name">Cardio · ${esc(day.cardio.label)}</span>
          <span class="plan__scheme">${target[0] === target[1] ? target[0] : `${target[0]}-${target[1]}`} min</span>
        </li>
      </ol>

      <details class="checklist">
        <summary>Checklist rápido antes de cada serie</summary>
        <ul>${CHECKLIST.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      </details>

      <button class="btn btn--primary btn--xl" type="button" data-act="start">Empezar entrenamiento</button>
      <p class="hint">Calienta 5-7 minutos caminando o en bici y haz una primera serie muy ligera.</p>
    </div>`;
  },

  live(session, week) {
    const done = S.doneSets(session);
    const total = S.plannedSets(session);
    return `
    <div class="workout">
      <header class="wtop">
        <button class="wtop__back" type="button" data-act="leave" aria-label="Volver al inicio">←</button>
        <div class="wtop__mid">
          <p class="wtop__title">Día ${session.dayNumber} · ${esc(session.title)}</p>
          <p class="wtop__meta"><span id="w-clock">0:00</span> · ${S.fmtBig(S.sessionVolume(session))} kg</p>
        </div>
        <button class="wtop__finish" type="button" data-act="finish">Terminar</button>
      </header>
      <div class="wprogress"><span id="w-bar" class="wprogress__fill" style="width:${total ? done / total * 100 : 0}%"></span></div>

      <div class="pad pad--top">
        <div id="ex-list">
          ${session.exercises.map((ex, i) => exerciseCard(ex, i, week)).join('')}
        </div>
        ${cardioCard(session, week)}
        <button class="btn btn--primary btn--xl" type="button" data-act="finish">Terminar entrenamiento</button>
        <button class="btn btn--ghost" type="button" data-act="cancel">Descartar esta sesión</button>
      </div>
    </div>`;
  },

  mounted(root, params, ctx) {
    const day = dayById(params.id);
    const week = programWeek();

    // --- pantalla previa / conflicto ---
    root.querySelector('[data-act="start"]')?.addEventListener('click', () => {
      startSession(buildSession(day, week));
      keepAwake();
      haptic([10, 40, 10]);
      toast(note('start', firstName(), Date.now() / 1000), { icon: '💪', duration: 4000 });
      ctx.rerender();
    });
    root.querySelector('[data-act="discard-other"]')?.addEventListener('click', () => {
      discardActive();
      ctx.rerender();
    });

    const session = getActive();
    if (!session || session.dayId !== day.id) return;
    keepAwake();

    // --- reloj de sesión ---
    const clock = root.querySelector('#w-clock');
    const tickClock = () => {
      if (!clock || !document.body.contains(clock)) return clearInterval(clockId);
      const sec = Math.floor((Date.now() - new Date(session.startedAt)) / 1000);
      clock.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
    };
    clearInterval(clockId);
    clockId = setInterval(tickClock, 1000);
    tickClock();

    const refreshHeader = () => {
      const s = getActive();
      const done = S.doneSets(s), total = S.plannedSets(s);
      const bar = root.querySelector('#w-bar');
      if (bar) bar.style.width = `${total ? done / total * 100 : 0}%`;
      const meta = root.querySelector('.wtop__meta');
      if (meta) meta.innerHTML = `<span id="w-clock">${clock ? clock.textContent : '0:00'}</span> · ${S.fmtBig(S.sessionVolume(s))} kg`;
    };

    const rerenderExercise = idx => {
      const card = root.querySelector(`#ex-${idx}`);
      if (!card) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = exerciseCard(getActive().exercises[idx], idx, week);
      card.replaceWith(tmp.firstElementChild);
    };

    // --- entradas de peso / repeticiones ---
    root.addEventListener('input', ev => {
      const input = ev.target.closest('.setrow__input');
      if (!input) return;
      const idx = Number(input.closest('[data-ex]').dataset.ex);
      const si = Number(input.closest('[data-set]').dataset.set);
      const field = input.dataset.field;
      touchActive(s => {
        s.exercises[idx].sets[si][field] = input.value === '' ? '' : Number(input.value);
      });
      refreshHeader();
    });

    // --- clics dentro de los ejercicios ---
    root.addEventListener('click', ev => {
      const btn = ev.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      const exEl = btn.closest('[data-ex]');
      const idx = exEl ? Number(exEl.dataset.ex) : -1;

      if (act === 'toggle-set') {
        const si = Number(btn.closest('[data-set]').dataset.set);
        toggleSet(idx, si);
        return;
      }
      if (act === 'rir') {
        const si = Number(btn.closest('[data-set]').dataset.set);
        const v = Number(btn.dataset.rir);
        touchActive(s => { s.exercises[idx].sets[si].rir = s.exercises[idx].sets[si].rir === v ? null : v; });
        rerenderExercise(idx);
        haptic();
        return;
      }
      if (act === 'add-set') {
        touchActive(s => {
          const ex = s.exercises[idx];
          const lastSet = ex.sets[ex.sets.length - 1];
          ex.sets.push({ w: lastSet?.w ?? '', r: lastSet?.r ?? '', done: false, rir: null });
        });
        rerenderExercise(idx); refreshHeader(); return;
      }
      if (act === 'del-set') {
        touchActive(s => { if (s.exercises[idx].sets.length > 1) s.exercises[idx].sets.pop(); });
        rerenderExercise(idx); refreshHeader(); return;
      }
      if (act === 'swap') {
        touchActive(s => {
          const ex = s.exercises[idx];
          ex.id = ex.id === ex.baseId ? ex.altOf : ex.baseId;
        });
        rerenderExercise(idx); haptic(); return;
      }
      if (act === 'skip') {
        touchActive(s => { s.exercises[idx].skipped = !s.exercises[idx].skipped; });
        rerenderExercise(idx); refreshHeader(); return;
      }
      if (act === 'note') {
        const cur = getActive().exercises[idx].note || '';
        const val = prompt('Nota para este ejercicio (altura del asiento, sensaciones, número de máquina...)', cur);
        if (val !== null) { touchActive(s => { s.exercises[idx].note = val.trim(); }); rerenderExercise(idx); }
        return;
      }
      if (act === 'info') { ctx.openSheet(getActive().exercises[idx].id); return; }
      if (act === 'info-cardio') { ctx.openSheet('cardio-cinta'); return; }

      if (act === 'cardio-minus' || act === 'cardio-plus') {
        touchActive(s => {
          s.cardio.minutes = Math.max(0, s.cardio.minutes + (act === 'cardio-plus' ? 5 : -5));
        });
        root.querySelector('#cardio-min').textContent = getActive().cardio.minutes;
        haptic(); return;
      }
      if (act === 'cardio-done') {
        touchActive(s => { s.cardio.done = !s.cardio.done; });
        const card = root.querySelector('#cardio');
        const tmp = document.createElement('div');
        tmp.innerHTML = cardioCard(getActive(), week);
        card.replaceWith(tmp.firstElementChild);
        haptic([10, 30, 10]);
        beep('done');
        return;
      }
      if (act === 'leave') { location.hash = '#/inicio'; return; }
      if (act === 'cancel') {
        if (confirm('¿Seguro que quieres descartar esta sesión? Se perderá lo apuntado hoy.')) {
          discardActive(); timer.stop(); releaseAwake(); location.hash = '#/inicio';
        }
        return;
      }
      if (act === 'finish') { finish(ctx); return; }
    });

    function toggleSet(idx, si) {
      const before = getActive().exercises[idx].sets[si].done;
      let pr = null;
      touchActive(s => {
        const ex = s.exercises[idx];
        const set = ex.sets[si];
        set.done = !before;
        if (set.done) {
          if (set.r === '' || set.r === null) set.r = ex.target[0];
          if (set.w === '' && !EXERCISES[ex.id].noWeight) set.w = 0;
          const baseline = S.recordsFor(ex.id);
          const alreadyDone = { ...ex, sets: ex.sets.filter((x, i) => x.done && i !== si) };
          pr = S.checkPR(ex.id, set, baseline, sessionBest(alreadyDone));
          if (pr) s.prs.push({ exerciseId: ex.id, ...pr, at: new Date().toISOString() });
          // El peso de la serie recién hecha se propone para las siguientes.
          ex.sets.forEach((next, j) => { if (j > si && !next.done) next.w = set.w; });
        }
      });
      rerenderExercise(idx);
      refreshHeader();

      if (!before) {
        const ex = getActive().exercises[idx];
        haptic([14]);
        if (pr) celebratePR(S.prLabel(ex.id, pr));
        else beep('done');
        const remaining = ex.sets.some(s => !s.done);
        if (getState().settings.autoRest && remaining) {
          timer.start(ex.rest, EXERCISES[ex.id].short);
        }
      }
    }

    function finish(ctx) {
      const s = getActive();
      const anything = S.doneSets(s) > 0 || s.cardio.done;
      if (!anything) {
        if (!confirm('No has marcado ninguna serie. ¿Quieres guardar la sesión igualmente?')) return;
      }
      const finished = { ...s };
      finished.finishedAt = new Date().toISOString();
      finished.durationSec = Math.round((new Date(finished.finishedAt) - new Date(finished.startedAt)) / 1000);
      finished.exercises = finished.exercises.map(ex => ({ ...ex, sets: ex.sets.filter(x => x.done) }))
        .filter(ex => ex.sets.length > 0);
      finished.volume = S.sessionVolume(finished);
      finished.reps = S.sessionReps(finished);
      if (!finished.cardio.done) finished.cardio.minutes = 0;

      finishSession(finished);
      timer.stop();
      releaseAwake();
      clearInterval(clockId);

      const fresh = unlockAchievements(evaluate(S.globalStats()).filter(a => a.unlocked).map(a => a.id));
      sessionStorage.setItem('zurifit.fresh', JSON.stringify(fresh));
      location.hash = `#/resumen/${finished.id}`;
    }
  },

  unmounted() {
    clearInterval(clockId);
    releaseAwake();
  }
};
