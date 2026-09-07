import { PROGRAM, GUIDE, setsFor, cardioTarget, weeklyCardioGoal, dayById } from '../data/program.js';
import { EXERCISES, GROUPS, MATERIAL, CHECKLIST } from '../data/exercises.js';
import { programWeek, getDayExtras, addDayExtra, removeDayExtra } from '../store.js';
import { esc } from '../lib/dom.js';
import * as addex from './addex.js';

let tab = 'rutina';

function rutina(week) {
  return PROGRAM.map(day => {
    const t = cardioTarget(day, week);
    return `
    <section class="card card--day">
      <header class="card--day__head">
        <span class="card--day__emoji">${day.emoji}</span>
        <div>
          <h3>Día ${day.number} · ${esc(day.title)}</h3>
          <p class="card__meta">${esc(day.duration)} · incluye calentamiento y cardio</p>
        </div>
      </header>
      <table class="table table--day">
        <thead><tr><th>Ejercicio</th><th>Series</th><th>Desc.</th></tr></thead>
        <tbody>
          ${day.exercises.map(e => {
            const m = EXERCISES[e.id];
            const u = m.unit === 'time' ? 's' : '';
            return `<tr>
              <td><button class="linkbtn" data-ficha="${esc(e.id)}">${esc(m.name)}</button>${e.optional ? ' <i class="muted">(opcional)</i>' : ''}</td>
              <td>${setsFor(e, week)} × ${e.reps[0]}${e.reps[1] !== e.reps[0] ? `-${e.reps[1]}` : ''}${u}${m.perSide ? '/lado' : ''}</td>
              <td>${e.rest}s</td>
            </tr>`;
          }).join('')}
          ${getDayExtras(day.id).map(e => {
            const m = EXERCISES[e.id];
            const u = m.unit === 'time' ? 's' : '';
            return `<tr class="is-extra">
              <td><button class="linkbtn" data-ficha="${esc(e.id)}">${esc(m.name)}</button>
                  <span class="tagmine">tuyo</span></td>
              <td>${e.sets} × ${e.reps[0]}${e.reps[1] !== e.reps[0] ? `-${e.reps[1]}` : ''}${u}${m.perSide ? '/lado' : ''}</td>
              <td><button class="linkbtn linkbtn--del" data-del-extra="${esc(e.id)}" data-day="${esc(day.id)}"
                    aria-label="Quitar ${esc(m.short)} del día ${day.number}">quitar</button></td>
            </tr>`;
          }).join('')}
          <tr class="is-cardio">
            <td><button class="linkbtn" data-ficha="cardio-cinta">Cardio · ${esc(day.cardio.label)}</button></td>
            <td>${t[0] === t[1] ? t[0] : `${t[0]}-${t[1]}`} min</td>
            <td>${esc(day.cardio.intensity)}</td>
          </tr>
        </tbody>
      </table>
      <div class="btn-row">
        <a class="btn btn--soft" href="#/entreno/${day.id}">Entrenar este día</a>
        <button class="btn btn--soft" type="button" data-add-day="${day.id}" data-n="${day.number}">➕ Añadir ejercicio</button>
      </div>
    </section>`;
  }).join('');
}

function biblioteca() {
  return Object.entries(GROUPS).map(([g, label]) => {
    const items = Object.entries(EXERCISES).filter(([, m]) => m.group === g);
    const mine = g === 'propios';
    if (!items.length && !mine) return '';
    return `
    <section class="lib">
      <h3 class="section-title">${esc(label)}</h3>
      ${mine && !items.length
        ? '<p class="card__meta">Aquí aparecerán los ejercicios que crees tú. Puedes añadirlos desde cualquier día de la rutina o durante el entrenamiento.</p>'
        : ''}
      <div class="lib__grid">
        ${items.map(([id, m]) => `
          <button class="libcard${mine ? ' libcard--mine' : ''}" type="button" data-ficha="${esc(id)}">
            <b>${esc(m.short)}</b>
            <small>${esc(m.tag)}</small>
          </button>`).join('')}
        ${mine ? `<button class="libcard libcard--new" type="button" data-new-ex>
            <b>➕ Crear ejercicio</b>
            <small>con el nombre que quieras</small>
          </button>` : ''}
      </div>
    </section>`;
  }).join('');
}

function guia(week) {
  const goal = weeklyCardioGoal(week);
  return `
  <section class="card">
    <h3 class="section-title">La idea de esta rutina</h3>
    <p>${esc(GUIDE.intro)}</p>
    <p class="quote">💌 Tu novio te quiere muchísimo. Esta rutina está pensada para cuidarte y hacerte más fuerte, no para castigarte.</p>
  </section>

  <section class="card">
    <h3 class="section-title">Antes de empezar</h3>
    <ul class="ticks">${GUIDE.before.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
  </section>

  <section class="card">
    <h3 class="section-title">Cómo progresar sin complicarse</h3>
    <p>${esc(GUIDE.progression)}</p>
    <p class="example"><b>Ejemplo:</b> ${esc(GUIDE.progressionExample)}</p>
    <p class="card__meta">La app hace esta cuenta por ti: cuando toque subir peso, te avisa en el propio ejercicio.</p>
  </section>

  <section class="card">
    <h3 class="section-title">Cardio: cuánto y por qué</h3>
    <p><b>Intensidad:</b> ${esc(GUIDE.cardioIntensity)}</p>
    <p><b>Regla sencilla:</b> ${esc(GUIDE.cardioRule)}</p>
    <p><b>Objetivo de esta semana (semana ${week}):</b> ${goal[0]}-${goal[1]} minutos, ya incluidos en las cuatro sesiones. No hay que añadir otra sesión de cardio al final.</p>
  </section>

  <section class="card">
    <h3 class="section-title">Si el gimnasio está lleno</h3>
    <p>${esc(GUIDE.crowded)}</p>
  </section>

  <section class="card">
    <h3 class="section-title">Checklist antes de cada serie</h3>
    <ul class="ticks">${CHECKLIST.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </section>

  <section class="card">
    <h3 class="section-title">Material que se usa</h3>
    <ul class="ticks ticks--dot">${MATERIAL.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
  </section>

  <section class="card">
    <h3 class="section-title">Qué esperar</h3>
    <p>${esc(GUIDE.expect)}</p>
    <p class="quote">💌 El objetivo es que te sientas más fuerte y cómoda con tu cuerpo, no que te obsesiones con la báscula ni con hacer una semana perfecta.</p>
  </section>`;
}

export default {
  render() {
    const week = programWeek();
    return `
    <header class="topbar topbar--simple">
      <h1>Rutina</h1>
      <span class="pill">Semana ${week}</span>
    </header>
    <div class="tabs" role="tablist">
      ${[['rutina', 'Los 4 días'], ['ejercicios', 'Ejercicios'], ['guia', 'Guía']]
        .map(([k, l]) => `<button class="tab${tab === k ? ' is-on' : ''}" data-tab="${k}">${l}</button>`).join('')}
    </div>
    <div class="pad pad--flush">
      ${tab === 'rutina' ? rutina(week) : tab === 'ejercicios' ? biblioteca() : guia(week)}
    </div>`;
  },

  mounted(root, params, ctx) {
    root.addEventListener('click', ev => {
      const t = ev.target.closest('[data-tab]');
      if (t) { tab = t.dataset.tab; ctx.rerender(); return; }
      const del = ev.target.closest('[data-del-extra]');
      if (del) {
        const m = EXERCISES[del.dataset.delExtra];
        if (confirm(`¿Quitar «${m.short}» del Día ${dayById(del.dataset.day)?.number ?? ''}?`)) {
          removeDayExtra(del.dataset.day, del.dataset.delExtra);
          ctx.rerender();
        }
        return;
      }
      if (ev.target.closest('[data-new-ex]')) {
        addex.open({
          mode: 'library',
          taken: [],
          onAdd: (entry, dayTarget) => {
            if (dayTarget) addDayExtra(dayTarget, entry);
            ctx.rerender();
          }
        });
        return;
      }
      const add = ev.target.closest('[data-add-day]');
      if (add) {
        const dayId = add.dataset.addDay;
        const d = dayById(dayId);
        addex.open({
          mode: 'day',
          dayId,
          dayNumber: add.dataset.n,
          taken: [...d.exercises.map(e => e.id), ...getDayExtras(dayId).map(e => e.id)],
          onAdd: (entry, dayTarget) => { if (dayTarget) addDayExtra(dayTarget, entry); ctx.rerender(); }
        });
        return;
      }
      const f = ev.target.closest('[data-ficha]');
      if (f) ctx.openSheet(f.dataset.ficha);
    });
  }
};
